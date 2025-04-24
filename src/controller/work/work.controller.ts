import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param,
    NotFoundException,
    Put,
    Get,
    Delete,
    HttpException,
    HttpStatus
} from "@nestjs/common"
import { WorkService } from "./work.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { Work } from "./entities/work.entity";
import { ModalityService } from "../modality/modality.service";

@Controller("work")
export class WorkController {
    constructor(private workService: WorkService, private modalityService: ModalityService) {}

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


            const findWork = await this.workService.findWork(
                work.id
            )

           
            const modality = await this.modalityService.createModality(
                findWork.id,
                workData.value,
                1800,
                workData.service
            )
           

           return { message: "Serviço criado sem modality", work }

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error("Falha ao enviar avaliação")
        }
    }
    
    @Get("search/:id")
    async findOneEntrepreneur(
        @Param("id") workId: number
    ): Promise<Work> {
        console.log("trying to retrive Work", workId)
        return this.workService.findWork(workId)
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

    @Delete(":id")
    async deleteWork(@Param("id") id: number) {
        try {
            await this.modalityService.deleteModalitiesByWorkId(id);
            
            await this.workService.deleteWork(id);
            
            return { message: "Work e modalities associadas deletadas com sucesso" };
        } catch (error) {
            console.log("Work controller > delete error: ", error);
            throw new HttpException(
                "Erro ao deletar work e modalities",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
