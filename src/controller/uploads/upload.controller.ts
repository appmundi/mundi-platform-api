import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    NotFoundException,
    Param,
    Post,
    StreamableFile,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from "@nestjs/common"
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "./upload.service"
import * as path from "path"
import { Readable } from "typeorm/platform/PlatformTools"

@Controller("images")
export class ImagesController {
    private readonly uploadsDir = path.join(process.cwd(), "src", "controller", "uploads", "images")
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

    @Delete("profile/:entrepreneurId")
    async deleteProfileImage(
        @Param("entrepreneurId") entrepreneurId: string
    ) {
        const id = Number.parseInt(entrepreneurId);
        await this.imagesService.deleteProfileImage(id);

        return { success: true }
    }

    @Get(":imageId")
    @Header("Cache-Control", "public, max-age=86400")
    async serveImage(
        @Param("imageId") imageId: string
    ): Promise<StreamableFile> {
        const id = Number.parseInt(imageId);
        const image = await this.imagesService.findImageByID(id);

        if (!image) {
            throw new NotFoundException("Imagem não encontrada");
        }

        const contentType = this.getContentType(image.fileName);
        return this.createStreamableFile(image.base64, contentType);
    }

    @Get("profile/:entrepreneurID")
    async profileImage(
        @Param("entrepreneurID") entrepreneurID: string
    ): Promise<StreamableFile | null> {
        try {
            const id = Number.parseInt(entrepreneurID);
            const image = await this.imagesService.getEntrepreneurProfileImage(id);

            if (!image) {
                return null;
            }

            return this.createStreamableFile(image.base64, 'image/jpeg');
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException("Erro ao processar imagem");
        }
    }

    private createStreamableFile(base64Data: string, contentType: string): StreamableFile {
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(cleanBase64, "base64");

        const readableStream = new Readable();
        readableStream.push(imageBuffer);
        readableStream.push(null);

        return new StreamableFile(readableStream, {
            type: contentType,
        });
    }

    private getContentType(filename: string): string {
        const extension = filename.toLowerCase().split(".").pop();
        const types = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            svg: "image/svg+xml",
        };
        return types[extension] || "application/octet-stream";
    }
}
