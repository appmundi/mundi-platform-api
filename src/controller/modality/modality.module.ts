import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { DatabaseModule } from "src/database/database.module";
import { ModalityController } from "./modality.controller";
import { ModalityProviders } from "./modality.providers";
import { ModalityService } from "./modality.service";
import { WorkService } from "../work/work.service";
import { WorkProviders } from "../work/work.providers";
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers";
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service";

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "MODALITY_REPOSITORY"),
        TypeOrmModule.forFeature([], "WORK_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY")

    ],
    controllers: [ModalityController],
    providers: [
        ...ModalityProviders,
        ModalityService,
        WorkService,
        ...WorkProviders,
        EntrepreneurService,
        ...EntrepreneurProviders
    ]
})
export class ModalityModule { }