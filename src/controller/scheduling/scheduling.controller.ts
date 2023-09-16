// scheduling.controller.ts
import { Controller, Post, Body, Get, Param, Headers } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { Schedule } from "./entities/scheduling.entity"
import * as jwt from "jsonwebtoken"

interface JwtPayload {
    userId: number
    entrepreneurId: number
}

@Controller("scheduling")
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) {}

    @Post("schedule")
    async scheduleService(
        @Body()
        body: {
            entrepreneurId: number
            scheduledDate: Date
        },
        @Headers("authorization") authorizationHeader: string
    ) {
        try {
            if (!authorizationHeader) {
                throw new Error("Token JWT ausente")
            }

            const token = authorizationHeader.split(" ")[1]
            const decodedToken = jwt.decode(token) as JwtPayload

            if (!decodedToken || !decodedToken.userId) {
                throw new Error("Token JWT inválido")
            }

            const userId = decodedToken.userId

            const result = await this.schedulingService.scheduleService(
                userId,
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
        try {
            if (!authorizationHeader) {
                throw new Error("Token JWT ausente")
            }

            const token = authorizationHeader.split(" ")[1]
            const decodedToken = jwt.decode(token) as JwtPayload

            if (!decodedToken || !decodedToken.userId) {
                throw new Error("Token JWT inválido")
            }

            const userId = decodedToken.userId
            const schedules = await this.schedulingService.findByUserId(userId)
            return schedules
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

            if (!decodedToken || !decodedToken.entrepreneurId) {
                throw new Error("Token JWT inválido")
            }

            const entrepreneurId = decodedToken.entrepreneurId
            const schedules = await this.schedulingService.findByUserId(
                entrepreneurId
            )
            return schedules
        } catch (error) {
            return null
        }
    }
}
