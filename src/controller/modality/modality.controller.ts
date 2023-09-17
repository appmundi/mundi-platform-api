import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param
} from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { Modality } from "./entities/modality.entity";
import { ModalityService } from "./modality.service";

@Controller("modality")
export class ModalityController {
    constructor(private readonly modalityService: ModalityService) { }

    @UseGuards(JwtAuthGuard)
    @Post(":id/modality")

    async createModality(
        @Param("id") workId: number,
        @Body() modalityData: { title: string; duration: number, price: number }
    ) {
        try {

            await this.modalityService.createModality(workId, modalityData.price, modalityData.duration, modalityData.title);

        }catch(e){
            console.log(e)
        }
        


    }
}
