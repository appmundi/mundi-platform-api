import { Module, forwardRef } from "@nestjs/common"
import { AvaliationService } from "./avaliation.service"
import { AvaliationController } from "./avaliation.controller"
import { AvaliationProviders } from "./avaliation.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "AVALIATION_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY")
    ],
    controllers: [AvaliationController],
    providers: [
        ...AvaliationProviders,
        AvaliationService,
        EntrepreneurService,
        ...EntrepreneurProviders
    ]
})
export class AvaliationModule {}
