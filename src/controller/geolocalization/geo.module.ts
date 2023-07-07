import { Module } from "@nestjs/common"
import { GeoService } from "./geo.service"
import { GeolocationController } from "./geo.controller"

@Module({
    providers: [GeoService],
    controllers: [GeolocationController]
})
export class GeolocationModule {}
