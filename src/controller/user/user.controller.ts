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
    HttpStatus,
    Put,
    Param,
    Delete,
    UnauthorizedException
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
import { User } from "./entities/user.entity"

@Controller("user")
export class UserController {
    constructor(
        private readonly userService: UserService,
        private authService: AuthService
    ) { }

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

    @Post("login")
    async login(@Body() req: { email: string, password: string, isEntrepreneur: boolean }) {


        try {

            const { name, userId } = await this.authService.validateUser(req.email, req.password, req.isEntrepreneur);

            if (name && userId ) {
                return this.authService.login(userId, name)
            } else {
                throw new UnauthorizedException()
            }
        } catch (_) {
            throw new UnauthorizedException()
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    async updateUser(
        @Param("id") id: number,
        @Body() updateUserDto: User
    ): Promise<User> {
        return this.userService.updateUser(id, updateUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteUser(@Param("id") id: number): Promise<void> {
        return this.userService.deleteUser(id)
    }
}
