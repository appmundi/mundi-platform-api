import { Injectable, Inject } from "@nestjs/common"
import { ResultDto } from "src/dto/result.dto"
import { CreateServiceDto } from "./dto/create-service.dto"
import { Service } from "./entities/service.entity"
import { Repository } from "typeorm"

@Injectable()
export class ServicesService {
    constructor(
        @Inject("SERVICE_REPOSITORY")
        private serviceRepository: Repository<Service>
    ) {}

    async findAll(): Promise<Service[]> {
        return this.serviceRepository.find()
    }

    async register(data: CreateServiceDto): Promise<ResultDto> {
        const service = new Service()
        service.name = data.name
        service.profession = data.profession
        service.optionwork = data.optionwork
        service.phone = data.phone
        service.cep = data.cep
        service.status = data.status
        return this.serviceRepository
            .save(service)
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

    async findOne(profession: string): Promise<Service | undefined> {
        return this.serviceRepository.findOne({ where: { profession } })
    }
}
