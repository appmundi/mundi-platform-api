import { Injectable } from "@nestjs/common"
import * as geoip from "geoip-lite"

@Injectable()
export class GeoIPProvider {
    getGeolocation(ip: string) {
        return geoip.lookup(ip)
    }
}
