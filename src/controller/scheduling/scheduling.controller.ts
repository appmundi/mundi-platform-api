// scheduling.controller.ts
import { Controller, Post, Body, Get, Param } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { Schedule } from "./entities/scheduling.entity"

@Controller("scheduling")
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) {}

    @Post("schedule")
    async scheduleService(
        @Body()
        body: {
            userId: number
            entrepreneurId: number
            scheduledDate: Date
        }
    ) {
        try {
            const result = await this.schedulingService.scheduleService(
                body.userId,
                body.entrepreneurId,
                body.scheduledDate
            )
            return { message: result }
        } catch (error) {
            return { error: error.message }
        }
    }

    @Get("findByUserId/:userId")
    async findByUserId(@Param("userId") userId: number): Promise<Schedule[]> {
        try {
            const schedules = await this.schedulingService.findByUserId(userId)
            return schedules
        } catch (error) {
            return null
        }
    }

    @Get("findByEntrepreneurId/:entrepreneurId")
    async findByEntrepreneurId(
        @Param("entrepreneurId") entrepreneurId: number
    ): Promise<Schedule[]> {
        try {
            const schedules = await this.schedulingService.findByEntrepreneurId(
                entrepreneurId
            )
            return schedules
        } catch (error) {
            return null
        }
    }
}
