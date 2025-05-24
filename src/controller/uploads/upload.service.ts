import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import * as fs from "fs"
import { Repository } from "typeorm"
import { Image } from "./entities/upload.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import * as path from "path"
import { ImageDTO } from "src/dto/image.dto"
import * as sharp from "sharp"

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
    ): Promise<{ base64: string }> {
        const storedImage = await this.storeImage(image)

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })
        if (!entrepreneur) {
            throw new Error("Entrepreneur not found")
        }

        const imageEntity = new Image()
        imageEntity.filename = storedImage.name
        imageEntity.base64 = storedImage.bytes
        imageEntity.entrepreneur = entrepreneur

        await this.imageRepository.save(imageEntity)

        return { base64: `data:image/jpeg;base64,${storedImage.bytes}` }
    }

    async findImageByID(
        id: number
    ): Promise<{ base64: string; fileName: string } | null> {
        const file = await this.imageRepository.findOne({
            where: {
                id: id
            }
        })

        if (!file) {
            return null
        }

        return {
            base64: file.base64,
            fileName: file.filename
        }
    }

    async storeImage(image: Express.Multer.File): Promise<ImageDTO> {
        const fileName = `${Date.now()}-${image.originalname}`
        const uploadFolder = path.resolve(
            __dirname,
            "../../../src/controller/uploads/images"
        )

        const filePath = path.join(uploadFolder, fileName)

        fs.mkdirSync(uploadFolder, { recursive: true })

        try {
            const compressedBuffer = await sharp(image.buffer)
                .jpeg({
                    quality: 80,
                    mozjpeg: true
                })
                .toBuffer()

            fs.writeFileSync(filePath, compressedBuffer)

            const base64Image = compressedBuffer.toString("base64")

            return {
                bytes: base64Image,
                name: fileName
            }
        } catch (error) {
            console.error("Erro ao processar imagem:", error)
            throw error
        }
    }

    async getImagesByEntrepreneurId(entrepreneurId: number): Promise<Image[]> {
        return this.imageRepository.find({
            where: { entrepreneur: { entrepreneurId: entrepreneurId } }, // Ajusta a chave estrangeira
            relations: ["entrepreneur"] // Inclui a relação, se necessário
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

    async uploadProfileImage(
        image: Express.Multer.File,
        entrepreneurId: number
    ): Promise<{ base64: string }> {
        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        })
        if (!entrepreneur) {
            throw new Error("Entrepreneur not found")
        }

        const storedImage = await this.storeImage(image)
        entrepreneur.profileImage = storedImage.bytes
        await this.entrepreneurRepository.save(entrepreneur)

        return {
            base64: `data:image/jpeg;base64,${storedImage.bytes}`
        }
    }

    async deleteProfileImage(entrepreneurId: number): Promise<void> {
        await this.entrepreneurRepository.query(
            `UPDATE entrepreneur SET profileImage = NULL WHERE entrepreneurId = ?`,
            [entrepreneurId]
        )

        const entrepreneur = await this.entrepreneurRepository.findOneBy({
            entrepreneurId
        })
        if (!entrepreneur) {
            throw new NotFoundException("Empreendedor não encontrado")
        }
        const updated = entrepreneur.profileImage == null;
        if (!updated) {
            throw new Error('Erro ao atualizar imagem');
        }
    }

    async getEntrepreneurProfileImage(
        entrepreneurID: number
    ): Promise<{ base64: string } | null> {
        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: {
                entrepreneurId: entrepreneurID
            },
            select: {
                profileImage: true
            }
        })

        if (!entrepreneur.profileImage) {
            return null
        }

        return {
            base64: entrepreneur.profileImage
        }
    }
}
