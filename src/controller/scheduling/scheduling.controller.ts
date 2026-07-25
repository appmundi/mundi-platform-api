import {
    Controller,
    Post,
    Body,
    Get,
    Headers,
    Query,
    NotFoundException,
    HttpException,
    HttpStatus,
    Put,
    Param,
    Logger
} from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import * as jwt from "jsonwebtoken"
import { DateTime } from "luxon"
import { ScheduleMapper, ScheduleDto } from "./mappers/schedule.mapper"

interface JwtPayload {
    id: number
    username: string
    role?: "user" | "entrepreneur"
}

@Controller("scheduling")
export class SchedulingController {
    private readonly logger = new Logger(SchedulingController.name)

    constructor(private readonly schedulingService: SchedulingService) {}

    private decodeToken(authorizationHeader: string | undefined): JwtPayload {
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.UNAUTHORIZED, error: "Token JWT ausente" },
                HttpStatus.UNAUTHORIZED
            )
        }
        const token = authorizationHeader.split(" ")[1]
        try {
            return jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            ) as unknown as JwtPayload
        } catch {
            throw new HttpException(
                { status: HttpStatus.UNAUTHORIZED, error: "Token JWT inválido" },
                HttpStatus.UNAUTHORIZED
            )
        }
    }

    @Post("schedule")
    async scheduleService(
        @Body()
        body: {
            modalityIds: number[];
            entrepreneurId: number;
            scheduledDate: string;
            status: AgendaStatus;
            description: string,
            address?: {
                number: string,
                zipCode: string,
                complement: string,
                street?: string,
                neighborhood?: string,
                city?: string,
                state?: string,
            } | undefined,
        },
        @Headers("Authorization") authorizationHeader: string
    ) {
        const decodedToken = this.decodeToken(authorizationHeader)

        const userId = decodedToken.id;
        this.logger.debug(`scheduleService: userId=${userId} date=${body.scheduledDate}`)
        const scheduledDate = this.parseScheduledDate(body.scheduledDate)

        const result = await this.schedulingService.scheduleService(
            userId,
            body.modalityIds,
            body.entrepreneurId,
            scheduledDate,
            body.description,
            body.address,
        );

        return { message: result };
    }

    @Get("findByUserId")
    async findByUserId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<ScheduleDto[]> {
        const decodedToken = this.decodeToken(authorizationHeader)

        const schedules = await this.schedulingService.findByUserId(
            decodedToken.id
        )
        const filteredSchedules = schedules.filter(schedule => schedule.status !== AgendaStatus.CANCELED && schedule.status !== AgendaStatus.FINISHED);

        return filteredSchedules.map(ScheduleMapper.toDto)
    }

    @Put(":id/update-status")
    async updateStatus(
        @Param("id") id: number,
        @Body("status") newStatus: AgendaStatus,
        @Headers("authorization") authorizationHeader: string
    ): Promise<Schedule> {
        const decodedToken = this.decodeToken(authorizationHeader)

        if (
            ![
                AgendaStatus.INIT,
                AgendaStatus.STARTED,
                AgendaStatus.CANCELED,
                AgendaStatus.FEEDBACK,
                AgendaStatus.FINISHED
            ].includes(newStatus)
        ) {
            throw new NotFoundException(`Invalid status: ${newStatus}`)
        }

        // Cancellation must go through cancelSchedule so the OTHER party gets a
        // push notification (updateStatus does not notify on CANCELED). This
        // route is used by the entrepreneur app, so the canceller is the
        // entrepreneur.
        if (newStatus === AgendaStatus.CANCELED) {
            try {
                return await this.schedulingService.cancelSchedule(
                    id,
                    decodedToken.id,
                    "entrepreneur",
                    decodedToken.username
                )
            } catch (error) {
                throw new HttpException(
                    { status: HttpStatus.BAD_REQUEST, error: error.message },
                    HttpStatus.BAD_REQUEST
                )
            }
        }

        return this.schedulingService.updateStatus(id, newStatus, {
            id: decodedToken.id,
            role: decodedToken.role
        })
    }

    @Get("findByEntrepreneurId")
    async findByEntrepreneurId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<{ message: string; data: ScheduleDto[] }> {
        const decodedToken = this.decodeToken(authorizationHeader)

        const schedules = await this.schedulingService.findByEntrepreneurId(
            decodedToken.id
        )

        const filteredSchedules = schedules.filter(schedule => schedule.status !== AgendaStatus.CANCELED);

        return { message: "Sucesso", data: filteredSchedules.map(ScheduleMapper.toDto) }
    }

    @Get("findSchedules")
    async findSchedules(
        @Headers("authorization") authorizationHeader: string,
        @Query("startDate") startDate: string,
        @Query("endDate") endDate: string
    ): Promise<ScheduleDto[]> {
        const decodedToken = this.decodeToken(authorizationHeader)

        const entrepreneurId = decodedToken.id

        let schedules = await this.schedulingService.findByEntrepreneurId(
            entrepreneurId
        )

        schedules = schedules.filter(schedule => schedule.status !== AgendaStatus.CANCELED);

        let filteredSchedules = schedules

        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate)
            const parsedEndDate = new Date(endDate)

            filteredSchedules = schedules.filter((schedule) => {
                const scheduledDate = new Date(schedule.scheduledDate)
                return (
                    scheduledDate >= parsedStartDate &&
                    scheduledDate <= parsedEndDate
                )
            })
        }

        return filteredSchedules.map(ScheduleMapper.toDto)
    }

    @Post(":id/cancel")
    async cancelSchedule(
        @Param("id") scheduleId: number,
        @Body("cancellerType") cancellerType: "user" | "entrepreneur",
        @Headers("authorization") authorizationHeader: string
    ): Promise<{ message: string }> {
        const decodedToken = this.decodeToken(authorizationHeader)

        try {
            // Tokens novos carregam a role; tokens antigos caem no cancellerType do body.
            await this.schedulingService.cancelSchedule(
                scheduleId,
                decodedToken.id,
                decodedToken.role ?? cancellerType,
                decodedToken.username
            )
            return { message: "Agendamento cancelado com sucesso" }
        } catch (error) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: error.message },
                HttpStatus.BAD_REQUEST
            )
        }
    }



    @Post(":id/notify-en-route")
    async notifyEnRoute(
        @Param("id") scheduleId: number,
        @Headers("authorization") authorizationHeader: string
    ): Promise<{ message: string }> {
        const decodedToken = this.decodeToken(authorizationHeader)

        try {
            await this.schedulingService.notifyEnRoute(
                Number(scheduleId),
                decodedToken.id
            )
            return { message: "Notificação enviada com sucesso" }
        } catch (error) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: error.message },
                HttpStatus.BAD_REQUEST
            )
        }
    }

    @Get(":entrepreneurId/available-times")
    async getAvailableTimes(
        @Param("entrepreneurId") entrepreneurId: number,
        @Query("date") date: string,
        @Query("duration") duration: number,
    ): Promise<string[]> {
        return this.schedulingService.getAvailableTimes(entrepreneurId, date, duration)
    }

    private parseScheduledDate(scheduledDate: string): Date {
        const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(scheduledDate)
        const parsedDate = hasTimezone
            ? DateTime.fromISO(scheduledDate, { setZone: true })
            : DateTime.fromISO(scheduledDate, { zone: "America/Sao_Paulo" })

        if (!parsedDate.isValid) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Data agendada inválida" },
                HttpStatus.BAD_REQUEST
            )
        }

        return parsedDate.toUTC().toJSDate()
    }
}
