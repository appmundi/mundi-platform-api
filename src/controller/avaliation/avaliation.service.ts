import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Avaliation } from "./entities/avaliation.entity"
import { Repository } from "typeorm"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"

@Injectable()
export class AvaliationService {
    constructor(
        @Inject("AVALIATION_REPOSITORY")
        private avaliationRepository: Repository<Avaliation>,
        private entrepreneurService: EntrepreneurService
    ) {}

    async createAvaliation(
        freelancerId: number,
        rating: number,
        comment: string
    ): Promise<Avaliation> {
        const entrepreneur = await this.entrepreneurService.getUserById(
            freelancerId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Entrepreneur ID ${freelancerId} não encontrado`
            )
        }

        const avaliation = new Avaliation()
        avaliation.rating = rating
        avaliation.comment = comment
        avaliation.entrepreneur = entrepreneur

        return this.avaliationRepository.save(avaliation)
    }
}
