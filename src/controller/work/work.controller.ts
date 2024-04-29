import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param,
    NotFoundException,
    Put
} from "@nestjs/common"
import { WorkService } from "./work.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { Work } from "./entities/work.entity";

@Controller("work")
export class WorkController {
    constructor(private readonly workService: WorkService) {}

    @UseGuards(JwtAuthGuard)
    @Post(":id/work")
    async workFreelancer(
        @Param("id") entrepreneurId: number,
        @Body() workData: { service: string; value: number }
    ) {
        try {
            const work = await this.workService.createWork(
                entrepreneurId,
                workData.service
            )

            return { message: "Serviço criado com sucesso", work }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error("Falha ao enviar avaliação")
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put("")
    async updateWork(
        @Body() workData: Work
    ) {
        try {
            const work = await this.workService.updateWork(
                workData
            )

            return { message: "Serviço criado com sucesso", work }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
           console.log( "e", error)
        }
    }
}
