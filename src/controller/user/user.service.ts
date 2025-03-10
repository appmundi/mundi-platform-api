import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"
import * as bcrypt from "bcrypt"
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ["schedulling"]
        })
    }

    async register(data: CreateUserDto): Promise<ResultDto> {
        if (data.password.length < 5) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo senha tem que ter no minimo 5 caracter!"
            }
        }

        const existingEmailUser = await this.userRepository.findOne({
            where: { email: data.email }
        })

        if (existingEmailUser) {
            throw new HttpException(
                {
                    status: false,
                    mensagem: "Email já está em uso!"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const existingDocUser = await this.userRepository.findOne({
            where: { doc: data.doc }
        })

        if (existingDocUser) {
            throw new HttpException(
                {
                    status: false,
                    mensagem: "Cpf já está em uso!"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        if (data.name == null) {
            throw new HttpException(
                {
                    status: false,
                    mensagem: "Campo nome é obrigatorio!"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        if (data.phone == null) {
            throw new HttpException(
                {
                    status: false,
                    mensagem: "Campo telefone é obrigatorio!"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const user = new User()
        user.name = data.name
        user.email = data.email
        user.password = bcrypt.hashSync(data.password, 8)
        user.doc = data.doc
        user.phone = data.phone
        user.address = data.address
        user.addressNumber = data.addressNumber
        user.cep = data.cep
        user.city = data.city
        user.state = data.state
        //user.date = data.date
        return this.userRepository
            .save(user)
            .then((result) => {
                return <ResultDto>{
                    status: true,
                    mensagem: "Cadastro feito com sucesso!",
                    userId: result.userId
                }
            })
            .catch((error) => {
                return <ResultDto>{
                    status: false,
                    mensagem: "Erro ao cadastrar!"
                }
            })
    }

    async findOne(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email } })
    }

    async getUserById(userId: number): Promise<User | undefined> {
        return this.userRepository.findOne({
            where: { userId },
            relations: ["schedulling"]
        })
    }

    async updateUser(userId: number, updateUserDto: User): Promise<User> {
        const user = await this.getUserById(userId)
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuario nao encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        user.name = updateUserDto.name
        user.email = updateUserDto.email
        user.password = updateUserDto.password
        user.doc = updateUserDto.doc
        user.phone = updateUserDto.phone
        user.address = updateUserDto.address
        user.addressNumber = updateUserDto.addressNumber
        user.cep = updateUserDto.cep
        user.city = updateUserDto.city
        user.state = updateUserDto.state
        return this.userRepository.save(user)
    }

    async deleteUser(userId: number): Promise<void> {
        const user = await this.getUserById(userId)
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuario nao encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        await this.userRepository.remove(user)
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } })
    }

    async findOneByCpf(doc: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { doc } })
    }

    async findOneByUserId(userId: number): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { userId } })
    }

    generateResetCode(): string {
        return randomBytes(4).toString('hex').toUpperCase(); 
    }

    async setResetPasswordCode(email: string, code: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }

        user.resetPasswordCode = code;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora de expiração
        await this.userRepository.save(user);
    }

    async validateResetPasswordCode(email: string, code: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || user.resetPasswordCode !== code || user.resetPasswordExpires < new Date()) {
            return false;
        }
        return true;
    }

    async clearResetPasswordCode(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            user.resetPasswordCode = null;
            user.resetPasswordExpires = null;
            await this.userRepository.save(user);
        }
    }

    
}
