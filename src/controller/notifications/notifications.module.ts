import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { AuthModule } from "../../auth/auth.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NotificationsController } from "./notifications.controller"
import { NotificationsService } from "./notifications.service"
import { DeviceTokenService } from "./device_token.service"
import { FcmService } from "./fcm.service"
import { NotificationsProviders } from "./notifications.providers"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([], "DEVICE_TOKEN_REPOSITORY")
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
        DeviceTokenService,
        FcmService,
        ...NotificationsProviders
    ],
    exports: [NotificationsService]
})
export class NotificationsModule {}
