import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UserModule } from "./controller/user/user.module"
import { FreelancerModule } from "./controller/freelancer/freelancer.module"
import { AuthModule } from "./auth/auth.user/auth.module"

require("dotenv").config()

@Module({
    imports: [UserModule, FreelancerModule, AuthModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
