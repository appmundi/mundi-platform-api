import { Injectable, Inject, HttpStatus, HttpException } from "@nestjs/common"
import { ResultDto } from "src/dto/result.dto"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { Repository } from "typeorm"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"

@Injectable()
export class EntrepreneurService {
    constructor(
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
        private jwtService: JwtService
    ) {}

    async findAll(): Promise<Entrepreneur[]> {
        return this.entrepreneurRepository.find()
    }

    async register(data: CreateEntrepreneurDto): Promise<ResultDto> {
        const payload = { sub: data.email, username: data.doc }
        const entrepreneur = new Entrepreneur()
        entrepreneur.name = data.name
        entrepreneur.email = data.email
        entrepreneur.password = bcrypt.hashSync(data.password, 8)
        entrepreneur.doc = data.doc
        entrepreneur.phone = data.phone
        entrepreneur.category = data.category
        entrepreneur.profession = data.profession
        entrepreneur.optionwork = data.optionwork
        entrepreneur.localization = data.localization
        entrepreneur.deslocation = data.deslocation
        entrepreneur.operation = data.opration
        entrepreneur.status = data.status
        return this.entrepreneurRepository
            .save(entrepreneur)
            .then(async (result) => {
                return <ResultDto>{
                    status: true,
                    mensagem: "Cadastro feito com sucesso!",
                    access_token: await this.jwtService.sign(payload)
                }
            })
            .catch((error) => {
                return <ResultDto>{
                    status: false,
                    mensagem: "Erro ao cadastrar!"
                }
            })
    }

    async findOne(profession: string): Promise<Entrepreneur | undefined> {
        return this.entrepreneurRepository.findOne({ where: { profession } })
    }

    async getUserById(
        entrepreneurId: number
    ): Promise<Entrepreneur | undefined> {
        return this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })
    }

    async updateUser(
        entrepreneurId: number,
        updateUserDto: Entrepreneur
    ): Promise<Entrepreneur> {
        const entrepreneur = await this.getUserById(entrepreneurId)
        if (!entrepreneur) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuario nao encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        entrepreneur.name = updateUserDto.name
        entrepreneur.email = updateUserDto.email
        entrepreneur.password = updateUserDto.password
        entrepreneur.doc = updateUserDto.doc
        entrepreneur.phone = updateUserDto.phone
        entrepreneur.category = updateUserDto.category
        entrepreneur.profession = updateUserDto.profession
        entrepreneur.optionwork = updateUserDto.optionwork
        entrepreneur.localization = updateUserDto.localization
        entrepreneur.deslocation = updateUserDto.deslocation
        entrepreneur.operation = updateUserDto.operation
        return this.entrepreneurRepository.save(entrepreneur)
    }

    async deleteUser(entrepreneurId: number): Promise<void> {
        const entrepreneur = await this.getUserById(entrepreneurId)
        if (!entrepreneur) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuario nao encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        await this.entrepreneurRepository.remove(entrepreneur)
    }
}
