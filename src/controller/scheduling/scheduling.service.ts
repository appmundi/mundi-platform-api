import {
    Injectable,
    Inject,
    HttpException,
    HttpStatus,
    Logger,
    NotFoundException,
    Optional
} from "@nestjs/common"
import { Repository, In, Between, Not } from "typeorm"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import { Modality } from "../modality/entities/modality.entity"
import { DateTime } from "luxon"
import { Avaliation } from "../avaliation/entities/avaliation.entity"
import { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class SchedulingService {
    private readonly logger = new Logger(SchedulingService.name)

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
        private avaliationRepository: Repository<Avaliation>,
        @Optional()
        private readonly notificationsService?: NotificationsService
    ) {
        if (!notificationsService) {
            this.logger.warn("NotificationsService not injected — push notifications disabled")
        }
    }

    /**
     * Retorna true se [start, end) colide com algum agendamento ativo (não cancelado)
     * do empreendedor. Um agendamento existente ocupa
     * [scheduledDate, scheduledDate + modality.duration segundos).
     */
    async hasTimeConflict(
        entrepreneurId: number,
        start: Date,
        end: Date
    ): Promise<boolean> {
        const windowStart = new Date(start.getTime() - 24 * 60 * 60 * 1000)
        const candidates = await this.scheduleRepository.find({
            where: {
                entrepreneur: { entrepreneurId },
                scheduledDate: Between(windowStart, end),
                status: Not(AgendaStatus.CANCELED)
            },
            relations: { modality: true }
        })

        return candidates.some((s) => {
            const existingStart = new Date(s.scheduledDate).getTime()
            const durationMs = (s.modality?.duration ?? 0) * 1000
            const existingEnd = existingStart + durationMs
            return start.getTime() < existingEnd && end.getTime() > existingStart
        })
    }

    async updateStatus(
        id: number,
        newStatus: AgendaStatus,
        caller?: { id: number; role?: "user" | "entrepreneur" }
    ): Promise<Schedule> {
        this.logger.debug("Trying to find the Schedule")
        const agenda = await this.scheduleRepository.findOne({
            where: { id },
            relations: {
                entrepreneur: true,
                user: true,
                modality: true
            }
        })

        if (!agenda) {
            throw new NotFoundException(`Agenda with ID ${id} not found`)
        }

        // Estados terminais não mudam mais.
        if (
            agenda.status === AgendaStatus.CANCELED ||
            agenda.status === AgendaStatus.FINISHED
        ) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: `Agendamento já encerrado com status: ${agenda.status}`
                },
                HttpStatus.CONFLICT
            )
        }

        // Empreendedor só mexe nos próprios agendamentos (tokens antigos, sem role, pulam o check).
        if (
            caller?.role === "entrepreneur" &&
            agenda.entrepreneur.entrepreneurId !== caller.id
        ) {
            throw new HttpException(
                {
                    status: HttpStatus.FORBIDDEN,
                    error: "Acesso negado a este agendamento"
                },
                HttpStatus.FORBIDDEN
            )
        }

        if (newStatus == AgendaStatus.FEEDBACK) {
            // O cliente avalia um estabelecimento uma única vez: se já existe
            // avaliação dele para este empreendedor (deste ou de qualquer
            // agendamento anterior), o serviço vai direto para FINISHED e o app
            // nunca chega a abrir o modal.
            const alreadyRated = await this.avaliationRepository.count({
                where: [
                    { scheduleId: agenda.id },
                    {
                        userId: agenda.user.userId,
                        entrepreneur: {
                            entrepreneurId: agenda.entrepreneur.entrepreneurId
                        }
                    }
                ]
            })

            // Either way the service is over for the client, so always send the
            // "finished" step — this replaces the ongoing "started" notification
            // on their device (which is locked and can't be dismissed otherwise).
            agenda.status =
                alreadyRated > 0
                    ? AgendaStatus.FINISHED
                    : AgendaStatus.FEEDBACK
            const saved = await this.scheduleRepository.save(agenda)
            await this.notificationsService?.notifyServiceStep(
                agenda.user.userId,
                "finished",
                {
                    scheduleId: id,
                    providerName: agenda.entrepreneur.name,
                    modalityTitle: agenda.modality?.title ?? ""
                }
            )
            return saved
        }

        agenda.status = newStatus
        this.logger.debug("Trying to update the Schedule")
        const saved = await this.scheduleRepository.save(agenda)

        if (newStatus === AgendaStatus.STARTED) {
            await this.notificationsService?.notifyServiceStep(
                agenda.user.userId,
                "started",
                {
                    scheduleId: id,
                    providerName: agenda.entrepreneur.name,
                    modalityTitle: agenda.modality?.title ?? ""
                }
            )
        } else if (newStatus === AgendaStatus.FINISHED) {
            await this.notificationsService?.notifyServiceStep(
                agenda.user.userId,
                "finished",
                {
                    scheduleId: id,
                    providerName: agenda.entrepreneur.name,
                    modalityTitle: agenda.modality?.title ?? ""
                }
            )
        }

        return saved
    }

    async scheduleService(
        userId: number,
        ids: number[],
        entrepreneurId: number,
        scheduledDate: Date,
        description: string,
        address?:
            | {
                  number: string
                  zipCode: string
                  complement: string
                  street?: string
                  neighborhood?: string
                  city?: string
                  state?: string
              }
            | undefined
    ) {
        const [user, entrepreneur, modalities] = await Promise.all([
            this.userRepository.findOne({ where: { userId } }),
            this.entrepreneurRepository.findOne({ where: { entrepreneurId } }),
            this.modalityRepository.find({ where: { id: In(ids) } })
        ])

        if (!user || !entrepreneur) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: "Usuário ou prestador de serviços não encontrado."
                },
                HttpStatus.NOT_FOUND
            )
        }

        if (!modalities || modalities.length === 0) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: "Modalidades não encontradas."
                },
                HttpStatus.NOT_FOUND
            )
        }

        const baseDateTime = new Date(scheduledDate)
        if (isNaN(baseDateTime.getTime())) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Data de agendamento inválida."
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const orderedModalities = ids
            .map((id) => modalities.find((modality) => modality.id === id))
            .filter(Boolean)

        // Transação: ou todos os serviços da reserva são criados, ou nenhum.
        const createdSchedules = await this.scheduleRepository.manager.transaction(
            async (manager) => {
                let currentDateTime = new Date(baseDateTime)
                const created: Schedule[] = []

                for (const modality of orderedModalities) {
                    const slotEnd = new Date(
                        currentDateTime.getTime() + modality.duration * 1000
                    )

                    const conflict = await this.hasTimeConflict(
                        entrepreneurId,
                        currentDateTime,
                        slotEnd
                    )
                    if (conflict) {
                        throw new HttpException(
                            {
                                status: HttpStatus.CONFLICT,
                                error: `Horário ${currentDateTime.toLocaleTimeString(
                                    "pt-BR",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone: "America/Sao_Paulo"
                                    }
                                )} não está disponível para o serviço "${modality.title}".`
                            },
                            HttpStatus.CONFLICT
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
                    schedule.addressStreet = address?.street
                    schedule.addressNeighborhood = address?.neighborhood
                    schedule.addressCity = address?.city
                    schedule.addressState = address?.state

                    created.push(await manager.save(schedule))
                    currentDateTime = slotEnd
                }

                return created
            }
        )

        // Notifica o empreendedor (nunca derruba a request — falhas de push são engolidas
        // dentro de NotificationsService).
        if (createdSchedules.length > 0) {
            const serviceName =
                orderedModalities.length > 1
                    ? `${orderedModalities[0].title} +${orderedModalities.length - 1}`
                    : orderedModalities[0]?.title ?? "Serviço"

            await this.notificationsService?.notifyNewBooking(entrepreneurId, {
                scheduleId: createdSchedules[0].id,
                serviceName,
                clientName: user.name,
                appointmentDatetime: baseDateTime
            })
        }

        return {
            message: "Agendamentos criados com sucesso.",
            schedules: createdSchedules.map((schedule) => ({
                id: schedule.id,
                modalityName: schedule.modality.title,
                scheduledTime: schedule.scheduledDate.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Sao_Paulo"
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
        callerId: number,
        cancellerType?: "user" | "entrepreneur",
        callerName?: string
    ): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: ["user", "entrepreneur", "modality"]
        })

        if (!schedule) {
            throw new Error("Agendamento não encontrado")
        }

        if (
            schedule.status === AgendaStatus.CANCELED ||
            schedule.status === AgendaStatus.FINISHED
        ) {
            throw new Error(
                `Agendamento já encerrado com status: ${schedule.status}`
            )
        }

        // user and entrepreneur IDs come from independent sequences and can
        // collide (both can be 1), so id comparison alone can't tell who
        // cancelled. Prefer the explicit role sent by the app; fall back to
        // matching the JWT name for older builds.
        let cancelledByUser: boolean
        if (cancellerType === "user" || cancellerType === "entrepreneur") {
            cancelledByUser = cancellerType === "user"
        } else if (callerName && schedule.entrepreneur.name === callerName) {
            cancelledByUser = false
        } else if (callerName && schedule.user.name === callerName) {
            cancelledByUser = true
        } else {
            cancelledByUser = schedule.user.userId === callerId
        }

        const belongsToCaller =
            schedule.user.userId === callerId ||
            schedule.entrepreneur.entrepreneurId === callerId
        if (!belongsToCaller) {
            throw new Error(
                "Usuário não tem permissão para cancelar este agendamento"
            )
        }

        schedule.status = AgendaStatus.CANCELED
        const saved = await this.scheduleRepository.save(schedule)

        // Notify the OTHER party
        if (cancelledByUser) {
            await this.notificationsService?.notifyCancellation(
                "entrepreneur",
                schedule.entrepreneur.entrepreneurId,
                {
                    scheduleId,
                    serviceName: schedule.modality?.title ?? "Serviço",
                    cancellerName: schedule.user.name,
                    cancellerRole: "user",
                    appointmentDatetime: schedule.scheduledDate
                }
            )
        } else {
            await this.notificationsService?.notifyCancellation(
                "user",
                schedule.user.userId,
                {
                    scheduleId,
                    serviceName: schedule.modality?.title ?? "Serviço",
                    cancellerName: schedule.entrepreneur.name,
                    cancellerRole: "entrepreneur",
                    appointmentDatetime: schedule.scheduledDate
                }
            )
        }

        return saved
    }

    async notifyEnRoute(
        scheduleId: number,
        entrepreneurId: number
    ): Promise<void> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: { user: true, entrepreneur: true, modality: true }
        })

        if (!schedule) {
            throw new NotFoundException(`Agendamento ${scheduleId} não encontrado`)
        }

        if (schedule.entrepreneur.entrepreneurId !== entrepreneurId) {
            throw new HttpException(
                {
                    status: HttpStatus.FORBIDDEN,
                    error: "Acesso negado a este agendamento"
                },
                HttpStatus.FORBIDDEN
            )
        }

        await this.notificationsService?.notifyServiceStep(
            schedule.user.userId,
            "en_route",
            {
                scheduleId,
                providerName: schedule.entrepreneur.name,
                modalityTitle: schedule.modality?.title ?? ""
            }
        )
    }

    async getAvailableTimes(
        entrepreneurId: number,
        date: string,
        duration: number
    ): Promise<string[]> {
        const dateObj = DateTime.fromISO(date, { zone: "America/Sao_Paulo" })
        if (!dateObj.isValid) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Data informada inválida" },
                HttpStatus.BAD_REQUEST
            )
        }

        // Query params chegam como string.
        const durationMinutes = Number(duration)
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Duração inválida" },
                HttpStatus.BAD_REQUEST
            )
        }

        const startOfDay = dateObj.startOf("day").toUTC().toJSDate()
        const endOfDay = dateObj.endOf("day").toUTC().toJSDate()

        const scheduledAppointments = await this.scheduleRepository.find({
            where: {
                entrepreneur: { entrepreneurId: entrepreneurId },
                scheduledDate: Between(startOfDay, endOfDay),
                status: Not(AgendaStatus.CANCELED)
            },
            relations: {
                modality: true
            }
        })

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })

        if (!entrepreneur) {
            throw new HttpException(
                { status: HttpStatus.NOT_FOUND, error: "Prestador não encontrado" },
                HttpStatus.NOT_FOUND
            )
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

        // Intervalos ocupados em ms de epoch: [início, início + duração).
        const occupiedIntervals = scheduledAppointments.map((schedule) => {
            const start = new Date(schedule.scheduledDate).getTime()
            const end = start + (schedule.modality?.duration ?? 0) * 1000
            return { start, end }
        })

        const parseTime = (raw: string) => {
            const [h, m] = raw.padStart(5, "0").split(":").map(Number)
            return { hour: h, minute: m }
        }
        const opening = parseTime(todayOperation.openinHours)
        const closing = parseTime(todayOperation.closingTime)

        const closingDateTime = dateObj.set({
            hour: closing.hour,
            minute: closing.minute,
            second: 0,
            millisecond: 0
        })

        const now = DateTime.now().setZone("America/Sao_Paulo")
        const availableTimes: string[] = []

        let candidate = dateObj.set({
            hour: opening.hour,
            minute: opening.minute,
            second: 0,
            millisecond: 0
        })

        while (candidate.plus({ minutes: durationMinutes }) <= closingDateTime) {
            const candidateStart = candidate.toUTC().toMillis()
            const candidateEnd = candidate
                .plus({ minutes: durationMinutes })
                .toUTC()
                .toMillis()

            const hasConflict = occupiedIntervals.some(
                (occ) => candidateStart < occ.end && candidateEnd > occ.start
            )

            const isPast =
                dateObj.toISODate() === now.toISODate() && candidate <= now

            if (!hasConflict && !isPast) {
                availableTimes.push(candidate.toFormat("HH:mm"))
            }

            candidate = candidate.plus({ minutes: 30 })
        }

        return availableTimes
    }
}
