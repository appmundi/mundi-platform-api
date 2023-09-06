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
        return this.entrepreneurRepository.find({
            relations: ["avaliation", "work", "image"]
        })
    }

    async register(data: CreateEntrepreneurDto): Promise<ResultDto> {
        const payload = { sub: data.email, username: data.doc }

        const existingEmailUser = await this.entrepreneurRepository.findOne({
            where: { email: data.email }
        })

        if (existingEmailUser) {
            return <ResultDto>{
                status: false,
                mensagem: "Email já está em uso!"
            }
        }

        const existingDocUser = await this.entrepreneurRepository.findOne({
            where: { doc: data.doc }
        })

        if (existingDocUser) {
            return <ResultDto>{
                status: false,
                mensagem: "Cpf já está em uso!"
            }
        }
        if (data.address == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo endereco e obrigatorio!"
            }
        }

        if (data.companyName == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo nome da empresa e obrigatorio!"
            }
        }
        if (data.name == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo nome e obrigatorio!"
            }
        }

        if (data.addressNumber == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo numero de endereco e obrigatorio!"
            }
        }
        if (data.cep == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo cep e obrigatorio!"
            }
        }
        if (data.city == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo cidade e obrigatorio!"
            }
        }
        if (data.state == null) {
            return <ResultDto>{
                status: false,
                mensagem: "Campo estado e obrigatorio!"
            }
        }

        const entrepreneur = new Entrepreneur()
        entrepreneur.name = data.name
        entrepreneur.email = data.email
        entrepreneur.password = bcrypt.hashSync(data.password, 8)
        entrepreneur.doc = data.doc
        entrepreneur.phone = data.phone
        entrepreneur.category = data.category
        entrepreneur.companyName = data.companyName
        entrepreneur.optionwork = data.optionwork
        entrepreneur.address = data.address
        entrepreneur.addressNumber = data.addressNumber
        entrepreneur.cep = data.cep
        entrepreneur.city = data.city
        entrepreneur.state = data.state
        entrepreneur.deslocation = data.deslocation
        entrepreneur.valueDeslocation = data.valueDeslocation
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

    async findOne(category: string): Promise<Entrepreneur | undefined> {
        return this.entrepreneurRepository.findOne({ where: { category } })
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
        entrepreneur.companyName = updateUserDto.companyName
        entrepreneur.optionwork = updateUserDto.optionwork
        entrepreneur.address = updateUserDto.address
        entrepreneur.addressNumber = updateUserDto.addressNumber
        entrepreneur.cep = updateUserDto.cep
        entrepreneur.city = updateUserDto.city
        entrepreneur.state = updateUserDto.state
        entrepreneur.deslocation = updateUserDto.deslocation
        entrepreneur.valueDeslocation = updateUserDto.valueDeslocation
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
