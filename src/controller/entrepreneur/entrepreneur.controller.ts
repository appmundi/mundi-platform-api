import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    ValidationPipe,
    UsePipes,
    HttpException,
    HttpStatus
} from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { ResultDto } from "src/dto/result.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"

@Controller("entrepreneur")
export class EntrepreneurController {
    constructor(private readonly entrepreneurService: EntrepreneurService) {}

    @UsePipes(ValidationPipe)
    @Post("register")
    async create(@Body() data: CreateEntrepreneurDto): Promise<ResultDto> {
        if (!ValidateDoc(data.doc)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Cpf invalido"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        if (!ValidatePhone(data.phone)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Telefone invalido"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        return this.entrepreneurService.register(data)
    }

    @UseGuards(JwtAuthGuard)
    @Get("searchAll")
    async findAll(): Promise<Entrepreneur[]> {
        return this.entrepreneurService.findAll()
    }
}
