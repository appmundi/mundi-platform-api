import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UserModule } from "./controller/user/user.module"
import { FreelancerModule } from "./controller/freelancer/freelancer.module"

require("dotenv").config()

@Module({
    imports: [UserModule, FreelancerModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
