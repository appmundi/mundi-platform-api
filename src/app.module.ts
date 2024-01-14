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
import { UploadModule } from "./controller/uploads/upload.module"
import { ModalityModule } from "./controller/modality/modality.module"
import { CategoryModule } from "./controller/category/category.module"
import { registerClientModule } from "./controller/registerClient/client.module"

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
        UploadModule,
        ModalityModule,
        CategoryModule,
        registerClientModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
