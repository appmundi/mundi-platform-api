import { Injectable, Inject } from "@nestjs/common"
import * as fs from "fs"
import { Repository } from "typeorm"
import { Image } from "./entities/upload.entity"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import * as path from "path"
import { ImageDTO } from "src/dto/image.dto"

@Injectable()
export class ImagesService {
    constructor(
        @Inject("IMAGE_REPOSITORY")
        private imageRepository: Repository<Image>,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>
    ) { }

    async uploadImage(
        image: Express.Multer.File,
        entrepreneurId: number
    ): Promise<{ base64: string }> {
        const storedImage = await this.storeImage(image);

        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        });
        if (!entrepreneur) {
            throw new Error("Entrepreneur not found");
        }

        const imageEntity = new Image();
        imageEntity.filename = storedImage.name;
        imageEntity.base64 = storedImage.bytes;
        imageEntity.entrepreneur = entrepreneur;

        await this.imageRepository.save(imageEntity);

        return { base64: `data:image/jpeg;base64,${storedImage.bytes}` };
    }

    async findImageByID(id: number): Promise<{ base64: string, fileName: string }> {
        const file = await this.imageRepository.findOne({
            where: {
                id: id,
            }
        });

        return {
            base64: file.base64,
            fileName: file.filename,
        };
    }

    async storeImage(image: Express.Multer.File): Promise<ImageDTO> {
        const fileName = `${Date.now()}-${image.originalname}`;
        const uploadFolder = path.resolve(
            __dirname,
            "../../../src/controller/uploads/images"
        );

        const filePath = path.join(uploadFolder, fileName);

        fs.mkdirSync(uploadFolder, { recursive: true });
        fs.writeFileSync(filePath, image.buffer);

        const base64Image = image.buffer.toString("base64");

        return {
            bytes: base64Image,
            name: fileName,
        }
    }

    async getImagesByEntrepreneurId(entrepreneurId: number): Promise<Image[]> {
        return this.imageRepository.find({
            where: { entrepreneur: { entrepreneurId: entrepreneurId } }, // Ajusta a chave estrangeira
            relations: ['entrepreneur'], // Inclui a relação, se necessário
        });
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

    async uploadProfileImage(image: Express.Multer.File, entrepreneurId: number): Promise<{ base64: string }> {
        const entrepreneur = await this.entrepreneurRepository.findOne({ where: { entrepreneurId } });
        if (!entrepreneur) {
            throw new Error('Entrepreneur not found')
        }

        const storedImage = await this.storeImage(image);
        entrepreneur.profileImage = storedImage.bytes;
        await this.entrepreneurRepository.save(entrepreneur)

        return {
            base64: `data:image/jpeg;base64,${storedImage.bytes}`,
        }
    }

    async deleteProfileImage(entrepreneurId: number): Promise<void> {
        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId },
            loadEagerRelations: false
        });

        if (!entrepreneur) {
            throw new Error('Empreendedor não encontrado');
        }

        entrepreneur.profileImage = null;
        await this.entrepreneurRepository.save(entrepreneur, { reload: false });
    }
}
