import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { EntrepreneurModule } from "./controller/entrepreneur/entrepreneur.module"
import { GeolocationModule } from "./controller/geolocalization/geo.module"
import { AvaliationModule } from "./controller/avaliation/avaliation.module"
import { SchedulingModule } from "./controller/scheduling/scheduling.module"
import { UserModule } from "./controller/user/user.module"
import { WorkModule } from "./controller/work/work.module"
import { UploudModule } from "./controller/uploud/uploud.module"

require("dotenv").config()

@Module({
    imports: [
        AuthModule,
        UserModule,
        EntrepreneurModule,
        GeolocationModule,
        AvaliationModule,
        WorkModule,
        SchedulingModule,
        UploudModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
