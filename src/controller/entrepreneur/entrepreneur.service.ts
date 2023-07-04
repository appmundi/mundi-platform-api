import { Injectable, Inject } from "@nestjs/common"
import { ResultDto } from "src/dto/result.dto"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { Repository } from "typeorm"
import { JwtService } from "@nestjs/jwt"

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
        entrepreneur.doc = data.doc
        entrepreneur.phone = data.phone
        entrepreneur.category = data.category
        entrepreneur.profession = data.profession
        entrepreneur.optionwork = data.optionwork
        entrepreneur.localization = data.localization
        entrepreneur.deslocation = data.deslocation
        entrepreneur.monday = data.monday
        entrepreneur.tuesday = data.tuesday
        entrepreneur.wednesday = data.wednesday
        entrepreneur.thursday = data.thursday
        entrepreneur.friday = data.friday
        entrepreneur.saturday = data.saturday
        entrepreneur.sunday = data.sunday
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
}
