import { Module, forwardRef } from "@nestjs/common"
import { AvaliationService } from "./avaliation.service"
import { AvaliationController } from "./avaliation.controller"
import { AvaliationProviders } from "./avaliation.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"
import { SchedulingService } from "../scheduling/scheduling.service"
import { UserProviders } from "../user/user.providers"
import { ScheduleProviders } from "../scheduling/scheduling.providers"
import { ModalityProviders } from "../modality/modality.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "AVALIATION_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY"),
        TypeOrmModule.forFeature([], "USER_REPOSITORY")
    ],
    controllers: [AvaliationController],
    providers: [
        ...AvaliationProviders,
        AvaliationService,
        EntrepreneurService,
        ...EntrepreneurProviders,
        SchedulingService,
        ...UserProviders,
        ...ScheduleProviders,
        ...ModalityProviders
    ]
})
export class AvaliationModule {}
