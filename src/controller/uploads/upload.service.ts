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
    ): Promise<{ base64: string }> {
        const fileName = `${Date.now()}-${image.originalname}`;
        const uploadFolder = path.resolve(
            __dirname,
            "../../../src/controller/uploads/images"
        );
    
        const filePath = path.join(uploadFolder, fileName);
    
        fs.mkdirSync(uploadFolder, { recursive: true }); 
        fs.writeFileSync(filePath, image.buffer);
    
        const base64Image = image.buffer.toString("base64");
    
        const entrepreneur = await this.entrepreneurRepository.findOne({
            where: { entrepreneurId }
        });
        if (!entrepreneur) {
            throw new Error("Entrepreneur not found");
        }
    
        const imageEntity = new Image();
        imageEntity.filename = fileName; 
        imageEntity.base64 = base64Image;
        imageEntity.entrepreneur = entrepreneur;
    
        await this.imageRepository.save(imageEntity);
    
        return { base64: `data:image/jpeg;base64,${base64Image}` }; 
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
}
