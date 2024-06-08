import { Controller, Post, Body, UseGuards, Param, Put } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ModalityService } from "./modality.service"
import { HttpException, HttpStatus } from "@nestjs/common"
import { Modality } from "./entities/modality.entity";

@Controller("modality")
export class ModalityController {
    constructor(private readonly modalityService: ModalityService) {}

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
            console.log("Modality controller > ", error);
            throw new HttpException(
                "Erro ao criar Modality",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put("")
    async updateWork(
        @Body() modality: Modality
    ) {
        try {
            const work = await this.modalityService.updateModality(
                modality
            )

            return { message: "Serviço criado com sucesso", work }
        } catch (error) {
            
           console.log( "e", error)
        }
    }

}
