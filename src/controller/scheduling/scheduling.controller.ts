// scheduling.controller.ts
import { Controller, Post, Body } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"

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
}
