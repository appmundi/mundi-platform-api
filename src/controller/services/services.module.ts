import { Module } from "@nestjs/common"
import { ServicesService } from "./services.service"
import { ServicesController } from "./services.controller"
import { ServiceProviders } from "./entities/service.providers"
import { DatabaseModule } from "src/database/database.module"

@Module({
    imports: [DatabaseModule],
    controllers: [ServicesController],
    providers: [...ServiceProviders, ServicesService]
})
export class ServicesModule {}
