import { Controller, Get } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

@ApiTags("scheduling")
@ApiTags("entrepreneur")
@ApiTags("user")
@ApiTags("avaliation")
@ApiTags("geolocation")
@ApiTags("work")
@Controller("swagger")
export class SwaggerController {
    @Get()
    findAll(): string {
        return "Este é um exemplo de endpoint"
    }
}
