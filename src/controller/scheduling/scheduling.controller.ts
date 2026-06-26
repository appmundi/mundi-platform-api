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
}

@Controller("scheduling")
export class SchedulingController {
    private readonly logger = new Logger(SchedulingController.name)

    constructor(private readonly schedulingService: SchedulingService) {}

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
            } | undefined,
        },
        @Headers("Authorization") authorizationHeader: string
    ) {
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            );
        }

        const token = authorizationHeader.split(" ")[1];
        const decodedToken = jwt.decode(token) as JwtPayload;

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            );
        }

        const userId = decodedToken.id;
        this.logger.debug(`scheduleService: userId=${userId} date=${body.scheduledDate}`)
        const scheduledDate = this.parseScheduledDate(body.scheduledDate)

        const isAvailable = await this.schedulingService.isTimeAvailable(
            body.entrepreneurId,
            scheduledDate
        );

        if (!isAvailable) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Horário indisponível" },
                HttpStatus.BAD_REQUEST
            );
        }

        const result = await this.schedulingService.scheduleService(
            userId,
            body.modalityIds,
            body.entrepreneurId,
            scheduledDate,
            AgendaStatus.INIT,
            body.description,
            body.address,
        );

        return { message: result };
    }

    @Get("findByUserId")
    async findByUserId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<ScheduleDto[]> {
        if (!authorizationHeader) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT ausente"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT inválido"
                },
                HttpStatus.BAD_REQUEST
            )
        }

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
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken?.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

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

        return this.schedulingService.updateStatus(id, newStatus)
    }

    @Get("findByEntrepreneurId")
    async findByEntrepreneurId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<{ message: string; data: ScheduleDto[] }> {
        if (!authorizationHeader) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT ausente"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        const token = authorizationHeader.split(" ")[1]

        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT inválido"
                },
                HttpStatus.BAD_REQUEST
            )
        }

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
        if (!authorizationHeader) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT inválido"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Token JWT inválido"
                },
                HttpStatus.BAD_REQUEST
            )
        }

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
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

        try {
            // Both apps hit this endpoint, so the role is taken from the body
            // (the JWT carries no role); decodedToken.username is the fallback.
            await this.schedulingService.cancelSchedule(
                scheduleId,
                decodedToken.id,
                cancellerType,
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
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken?.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

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
