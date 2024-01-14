import { Module, forwardRef } from "@nestjs/common"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"
import { ClientProviders } from "./client.providers"
import { ClientService } from "./client.service"
import { ClientController } from "./client.controller"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "IMAGE_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY")
    ],
    controllers: [ClientController],
    providers: [
        ...ClientProviders,
        ClientService,
        EntrepreneurService,
        ...EntrepreneurProviders
    ]
})
export class ClientModule {}
