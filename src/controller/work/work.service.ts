import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Work } from "./entities/work.entity"
import { Repository } from "typeorm"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"

@Injectable()
export class WorkService {
    constructor(
        @Inject("WORK_REPOSITORY")
        private workRepository: Repository<Work>,
        private entrepreneurService: EntrepreneurService
    ) { }

    async createWork(
        freelancerId: number,
        service: string,
    ): Promise<Work> {
        const entrepreneur = await this.entrepreneurService.getUserById(
            freelancerId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Entrepreneur ID ${freelancerId} não encontrado`
            )
        }

        const work = new Work()
        work.service = service
        work.entrepreneur = entrepreneur

        return this.workRepository.save(work)
    }

    async findWork(id: number): Promise<Work> {
        return await this.workRepository.findOne({ where: { id: id } })
    }

    async findWorks(id: number): Promise<Work> {
        return await this.workRepository.findOne({ where: { id: id } })
    } 

}
