import { Module, forwardRef } from "@nestjs/common"
import { CategoryService } from "./category.service"
import { CategoryProviders } from "./category.providers"
import { CategoryController } from "./category.controller"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY"),
        TypeOrmModule.forFeature([], "CATEGORY_REPOSITORY")
    ],
    controllers: [CategoryController],
    providers: [
        ...CategoryProviders,
        CategoryService,
        EntrepreneurService,
        ...EntrepreneurProviders
    ],
    exports: [CategoryService, "CATEGORY_REPOSITORY"]
})
export class CategoryModule {}
