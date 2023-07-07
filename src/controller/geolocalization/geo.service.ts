import { Injectable } from "@nestjs/common"
import * as geoip from "geoip-lite"

@Injectable()
export class GeoService {
    getGeolocation(ip: string) {
        const geolocation = geoip.lookup(ip)
        if (!geolocation) {
            throw new Error(
                "Não foi possível obter a geolocalização para o endereço IP fornecido."
            )
        }
        return geolocation
    }
}
