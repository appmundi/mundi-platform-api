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
    Param
} from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import * as jwt from "jsonwebtoken"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { Modality } from "../modality/entities/modality.entity"
import { IDefaultResponse } from "src/interfaces"

interface JwtPayload {
    id: number
    username: string
}

@Controller("scheduling")
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) {}

    @Post("schedule")
    async scheduleService(
        @Body()
        body: {
            modalityId: number
            entrepreneurId: number
            scheduledDate: Date
        },
        @Headers("Authorization") authorizationHeader: string
    ) {
        try {
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

            const userId = decodedToken.id

            const result = await this.schedulingService.scheduleService(
                userId,
                body.modalityId,
                body.entrepreneurId,
                body.scheduledDate
            )

            return { message: result }
        } catch (error) {
            return { error: error.message }
        }
    }

    @Get("findByUserId")
    async findByUserId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<Schedule[]> {
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

        if (!schedules || schedules.length === 0) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Nenhum agendamento encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const mappedSchedules: Schedule[] = schedules.map(
            (scheduleResponse) => {
                const schedule = new Schedule()
                schedule.id = scheduleResponse.id
                schedule.scheduledDate = scheduleResponse.scheduledDate

                const user = new User()
                user.userId = scheduleResponse.user.userId
                user.name = scheduleResponse.user.name
                schedule.user = user

                const entrepreneur = new Entrepreneur()
                entrepreneur.entrepreneurId =
                    scheduleResponse.entrepreneur.entrepreneurId
                entrepreneur.name = scheduleResponse.entrepreneur.name
                entrepreneur.companyName =
                    scheduleResponse.entrepreneur.companyName
                schedule.entrepreneur = entrepreneur

                const modality = new Modality()
                modality.id = scheduleResponse.modality.id
                modality.title = scheduleResponse.modality.title
                modality.duration = scheduleResponse.modality.duration
                modality.price = scheduleResponse.modality.price
                schedule.modality = modality

                return schedule
            }
        )

        return mappedSchedules
    }

    @Put(":id/update-status")
    async updateStatus(
        @Param("id") id: number,
        @Body("status") newStatus: AgendaStatus
    ): Promise<Schedule> {
        if (
            ![
                AgendaStatus.INIT,
                AgendaStatus.STARTED,
                AgendaStatus.CANCELED,
                AgendaStatus.FINISHED
            ].includes(newStatus)
        ) {
            throw new NotFoundException(`Invalid status: ${newStatus}`)
        }
        return this.schedulingService.updateStatus(id, newStatus)
    }

    @Get("findByEntrepreneurId")
    async findByEntrepreneurId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<IDefaultResponse> {
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
        console.log("Trying to retrieve the Schedule")
        const schedules = await this.schedulingService.findByEntrepreneurId(
            decodedToken.id
        )

        if (!schedules || schedules.length === 0) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Nenhum agendamento encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }

        const mappedSchedules: Schedule[] = schedules.map(
            (scheduleResponse) => {
                const schedule = new Schedule()

                const entrepreneur = new Entrepreneur()
                entrepreneur.entrepreneurId =
                    scheduleResponse.entrepreneur.entrepreneurId
                schedule.entrepreneur = entrepreneur

                schedule.id = scheduleResponse.id
                schedule.scheduledDate = scheduleResponse.scheduledDate
                schedule.status = scheduleResponse.status

                const user = new User()
                user.userId = scheduleResponse.user.userId
                user.name = scheduleResponse.user.name
                schedule.user = user

                const modality = new Modality()
                modality.id = scheduleResponse.modality.id
                modality.title = scheduleResponse.modality.title
                modality.duration = scheduleResponse.modality.duration
                modality.price = scheduleResponse.modality.price
                schedule.modality = modality

                return schedule
            }
        )

        return { message: "Sucesso", data: mappedSchedules }
    }

    @Get("findSchedules")
    async findSchedules(
        @Headers("authorization") authorizationHeader: string,
        @Query("startDate") startDate: string,
        @Query("endDate") endDate: string
    ): Promise<Schedule[]> {
        try {
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

            const schedules = await this.schedulingService.findByEntrepreneurId(
                entrepreneurId
            )

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

            const mapSchedules: Schedule[] = filteredSchedules.map(
                (scheduleResponse) => {
                    const schedule = new Schedule()

                    schedule.id = scheduleResponse.id
                    schedule.scheduledDate = scheduleResponse.scheduledDate

                    const user = new User()
                    user.userId = scheduleResponse.user.userId
                    schedule.user = user

                    const entrepreneur = new Entrepreneur()
                    entrepreneur.entrepreneurId =
                        scheduleResponse.entrepreneur.entrepreneurId
                    schedule.entrepreneur = entrepreneur

                    const modality = new Modality()
                    modality.id = scheduleResponse.modality.id
                    modality.title = scheduleResponse.modality.title
                    modality.duration = scheduleResponse.modality.duration
                    modality.price = scheduleResponse.modality.price
                    schedule.modality = modality

                    return schedule
                }
            )

            return mapSchedules
        } catch (error) {
            return null
        }
    }
}
