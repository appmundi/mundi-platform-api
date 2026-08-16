import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Repository } from "typeorm"
import { Image } from "./entities/upload.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { ImageDTO } from "../../dto/image.dto"
import sharp = require("sharp")
import { User } from "../user/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

/** Largura máxima das imagens salvas. Fotos menores não são ampliadas. */
const MAX_IMAGE_WIDTH = 1080

@Injectable()
export class ImagesService {
    constructor(
        @Inject("IMAGE_REPOSITORY")
        private imageRepository: Repository<Image>,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>
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

        try {
            const compressedBuffer = await sharp(image.buffer)
                // `rotate()` sem argumento aplica a orientação do EXIF nos
                // pixels. Precisa vir antes do resize, senão a largura seria
                // aplicada no eixo errado em foto tirada na vertical — e o
                // sharp descarta o EXIF na saída, então sem isso a imagem
                // ficaria deitada.
                .rotate()
                .resize({
                    width: MAX_IMAGE_WIDTH,
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 80,
                    mozjpeg: true
                })
                .toBuffer()

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
        // Checagem de existência separada do UPDATE: no MySQL o `affected` conta
        // linhas alteradas, então apagar uma imagem já ausente devolveria 0 e
        // viraria um 404 indevido.
        const exists = await this.entrepreneurRepository.countBy({
            entrepreneurId
        })
        if (exists === 0) {
            throw new NotFoundException("Empreendedor não encontrado")
        }

        await this.entrepreneurRepository.update(
            { entrepreneurId },
            { profileImage: null }
        )
    }

    async deleteUserProfileImage(userId: number): Promise<void> {
        const exists = await this.userRepository.countBy({ userId })
        if (exists === 0) {
            throw new NotFoundException("Usuário não encontrado")
        }

        await this.userRepository.update({ userId }, { imageUrl: null })
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

    async getUserProfileImage(
        userID: number
    ): Promise<{ base64: string } | null> {
        const user = await this.userRepository.findOne({
            where: {
                userId: userID
            },
            select: {
                imageUrl: true
            }
        })

        if (!user.imageUrl) {
            return null
        }

        return {
            base64: user.imageUrl
        }
    }
}
