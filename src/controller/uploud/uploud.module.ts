import { Module, forwardRef } from "@nestjs/common"
import { ImagesService } from "./uploud.service"
import { ImagesController } from "./uploud.controller"
import { ImageProviders } from "./uploud.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "IMAGE_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY")
    ],
    controllers: [ImagesController],
    providers: [
        ...ImageProviders,
        ImagesService,
        EntrepreneurService,
        ...EntrepreneurProviders
    ]
})
export class UploudModule {}
