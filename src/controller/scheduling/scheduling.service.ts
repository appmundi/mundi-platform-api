import {
    Injectable,
    Inject,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Query
} from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import { Modality } from "../modality/entities/modality.entity"
import { DateTime } from "luxon"

@Injectable()
export class SchedulingService {
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
        @Inject("SCHEDULE_REPOSITORY")
        private scheduleRepository: Repository<Schedule>,
        @Inject("MODALITY_REPOSITORY")
        private modalityRepository: Repository<Modality>
    ) {}

    async isTimeSlotAvailable(
        entrepreneurId: number,
        scheduledDate: Date
    ): Promise<boolean> {
        const existingSchedule = await this.scheduleRepository.findOne({
            where: {
                entrepreneur: { entrepreneurId },
                scheduledDate
            }
        })

        return !existingSchedule
    }

    async updateStatus(id: number, newStatus: AgendaStatus): Promise<Schedule> {
        console.log("Trying to find the Schedule")
        const agenda = await this.scheduleRepository.findOne({ where: { id } })

        if (!agenda) {
            throw new NotFoundException(`Agenda with ID ${id} not found`)
        }

        agenda.status = newStatus
        console.log("Trying to update the Schedule")
        return this.scheduleRepository.save(agenda)
    }

    async scheduleService(
        userId: number,
        id: number,
        entrepreneurId: number,
        scheduledDate: Date,
        timeSlot: string
    ) {
        const user = await this.userRepository.findOne({ where: { userId } })

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })

        const modality = await this.modalityRepository.findOne({
            where: { id }
        })

        if (!user || !entrepreneur) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuário ou prestador de serviços não encontrado."
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const scheduledDateTime = new Date(scheduledDate)
        const [hours, minutes] = timeSlot.split(":").map(Number)
        scheduledDateTime.setHours(hours, minutes, 0, 0)

        const isAvailable = await this.isTimeSlotAvailable(
            entrepreneurId,
            scheduledDate
        )
        if (!isAvailable) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Horário já agendado."
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const schedule = new Schedule()
        schedule.user = user
        schedule.entrepreneur = entrepreneur
        schedule.scheduledDate = scheduledDate
        schedule.modality = modality

        await this.scheduleRepository.save(schedule)

        return "Agendamento criado com sucesso."
    }

    async deleteSchedule(id: number): Promise<string> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id }
        })

        if (!schedule) {
            throw new Error("Agendamento não encontrado.")
        }

        await this.scheduleRepository.remove(schedule)

        return "Agendamento excluído com sucesso."
    }

    async findAllSchedules(): Promise<Schedule[]> {
        return await this.scheduleRepository.find()
    }

    async findByUserId(userId: number): Promise<Schedule[]> {
        return await this.scheduleRepository.find({
            relations: ["entrepreneur", "user", "modality"],
            where: { user: { userId } }
        })
    }

    async findByEntrepreneurId(entrepreneurId: number): Promise<Schedule[]> {
        return await this.scheduleRepository.find({
            relations: ["entrepreneur", "user", "modality"],
            where: { entrepreneur: { entrepreneurId } }
        })
    }

    async cancelSchedule(
        scheduleId: number,
        userId: number
    ): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: ["user", "entrepreneur"]
        })

        if (!schedule) {
            throw new Error("Agendamento não encontrado")
        }

        if (
            schedule.user.userId !== userId &&
            schedule.entrepreneur.entrepreneurId !== userId
        ) {
            throw new Error(
                "Usuário não tem permissão para cancelar este agendamento"
            )
        }

        schedule.status = AgendaStatus.CANCELED
        return await this.scheduleRepository.save(schedule)
    }

    async isTimeAvailable(
        entrepreneurId: number,
        scheduledDate: Date
    ): Promise<boolean> {
        const scheduledAppointments = await this.findByEntrepreneurId(
            entrepreneurId
        )

        const isTimeSlotTaken = scheduledAppointments.some((schedule) => {
            const existingScheduledDate = new Date(schedule.scheduledDate)
            return existingScheduledDate.getTime() === scheduledDate.getTime()
        })

        return !isTimeSlotTaken
    }

    async getAvailableTimes(
        entrepreneurId: number,
        date: string
    ): Promise<string[]> {
        const dateObj = DateTime.fromISO(date, { setZone: "America/Sao_Paulo" })

        const scheduledAppointments = await this.findByEntrepreneurId(
            entrepreneurId
        )

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })

        if (!entrepreneur) {
            throw new Error("Entrepreneur not found")
        }

        const operationHours = Array.isArray(entrepreneur.operation)
            ? entrepreneur.operation
            : JSON.parse(entrepreneur.operation as unknown as string)

        const dayOfWeek = dateObj
            .toFormat("cccc", { locale: "pt-BR" })
            .trim()
            .toLowerCase()
        //console.log('Dia da semana:', dayOfWeek);

        const todayOperation = operationHours.find((op: any) => {
            return op.day.trim().toLowerCase() === dayOfWeek && op.isActive
        })

        console.log("Operação de hoje:", todayOperation)

        if (!todayOperation) {
            // console.log('Nenhuma operação ativa para hoje.');
            return []
        }

        const workingHours = this.generateWorkingHours(
            todayOperation.openinHours,
            todayOperation.closingTime
        )

        const occupiedTimes = scheduledAppointments
            .filter((schedule) => {
                const scheduledDate = DateTime.fromISO(schedule.scheduledDate.toISOString(), {
                    zone: "utc"
                });
                console.log(scheduledDate);
                return scheduledDate.toISODate() === dateObj.toISODate()
            })
            .map((schedule) =>
                DateTime.fromISO(schedule.scheduledDate.toISOString()).toFormat("HH:mm")
            )

        console.log("Horários ocupados:", occupiedTimes)

        const availableTimes = workingHours.filter(
            (time) => !occupiedTimes.includes(time)
        )
        console.log("Horários disponíveis:", availableTimes)

        return availableTimes
    }

    private generateWorkingHours(
        openingTime: string,
        closingTime: string
    ): string[] {
        const hours: string[] = []
        let currentTime = DateTime.fromFormat(openingTime, "HH:mm")
        const closingTimeObj = DateTime.fromFormat(closingTime, "HH:mm")

        while (currentTime <= closingTimeObj) {
            hours.push(currentTime.toFormat("HH:mm"))
            currentTime = currentTime.plus({ minutes: 30 })
        }

        return hours
    }
}
