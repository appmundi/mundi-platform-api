import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { EntrepreneurModule } from "./controller/entrepreneur/entrepreneur.module"

require("dotenv").config()

@Module({
    imports: [AuthModule, EntrepreneurModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
