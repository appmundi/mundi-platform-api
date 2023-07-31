import { Module, forwardRef } from "@nestjs/common"
import { AvaliationService } from "./avaliation.service"
import { AvaliationController } from "./avaliation.controller"
import { AvaliationProviders } from "./avaliation.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [AvaliationController],
    providers: [...AvaliationProviders, AvaliationService]
})
export class AvaliationModule {}
