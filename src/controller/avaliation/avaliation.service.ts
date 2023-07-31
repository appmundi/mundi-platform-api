import { Injectable, Inject } from "@nestjs/common"
import { CreateAvaliationDto } from "./dto/create-avaliation.dto"
import { Avaliation } from "./entities/avaliation.entity"
import { Repository } from "typeorm"
import { ResultDto } from "src/dto/result.dto"

@Injectable()
export class AvaliationService {
    constructor(
        @Inject("AVALIATION_REPOSITORY")
        private avaliationRepository: Repository<Avaliation>
    ) {}

    async findAll(id: number): Promise<Avaliation[]> {
        return this.avaliationRepository.find({ where: { id } })
    }

    async create(data: CreateAvaliationDto): Promise<ResultDto> {
        const avaliation = new Avaliation()
        avaliation.iduser = data.iduser
        avaliation.identrepreneur = data.identrepreneur
        avaliation.description = data.description
        avaliation.value = data.value
        return this.avaliationRepository
            .save(avaliation)
            .then(async (result) => {
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
}
