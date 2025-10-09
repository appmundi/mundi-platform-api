import {
    Injectable,
    Inject,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Query
} from "@nestjs/common"
import { Repository, In, Between } from "typeorm"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import { Modality } from "../modality/entities/modality.entity"
import { DateTime } from "luxon"
import { Avaliation } from "../avaliation/entities/avaliation.entity"

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
        private modalityRepository: Repository<Modality>,
        @Inject("AVALIATION_REPOSITORY")
        private avaliationRepository: Repository<Avaliation>
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

        if (newStatus == AgendaStatus.FEEDBACK) {
            const avaliation = await this.avaliationRepository.find({
                where: {
                    userId: agenda.user.userId,
                    entrepreneur: {
                        entrepreneurId: agenda.entrepreneur.entrepreneurId
                    }
                }
            })

            if (avaliation.length > 0) {
                agenda.status == AgendaStatus.FINISHED
                return this.scheduleRepository.save(agenda)
            }
        }

        agenda.status = newStatus
        console.log("Trying to update the Schedule")
        return this.scheduleRepository.save(agenda)
    }

    async scheduleService(
        userId: number,
        ids: number[],
        entrepreneurId: number,
        scheduledDate: Date,
        timeSlot: string,
        description: string,
        address?:
            | {
                  number: string
                  zipCode: string
                  complement: string
              }
            | undefined
    ) {
        const [user, entrepreneur, modalities] = await Promise.all([
            this.userRepository.findOne({ where: { userId } }),
            this.entrepreneurRepository.findOne({ where: { entrepreneurId } }),
            this.modalityRepository.find({ where: { id: In(ids) } })
        ])

        if (!user || !entrepreneur) {
            throw new Error("Usuário ou prestador de serviços não encontrado.")
        }

        if (!modalities || modalities.length === 0) {
            throw new Error("Modalidades não encontradas.")
        }

        const baseDateTime = new Date(scheduledDate)
        if (isNaN(baseDateTime.getTime())) {
            throw new Error("Data de agendamento inválida.")
        }

        const orderedModalities = ids
            .map((id) => modalities.find((modality) => modality.id === id))
            .filter(Boolean)

        let currentDateTime = new Date(baseDateTime)
        const createdSchedules = []

        for (const modality of orderedModalities) {
            const isAvailable = await this.isTimeSlotAvailable(
                entrepreneurId,
                currentDateTime
            )

            if (!isAvailable) {
                if (createdSchedules.length > 0) {
                    await this.scheduleRepository.remove(createdSchedules)
                }
                throw new Error(
                    `Horário ${currentDateTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })} não está disponível para o serviço "${modality.title}".`
                )
            }

            const schedule = new Schedule()
            schedule.user = user
            schedule.entrepreneur = entrepreneur
            schedule.scheduledDate = new Date(currentDateTime)
            schedule.description = description
            schedule.modality = modality
            schedule.addressNumber = address?.number
            schedule.addressZipCode = address?.zipCode
            schedule.addressComplement = address?.complement

            const savedSchedule = await this.scheduleRepository.save(schedule)
            createdSchedules.push(savedSchedule)

            currentDateTime = new Date(
                currentDateTime.getTime() + modality.duration * 1000
            )
        }

        return {
            message: "Agendamentos criados com sucesso.",
            schedules: createdSchedules.map((schedule) => ({
                id: schedule.id,
                modalityName: schedule.modality.name,
                scheduledTime: schedule.scheduledDate.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),
                duration: schedule.modality.duration
            }))
        }
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
        date: string,
        duration: number
    ): Promise<string[]> {
        const dateObj: DateTime = DateTime.fromISO(date, {
            setZone: "America/Sao_Paulo"
        })

        const startOfDay = DateTime.fromISO(date, { zone: "utc" })
            .startOf("day")
            .toUTC()
            .toJSDate()
        const endOfDay = DateTime.fromISO(date, { zone: "utc" })
            .endOf("day")
            .toUTC()
            .toJSDate()

        const scheduledAppointments = await this.scheduleRepository.find({
            where: {
                entrepreneur: { entrepreneurId: entrepreneurId },
                scheduledDate: Between(startOfDay, endOfDay)
            },
            relations: {
                modality: true,
            }
        })

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

        const todayOperation = operationHours.find((op: any) => {
            return op.day.trim().toLowerCase() === dayOfWeek && op.isActive
        })

        if (!todayOperation) {
            return []
        }

        const workingHours = this.generateWorkingHours(
            todayOperation.openinHours,
            todayOperation.closingTime
        )

        const occupiedTimes = scheduledAppointments.flatMap((schedule) => {
            const start = DateTime.fromISO(schedule.scheduledDate.toISOString());
            const end = start.plus({ seconds: schedule.modality.duration });

            const times = [];
            let current = start;
            console.log(start, end);
            console.log(current);
            while (current < end) {
                times.push(current.toFormat("HH:mm"));
                current = current.plus({ minutes: 30 });
            }

            return times;
        });

        const blockSize = duration / 30
        const availableTimes: string[] = []

        for (let i = 0; i <= workingHours.length - blockSize; i++) {
            const timeBlock = workingHours.slice(i, i + blockSize)
            const isBlockFree = timeBlock.every(
                (time) => !occupiedTimes.includes(time)
            )
            if (isBlockFree) {
                const [hour, minute] = timeBlock[0].split(":").map(Number)
                const blockStartTime = dateObj.set({ hour, minute })

                const now = DateTime.now().setZone("America/Sao_Paulo")
                if (
                    dateObj.toISODate() !== now.toISODate() ||
                    blockStartTime > now
                ) {
                    availableTimes.push(timeBlock[0])
                }
            }
        }

        return availableTimes
    }

    private generateWorkingHours(
        openingTime: string,
        closingTime: string
    ): string[] {
        const hours: string[] = []
        let currentTime = DateTime.fromFormat(
            openingTime.padStart(5, "0"),
            "HH:mm"
        )
        const closingTimeObj = DateTime.fromFormat(
            closingTime.padStart(5, "0"),
            "HH:mm"
        )

        while (currentTime <= closingTimeObj) {
            hours.push(currentTime.toFormat("HH:mm"))
            currentTime = currentTime.plus({ minutes: 30 })
        }

        return hours
    }
}
