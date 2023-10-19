import { Injectable, Inject } from "@nestjs/common"
import * as fs from "fs"
import { Repository } from "typeorm"
import { Image } from "./entities/upload.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import * as path from "path"

@Injectable()
export class ImagesService {
    constructor(
        @Inject("IMAGE_REPOSITORY")
        private imageRepository: Repository<Image>,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>
    ) {}

    async uploadImage(
        image: Express.Multer.File,
        entrepreneurId: number
    ): Promise<{ path: string }> {
        const fileName = `${Date.now()}-${image.originalname}`
        const uploadFolder = path.resolve(
            __dirname,
            "../../../src/controller/uploads/images"
        )

        const filePath = path.join(uploadFolder, fileName)

        fs.writeFileSync(filePath, image.buffer)

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })
        const imageEntity = new Image()
        imageEntity.filename = filePath
        imageEntity.entrepreneur = entrepreneur

        await this.imageRepository.save(imageEntity)

        return { path: filePath }
    }

    async getImagesByEntrepreneurId(entrepreneurId: number): Promise<Image[]> {
        return this.imageRepository.find({
            where: { entrepreneur: { entrepreneurId: entrepreneurId } }
        })
    }

    async deleteImage(id: number): Promise<void> {
        const image = await this.imageRepository.findOne({
            where: { id }
        })

        if (!image) {
            throw new Error(`Imagem com ID ${id} não encontrada.`)
        }

        fs.unlinkSync(image.filename)

        await this.imageRepository.remove(image)
    }
}
