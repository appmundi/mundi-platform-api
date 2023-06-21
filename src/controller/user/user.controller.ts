import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    ValidationPipe,
    UsePipes,
    HttpException,
    HttpStatus
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { UserService } from "./user.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"
import { AuthService } from "src/auth/auth.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ReturnUserDto } from "./dto/return-user.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"

@Controller("user")
export class UserController {
    constructor(
        private readonly userService: UserService,
        private authService: AuthService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get("searchAll")
    async findAll(): Promise<ReturnUserDto[]> {
        return (await this.userService.findAll()).map(
            (user_register) => new ReturnUserDto(user_register)
        )
    }

    @UsePipes(ValidationPipe)
    @Post("register")
    async create(@Body() data: CreateUserDto): Promise<ResultDto> {
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
        return this.userService.register(data)
    }

    @UseGuards(AuthGuard("local"))
    @Post("login")
    async login(@Request() req) {
        return this.authService.login(req.user)
    }
}
