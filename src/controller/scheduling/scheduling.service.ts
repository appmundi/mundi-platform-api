import { Injectable, Inject } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { Schedule } from "./entities/scheduling.entity"

@Injectable()
export class SchedulingService {
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
        @Inject("SCHEDULE_REPOSITORY")
        private scheduleRepository: Repository<Schedule>
    ) {}

    async scheduleService(
        userId: number,
        entrepreneurId: number,
        scheduledDate: Date
    ) {
        const user = await this.userRepository.findOne({ where: { userId } })
        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })

        if (!user || !entrepreneur) {
            throw new Error("Usuário ou prestador de serviços não encontrado.")
        }
        const schedule = new Schedule()
        schedule.user = user
        schedule.entrepreneur = entrepreneur
        schedule.scheduledDate = scheduledDate

        await this.scheduleRepository.save(schedule)

        return "Agendamento criado com sucesso."
    }
}
