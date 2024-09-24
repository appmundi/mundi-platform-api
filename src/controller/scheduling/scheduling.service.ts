import {
    Injectable,
    Inject,
    HttpException,
    HttpStatus,
    NotFoundException
} from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import { Modality } from "../modality/entities/modality.entity"

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
       
        const scheduledDateTime = new Date(scheduledDate);
    const [hours, minutes] = timeSlot.split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

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


    async isTimeAvailable(entrepreneurId: number, scheduledDate: Date): Promise<boolean> {
        const scheduledAppointments = await this.findByEntrepreneurId(entrepreneurId);
        
        const isTimeSlotTaken = scheduledAppointments.some(schedule => {
            const existingScheduledDate = new Date(schedule.scheduledDate);
            return existingScheduledDate.getTime() === scheduledDate.getTime();
        });
    
        return !isTimeSlotTaken; 
    }


    async getAvailableTimes(entrepreneurId: number, date: Date): Promise<string[]> {
      
        const scheduledAppointments = await this.findByEntrepreneurId(entrepreneurId);
       
        const workingHours = [
            "07:00",
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
            "19:00"
        ];
    
        const occupiedTimes = scheduledAppointments
            .filter(schedule => {
                const scheduledDate = new Date(schedule.scheduledDate);
                return scheduledDate.toDateString() === date.toDateString();
            })
            .map(schedule => {
                return new Date(schedule.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });
    
        return workingHours.filter(time => !occupiedTimes.includes(time));
    }
}
