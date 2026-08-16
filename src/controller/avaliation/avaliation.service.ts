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
        entrepreneurId: number,
        rating: number,
        comment: string,
        name: string,
        scheduleId: number,
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

        // Uma avaliação por cliente/estabelecimento: devolve a existente em vez
        // de criar duplicata, seja o mesmo agendamento ou qualquer outro do
        // mesmo empreendedor. O chamador segue finalizando o agendamento.
        const existing = await this.avaliationRepository.findOne({
            where: [
                ...(scheduleId ? [{ scheduleId }] : []),
                { userId, entrepreneur: { entrepreneurId } }
            ]
        })
        if (existing) {
            return existing
        }

        const avaliation = new Avaliation()
        avaliation.rating = rating
        avaliation.comment = comment
        avaliation.name = name
        avaliation.entrepreneur = entrepreneur
        avaliation.userId = userId
        avaliation.scheduleId = scheduleId ?? null

        return this.avaliationRepository.save(avaliation)
    }

}
