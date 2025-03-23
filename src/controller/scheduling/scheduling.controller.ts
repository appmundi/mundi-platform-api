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
            modalityId: number;
            entrepreneurId: number;
            scheduledDate: string;
            status: AgendaStatus;
        },
        @Headers("Authorization") authorizationHeader: string
    ) {
        try {
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
            console.log("Recebido scheduledDate:", body.scheduledDate);
            const scheduledDate = new Date(body.scheduledDate);
    
            if (isNaN(scheduledDate.getTime())) {
                throw new HttpException(
                    { status: HttpStatus.BAD_REQUEST, error: "Data agendada inválida" },
                    HttpStatus.BAD_REQUEST
                );
            }
    
        
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
                body.modalityId,
                body.entrepreneurId,
                scheduledDate,
                AgendaStatus.INIT
            );
    
            return { message: result };
        } catch (error) {
            return { error: error.message };
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
        const filteredSchedules = schedules.filter(schedule => schedule.status !== AgendaStatus.CANCELED);

        if (!filteredSchedules || filteredSchedules.length === 0) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Nenhum agendamento encontrado" },
                HttpStatus.BAD_REQUEST
            );
        }

        const mappedSchedules: Schedule[] = filteredSchedules.map(
            (scheduleResponse) => {
                const schedule = new Schedule()
                schedule.id = scheduleResponse.id
                schedule.scheduledDate = scheduleResponse.scheduledDate
                schedule.status = scheduleResponse.status

                const user = new User()
                user.userId = scheduleResponse.user.userId
                user.name = scheduleResponse.user.name
                user.address = scheduleResponse.user.address
                user.addressNumber = scheduleResponse.user.addressNumber
                user.cep = scheduleResponse.user.cep
                user.city = scheduleResponse.user.city
                user.state = scheduleResponse.user.state
                user.phone = scheduleResponse.user.phone

                schedule.user = user

                const entrepreneur = new Entrepreneur()
                entrepreneur.entrepreneurId =
                    scheduleResponse.entrepreneur.entrepreneurId
                entrepreneur.name = scheduleResponse.entrepreneur.name
                entrepreneur.companyName =
                    scheduleResponse.entrepreneur.companyName
                entrepreneur.address = scheduleResponse.entrepreneur.address
                entrepreneur.addressNumber =
                    scheduleResponse.entrepreneur.addressNumber
                entrepreneur.cep = scheduleResponse.entrepreneur.cep
                entrepreneur.city = scheduleResponse.entrepreneur.city
                entrepreneur.state = scheduleResponse.entrepreneur.state
                entrepreneur.phone = scheduleResponse.entrepreneur.phone

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
                AgendaStatus.FEEDBACK,
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

        const filteredSchedules = schedules.filter(schedule => schedule.status !== AgendaStatus.CANCELED);

        if (!filteredSchedules || filteredSchedules.length === 0) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Nenhum agendamento encontrado" },
                HttpStatus.BAD_REQUEST
            );
        }

        const mappedSchedules: Schedule[] = filteredSchedules.map(
            (scheduleResponse) => {
                const schedule = new Schedule()

                const entrepreneur = new Entrepreneur()
                entrepreneur.entrepreneurId =
                    scheduleResponse.entrepreneur.entrepreneurId
                entrepreneur.name = scheduleResponse.entrepreneur.name
                entrepreneur.companyName =
                    scheduleResponse.entrepreneur.companyName
                entrepreneur.address = scheduleResponse.entrepreneur.address
                entrepreneur.addressNumber =
                    scheduleResponse.entrepreneur.addressNumber
                entrepreneur.cep = scheduleResponse.entrepreneur.cep
                entrepreneur.city = scheduleResponse.entrepreneur.city
                entrepreneur.state = scheduleResponse.entrepreneur.state
                entrepreneur.phone = scheduleResponse.entrepreneur.phone
                schedule.entrepreneur = entrepreneur

                schedule.id = scheduleResponse.id
                schedule.scheduledDate = scheduleResponse.scheduledDate
                schedule.status = scheduleResponse.status

                const user = new User()
                user.userId = scheduleResponse.user.userId
                user.name = scheduleResponse.user.name
                user.address = scheduleResponse.user.address
                user.addressNumber = scheduleResponse.user.addressNumber
                user.cep = scheduleResponse.user.cep
                user.city = scheduleResponse.user.city
                user.state = scheduleResponse.user.state
                user.phone = scheduleResponse.user.phone
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

            const mapSchedules: Schedule[] = filteredSchedules.map(
                (scheduleResponse) => {
                    const schedule = new Schedule()

                    schedule.id = scheduleResponse.id
                    schedule.scheduledDate = scheduleResponse.scheduledDate

                    const user = new User()
                    user.userId = scheduleResponse.user.userId
                    user.name = scheduleResponse.user.name
                    user.address = scheduleResponse.user.address
                    user.addressNumber = scheduleResponse.user.addressNumber
                    user.cep = scheduleResponse.user.cep
                    user.city = scheduleResponse.user.city
                    user.state = scheduleResponse.user.state
                    user.phone = scheduleResponse.user.phone
                    schedule.user = user

                    const entrepreneur = new Entrepreneur()
                    entrepreneur.entrepreneurId =
                        scheduleResponse.entrepreneur.entrepreneurId
                    entrepreneur.name = scheduleResponse.entrepreneur.name
                    entrepreneur.companyName =
                        scheduleResponse.entrepreneur.companyName
                    entrepreneur.address = scheduleResponse.entrepreneur.address
                    entrepreneur.addressNumber =
                        scheduleResponse.entrepreneur.addressNumber
                    entrepreneur.cep = scheduleResponse.entrepreneur.cep
                    entrepreneur.city = scheduleResponse.entrepreneur.city
                    entrepreneur.state = scheduleResponse.entrepreneur.state
                    entrepreneur.phone = scheduleResponse.entrepreneur.phone

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

    @Post(":id/cancel")
    async cancelSchedule(
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

        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

        try {
            await this.schedulingService.cancelSchedule(
                scheduleId,
                decodedToken.id
            )
            return { message: "Agendamento cancelado com sucesso" }
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
        @Query("date") date: string 
    ): Promise<string[]> {
        const dateObject = new Date(date);
        const dateString = dateObject.toISOString(); 
        return this.schedulingService.getAvailableTimes(entrepreneurId, dateString); 
    }
}
