import { Module, forwardRef } from "@nestjs/common"
import { ImagesService } from "./upload.service"
import { ImagesController } from "./upload.controller"
import { ImageProviders } from "./upload.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"
import { UserService } from "../user/user.service"
import { UserProviders } from "../user/user.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "IMAGE_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY"),
        TypeOrmModule.forFeature([], "USER_REPOSITORY")
    ],
    controllers: [ImagesController],
    providers: [
        ...ImageProviders,
        ImagesService,
        EntrepreneurService,
        ...EntrepreneurProviders,
        UserService,
        ...UserProviders,
    ],
    exports: [ImagesService],
})
export class UploadModule {}
