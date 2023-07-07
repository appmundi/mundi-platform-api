import { Injectable, Inject } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"
import * as bcrypt from "bcrypt"
import * as geoip from "geoip-lite"

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
}
