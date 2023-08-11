import { Module, forwardRef } from "@nestjs/common"
import { SchedulingService } from "./scheduling.service"
import { SchedulingController } from "./scheduling.controller"
import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { UserProviders } from "../user/user.providers"
import { UserModule } from "../user/user.module"
import { EntrepreneurModule } from "../entrepreneur/entrepreneur.module"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        UserModule,
        EntrepreneurModule
    ],
    controllers: [SchedulingController],
    providers: [SchedulingService, ...UserProviders]
})
export class SchedulingModule {}
