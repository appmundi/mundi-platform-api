import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"
import { WorkProviders } from "./work.providers"
import { WorkService } from "./work.service"
import { WorkController } from "./work.controller"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "WORK_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY")
    ],
    controllers: [WorkController],
    providers: [
        ...WorkProviders,
        WorkService,
        EntrepreneurService,
        ...EntrepreneurProviders
    ]
})
export class WorkModule {}
