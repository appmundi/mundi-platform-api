import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from "@nestjs/common"
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "./upload.service"
import * as fs from 'fs';
import * as path from 'path';

@Controller("images")
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

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
): Promise<{ id: number; base64: string }[]> {
    const images = await this.imagesService.getImagesByEntrepreneurId(entrepreneurId);

    return images.map(image => ({
        id: image.id,
        base64: `data:image/jpeg;base64,${image.base64}`, 
    }));
}


    @Delete("delete/:id")
    async deleteImage(@Param("id") id: number) {
        await this.imagesService.deleteImage(id)
        return { success: true, message: "Imagem deletada com sucesso." }
    }

    @Post("profile/upload")
    @UseInterceptors(FileInterceptor('image'))
    async updateProfileImage(
        @UploadedFile() image: Express.Multer.File,
        @Body() body: { entrepreneurId: number }
    ) {
        const entrepreneurId = body.entrepreneurId
        const imagePath = await this.imagesService.uploadProfileImage(image, entrepreneurId);

        return { success: true, imagePath }
    }

    @Delete("profile")
    async deleteProfileImage(
        @Body() body: { entrepreneurId: number }
    ) {
        const entrepreneurId = body.entrepreneurId
        await this.imagesService.deleteProfileImage(entrepreneurId);

        return { success: true }
    }
}
