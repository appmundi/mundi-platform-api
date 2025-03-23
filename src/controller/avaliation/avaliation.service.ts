import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Avaliation } from "./entities/avaliation.entity"
import { Repository } from "typeorm"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { SchedulingService } from "../scheduling/scheduling.service"
import { AgendaStatus } from "../scheduling/entities/scheduling.entity"
import { User } from "../user/entities/user.entity"

@Injectable()
export class AvaliationService {
    constructor(
        @Inject("AVALIATION_REPOSITORY")
        private avaliationRepository: Repository<Avaliation>,
        private entrepreneurService: EntrepreneurService,
        private schedulingService: SchedulingService
    ) {}

    async createAvaliation(
        entrepreneurId: number,
        rating: number,
        comment: string,
        name: string,
        scheduleId: number,
        newStatus: AgendaStatus,
        userId: number
    ): Promise<Avaliation> {
        const entrepreneur = await this.entrepreneurService.getUserById(
            entrepreneurId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Entrepreneur ID ${entrepreneurId} não encontrado`
            )
        }

        const avaliation = new Avaliation()
        avaliation.rating = rating
        avaliation.comment = comment
        avaliation.name= name
        avaliation.entrepreneur = entrepreneur
        avaliation.userId = userId

        this.schedulingService.updateStatus(scheduleId, newStatus)

        return this.avaliationRepository.save(avaliation)
    }
    
}
