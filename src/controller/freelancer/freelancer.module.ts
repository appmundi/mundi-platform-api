import { Module } from "@nestjs/common"
import { FreelancerService } from "./freelancer.service"
import { FreelancerController } from "./freelancer.controller"
import { FreelancerProviders } from "./freelancer.providers"
import { DatabaseModule } from "src/database/database.module"

@Module({
    imports: [DatabaseModule],
    controllers: [FreelancerController],
    providers: [...FreelancerProviders, FreelancerService]
})
export class FreelancerModule {}
