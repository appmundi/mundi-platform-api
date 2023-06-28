import { Controller, Post, Body } from "@nestjs/common"
import { ServicesService } from "./services.service"
import { CreateServiceDto } from "./dto/create-service.dto"
import { ResultDto } from "src/dto/result.dto"

@Controller("services")
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Post("create")
    async create(@Body() data: CreateServiceDto): Promise<ResultDto> {
        return this.servicesService.register(data)
    }
}
