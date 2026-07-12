import { Module, forwardRef } from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { EntrepreneurController } from "./entrepreneur.controller"
import { EntrepreneurProviders } from "./entrepreneur.providers"

import { DatabaseModule } from "../../database/database.module"
import { AuthModule } from "../../auth/auth.module"
import { MailService } from "../../mail/mail.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoryProviders } from "../category/category.providers"
import { CategoryService } from "../category/category.service"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule), TypeOrmModule.forFeature([], "CATEGORY_REPOSITORY")],
    controllers: [EntrepreneurController],
    providers: [...EntrepreneurProviders, EntrepreneurService, MailService, CategoryService, ...CategoryProviders],
    exports: [EntrepreneurService]
})
export class EntrepreneurModule {}
