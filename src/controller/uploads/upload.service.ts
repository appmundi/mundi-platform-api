import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import * as fs from "fs"
import { Repository } from "typeorm"
import { Image } from "./entities/upload.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import * as path from "path"
import { ImageDTO } from "src/dto/image.dto"
import * as sharp from "sharp"
import { User } from "../user/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

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
        try {
            if (!image || !image.buffer) {
                throw new Error("Arquivo de imagem inválido ou vazio")
            }

            console.log(`📦 Processando imagem: ${image.originalname}, Tamanho: ${(image.buffer.length / 1024 / 1024).toFixed(2)}MB`)

            // Remove a extensão original e adiciona .jpg, já que sempre convertemos para JPEG
            const originalNameWithoutExt = image.originalname.replace(/\.[^/.]+$/, "")
            const fileName = `${Date.now()}-${originalNameWithoutExt}.jpg`
            
            // Usar caminho absoluto baseado em process.cwd() para funcionar em produção
            const uploadFolder = path.resolve(
                process.cwd(),
                "src",
                "controller",
                "uploads",
                "images"
            )

            console.log(`📁 Pasta de upload: ${uploadFolder}`)

            const filePath = path.join(uploadFolder, fileName)

            // Criar pasta se não existir
            if (!fs.existsSync(uploadFolder)) {
                fs.mkdirSync(uploadFolder, { recursive: true })
                console.log(`✅ Pasta criada: ${uploadFolder}`)
            }

            // Verificar permissão de escrita
            try {
                fs.accessSync(uploadFolder, fs.constants.W_OK as number)
            } catch (error) {
                throw new Error(`Sem permissão de escrita na pasta: ${uploadFolder}`)
            }

            // Converte qualquer formato de imagem (HEIC, HEIF, PNG, etc.) para JPEG
            console.log(`🔄 Convertendo imagem para JPEG...`)
            const compressedBuffer = await sharp(image.buffer)
                .jpeg({
                    quality: 80,
                    mozjpeg: true
                })
                .toBuffer()

            console.log(`💾 Salvando arquivo: ${fileName}`)
            fs.writeFileSync(filePath, Uint8Array.from(compressedBuffer))

            const base64Image = compressedBuffer.toString("base64")
            console.log(`✅ Imagem processada com sucesso: ${fileName}`)

            return {
                bytes: base64Image,
                name: fileName
            }
        } catch (error) {
            console.error("❌ Erro ao processar imagem:", {
                message: error.message,
                stack: error.stack,
                originalname: image?.originalname,
                bufferSize: image?.buffer?.length
            })
            throw new Error(`Erro ao processar imagem: ${error.message}`)
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
        const updated = entrepreneur.profileImage == null
        if (!updated) {
            throw new Error("Erro ao atualizar imagem")
        }
    }

    async deleteUserProfileImage(userId: number): Promise<void> {
        await this.entrepreneurRepository.query(
            `UPDATE user SET imageUrl = NULL WHERE userId = ?`,
            [userId]
        )

        const user = await this.userRepository.findOneBy({
            userId
        })
        if (!user) {
            throw new NotFoundException("Empreendedor não encontrado")
        }
        const updated = user.imageUrl == null
        if (!updated) {
            throw new Error("Erro ao atualizar imagem")
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
