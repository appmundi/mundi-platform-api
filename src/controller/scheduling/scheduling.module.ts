import { Module, forwardRef } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { SchedulingController } from "./scheduling.controller"
import { DatabaseModule } from "../../database/database.module"
import { AuthModule } from "../../auth/auth.module"
import { ScheduleProviders } from "./scheduling.providers"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserProviders } from "../user/user.providers"
import { EntrepreneurProviders } from "../entrepreneur/entrepreneur.providers"
import { ModalityProviders } from "../modality/modality.providers"
import { NotificationsModule } from "../notifications/notifications.module"
import { DailyAgendaCron } from "./daily_agenda.cron"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        forwardRef(() => NotificationsModule),
        TypeOrmModule.forFeature([], "SCHEDULE_REPOSITORY"),
        TypeOrmModule.forFeature([], "ENTREPRENEUR_REPOSITORY"),
        TypeOrmModule.forFeature([], "USER_REPOSITORY"),
        TypeOrmModule.forFeature([], "AVALIATION_REPOSITORY"),
    ],
    controllers: [SchedulingController],
    providers: [
        SchedulingService,
        DailyAgendaCron,
        ...ScheduleProviders,
        ...UserProviders,
        ...EntrepreneurProviders,
        ...ModalityProviders
    ]
})
export class SchedulingModule {}
