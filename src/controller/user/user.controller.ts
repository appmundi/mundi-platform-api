import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
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
        return this.userService.findAll()
    }

    @Get("searchById:id")
    async findOneByUserId(@Param("id") userId: number): Promise<User> {
        try{
            return this.userService.findOneByUserId(userId)
        }catch(e){
            console.log(e)
        }
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
    async login(
        @Body()
        req: {
            email: string
            password: string
            isEntrepreneur: boolean
        }
    ) {
        console.log(`Trying to validate user: ${req.email}`);
        const { email, password, isEntrepreneur } = req
        const user = await this.authService.validateUser(
            email,
            password,
            isEntrepreneur
        )

        if (!email) {
            throw new UnauthorizedException("Email não encontrado.")
        }

        if (!password) {
            throw new UnauthorizedException("Senha incorreta.")
        }

        if (!user) {
            throw new UnauthorizedException(
                "Não foi possível autenticar o usuário."
            )
        }

        const { name, userId } = user

        return this.authService.login(userId, name)
    }

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
