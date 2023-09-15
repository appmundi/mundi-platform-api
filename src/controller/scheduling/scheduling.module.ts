import { Module, forwardRef } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { SchedulingController } from "./scheduling.controller"
import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { ScheduleProviders } from "./scheduling.providers"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserProviders } from "../user/user.providers"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "SCHEDULE_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY"),
        TypeOrmModule.forFeature([], "USER_REPOSITORY")
    ],
    controllers: [SchedulingController],
    providers: [
        SchedulingService,
        ...ScheduleProviders,
        ...UserProviders,
        ...EntrepreneurProviders
    ]
})
export class SchedulingModule {}
