import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param,
    NotFoundException
} from "@nestjs/common"
import { AvaliationService } from "./avaliation.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { AgendaStatus } from "../scheduling/entities/scheduling.entity";

@Controller("avaliation")
export class AvaliationController {
    constructor(private readonly avaliationService: AvaliationService) { }

    @Post(":id/evaluate")
    async evaluateFreelancer(
        @Param("id") entrepreneurId: number,
        @Body() evaluationData: { rating: number; comment: string, name: string, scheduleId: number, newStatus: AgendaStatus, userId: number }
    ) {
        try {
            console.log("Trying to insert a avaliation")
            const avaliation = await this.avaliationService.createAvaliation(
                entrepreneurId,
                evaluationData.rating,
                evaluationData.comment,
                evaluationData.name,
                evaluationData.scheduleId,
                evaluationData.newStatus,
                evaluationData.userId
            )

            return { message: "Avaliação enviada com sucesso", avaliation }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error("Falha ao enviar avaliação")
        }
    }

}
