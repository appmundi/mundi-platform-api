import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Category } from "./entities/category.entity"
import { Repository } from "typeorm"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"

@Injectable()
export class CategoryService {
    constructor(
        @Inject("GATEGORY_REPOSITORY")
        private categoryRepository: Repository<Category>,
        private entrepreneurService: EntrepreneurService
    ) {}

    async createCategory(
        freelancerId: number,
        type: string
    ): Promise<Category> {
        const entrepreneur = await this.entrepreneurService.getUserById(
            freelancerId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Entrepreneur ID ${freelancerId} não encontrado`
            )
        }

        const category = new Category()
        category.type = type
        category.entrepreneur = entrepreneur

        return this.categoryRepository.save(category)
    }

    async findOneByType(type: string) {
        const category = await this.categoryRepository.findOne({
            where: { type },
            relations: ["entrepreneur"] // Carregue o relacionamento com o empreendedor
        })

        if (!category) {
            throw new NotFoundException("Categoria não encontrada")
        }

        return {
            type: category.type,
            entrepreneurId: category.entrepreneur.entrepreneurId
        }
    }
}
