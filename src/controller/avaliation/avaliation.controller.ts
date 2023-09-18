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

@Controller("avaliation")
export class AvaliationController {
    constructor(private readonly avaliationService: AvaliationService) { }

    @UseGuards(JwtAuthGuard)
    @Post(":id/evaluate")
    async evaluateFreelancer(
        @Param("id") entrepreneurId: number,
        @Body() evaluationData: { rating: number; comment: string, name: string }
    ) {
        try {
            const avaliation = await this.avaliationService.createAvaliation(
                entrepreneurId,
                evaluationData.rating,
                evaluationData.comment,
                evaluationData.name
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
