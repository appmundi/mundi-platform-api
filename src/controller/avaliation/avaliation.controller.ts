import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Delete,
    Param
} from "@nestjs/common"
import { AvaliationService } from "./avaliation.service"
import { CreateAvaliationDto } from "./dto/create-avaliation.dto"
import { ResultDto } from "src/dto/result.dto"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { Avaliation } from "./entities/avaliation.entity"

@Controller("avaliation")
export class AvaliationController {
    constructor(private readonly avaliationService: AvaliationService) {}

    @UseGuards(JwtAuthGuard)
    @Post("create")
    async create(@Body() data: CreateAvaliationDto): Promise<ResultDto> {
        return this.avaliationService.create(data)
    }

    @Get(":id")
    async findAll(@Param("id") id: number): Promise<Avaliation[]> {
        return this.avaliationService.findAll(id)
    }
}
