import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param,
    NotFoundException,
    Get
} from "@nestjs/common"
import { CategoryService } from "./category.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"

@Controller("category")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @UseGuards(JwtAuthGuard)
    @Post("create")
    async category(@Param("id") entrepreneurId: number, @Body() type: string) {
        try {
            const category = await this.categoryService.createCategory(
                entrepreneurId,
                type
            )

            return { message: "Categoria criada com sucesso", category }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error("Falha")
        }
    }
    @Get(":type")
    async findOneByType(@Param("type") type: string) {
        try {
            const category = await this.categoryService.findOneByType(type)
            return category
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error("Falha")
        }
    }
}
