// scheduling.controller.ts
import { Controller, Post, Body, Get, Param, Headers } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { Schedule } from "./entities/scheduling.entity"
import * as jwt from "jsonwebtoken"
import { User } from "../user/entities/user.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { Modality } from "../modality/entities/modality.entity"

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
                throw new Error("Token JWT ausente")
            }

            const token = authorizationHeader.split(" ")[1]
            const decodedToken = jwt.decode(token) as JwtPayload

            if (!decodedToken || !decodedToken.id) {
                throw new Error("Token JWT inválido")
            }

            const userId = decodedToken.id

            const result = await this.schedulingService.scheduleService(
                userId,
                body.entrepreneurId,
                body.modalityId,
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
        try {
            if (!authorizationHeader) {
                throw new Error("Token JWT ausente")
            }

            const token = authorizationHeader.split(" ")[1]
            const decodedToken = jwt.decode(token) as JwtPayload

            if (!decodedToken || !decodedToken.id) {
                throw new Error("Token JWT inválido")
            }

            const schedules = await this.schedulingService.findByUserId(
                decodedToken.id
            )
            const mappedSchedules: Schedule[] = schedules.map(
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
                    schedule.modality = modality

                    return schedule
                }
            )

            return mappedSchedules
        } catch (error) {
            return null
        }
    }

    @Get("findByEntrepreneurId")
    async findByEntrepreneurId(
        @Headers("authorization") authorizationHeader: string
    ): Promise<Schedule[]> {
        try {
            if (!authorizationHeader) {
                throw new Error("Token JWT ausente")
            }

            const token = authorizationHeader.split(" ")[1]
            const decodedToken = jwt.decode(token) as JwtPayload

            if (!decodedToken || !decodedToken.id) {
                throw new Error("Token JWT inválido")
            }

            const entrepreneurId = decodedToken.id
            const schedules = await this.schedulingService.findByUserId(
                entrepreneurId
            )

            return schedules
        } catch (error) {
            return null
        }
    }
}
