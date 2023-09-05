import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"
import * as bcrypt from "bcrypt"

@Injectable()
export class UserService {
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find()
    }

    async register(data: CreateUserDto): Promise<ResultDto> {
        const existingEmailUser = await this.userRepository.findOne({
            where: { email: data.email }
        })

        if (existingEmailUser) {
            return <ResultDto>{
                status: false,
                mensagem: "Email já está em uso!"
            }
        }

        const existingDocUser = await this.userRepository.findOne({
            where: { doc: data.doc }
        })

        if (existingDocUser) {
            return <ResultDto>{
                status: false,
                mensagem: "Cpf já está em uso!"
            }
        }
        if (data.password.length < 5) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo senha tem que ter no minimo 5 caracter!"
            }
        }

        const user = new User()
        user.name = data.name
        user.email = data.email
        user.password = bcrypt.hashSync(data.password, 8)
        user.doc = data.doc
        user.phone = data.phone
        return this.userRepository
            .save(user)
            .then((result) => {
                return <ResultDto>{
                    status: true,
                    mensagem: "Cadastro feito com sucesso!"
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
        return this.userRepository.findOne({ where: { userId } })
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
}
