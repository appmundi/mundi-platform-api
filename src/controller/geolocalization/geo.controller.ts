import { Controller, Get, Req } from "@nestjs/common"
import { GeoService } from "./geo.service"

@Controller("geolocation")
export class GeolocationController {
    constructor(private readonly geoService: GeoService) {}

    @Get()
    getGeolocation(@Req() request) {
        const ip = request.ip
        const geolocation = this.geoService.getGeolocation(ip)
        return geolocation
    }
}
