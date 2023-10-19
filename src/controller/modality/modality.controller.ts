import { Controller, Post, Body, UseGuards, Param } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ModalityService } from "./modality.service"
import { HttpException, HttpStatus } from "@nestjs/common"

@Controller("modality")
export class ModalityController {
    constructor(private readonly modalityService: ModalityService) {}

    @UseGuards(JwtAuthGuard)
    @Post(":id/modality")
    async createModality(
        @Param("id") workId: number,
        @Body() modalityData: { title: string; duration: number; price: number }
    ) {
        try {
            await this.modalityService.createModality(
                workId,
                modalityData.price,
                modalityData.duration,
                modalityData.title
            )

            return { message: "Modality criada com sucesso" }
        } catch (error) {
            throw new HttpException(
                "Erro ao criar Modality",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
