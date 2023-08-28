import { Controller, Get } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

@ApiTags("scheduling")
@ApiTags("entrepreneur")
@ApiTags("user")
@ApiTags("avaliation")
@ApiTags("geolocation")
@Controller("swagger")
export class ExemploController {
    @Get()
    findAll(): string {
        return "Este é um exemplo de endpoint"
    }
}
