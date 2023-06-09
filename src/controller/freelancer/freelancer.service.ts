import { Inject, Injectable } from "@nestjs/common"
import { ResultDto } from "src/dto/result.dto"
import { freelancer_register } from "./entities/freelancer.entity"
import { CreateFreelancerDto } from "./dto/create-freelancer.dto"
import { Repository } from "typeorm"

@Injectable()
export class FreelancerService {
    constructor(
        @Inject("FREELANCER_REPOSITORY")
        private freelancerRepository: Repository<freelancer_register>
    ) {}

    async findAll(): Promise<freelancer_register[]> {
        return this.freelancerRepository.find()
    }

    async register(data: CreateFreelancerDto): Promise<ResultDto> {
        const freelancer = new freelancer_register()
        freelancer.name = data.name
        freelancer.email = data.email
        freelancer.password = data.password
        freelancer.doc = data.doc
        freelancer.phone = data.phone
        freelancer.profession = data.profession
        return this.freelancerRepository
            .save(freelancer)
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
}
