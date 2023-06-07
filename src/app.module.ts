import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UserModule } from "./controller/user/user.module"

require("dotenv").config()

@Module({
    imports: [UserModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
