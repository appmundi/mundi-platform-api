import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFiles,
    UseInterceptors
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "./upload.service"

@Controller("images")
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}

    @Post("upload")
    @UseInterceptors(FileFieldsInterceptor([{ name: "images", maxCount: 5 }]))
    async uploadImages(
        @UploadedFiles() files,
        @Body() body: { entrepreneurId: number }
    ) {
        const entrepreneurId = body.entrepreneurId
        const imagePaths = []

        for (const file of files.images) {
            const imagePath = await this.imagesService.uploadImage(
                file,
                entrepreneurId
            )
            imagePaths.push(imagePath)
        }

        return { success: true, imagePaths }
    }

    @Get("byEntrepreneur/:entrepreneurId")
    async getImagesByEntrepreneurId(
        @Param("entrepreneurId") entrepreneurId: number
    ) {
        return this.imagesService.getImagesByEntrepreneurId(entrepreneurId)
    }

    @Delete("delete/:id")
    async deleteImage(@Param("id") id: number) {
        await this.imagesService.deleteImage(id)
        return { success: true, message: "Imagem deletada com sucesso." }
    }
}
