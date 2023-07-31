import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { EntrepreneurModule } from "./controller/entrepreneur/entrepreneur.module"
import { GeolocationModule } from "./controller/geolocalization/geo.module"
import { AvaliationModule } from "./controller/avaliation/avaliation.module"

require("dotenv").config()

@Module({
    imports: [
        AuthModule,
        EntrepreneurModule,
        GeolocationModule,
        AvaliationModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
