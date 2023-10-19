import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    ValidationPipe,
    UsePipes,
    HttpException,
    HttpStatus,
    Put,
    Delete,
    Param,
    Request,
    UnauthorizedException
} from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { ResultDto } from "src/dto/result.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "src/auth/auth.service"

@Controller("entrepreneur")
export class EntrepreneurController {
    constructor(
        private readonly entrepreneurService: EntrepreneurService,
        private authService: AuthService
    ) { }

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

    @Get("searchAll")
    async findAll(): Promise<Entrepreneur[]> {
        console.log("trying to retrive all Entrepreneurs")
        return this.entrepreneurService.findAll()
    }

    @Get("search/:id")
    async findOneEntrepreneur(
        @Param("id") entrepreneurId: number
    ): Promise<Entrepreneur> {
        console.log("trying to retrive Entrepreneur", entrepreneurId)
        return this.entrepreneurService.findOneById(entrepreneurId)
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    async updateUser(
        @Param("id") id: number,
        @Body() updateUserDto: Entrepreneur
    ): Promise<Entrepreneur> {
        return this.entrepreneurService.updateUser(id, updateUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteUser(@Param("id") id: number): Promise<void> {
        return this.entrepreneurService.deleteUser(id)
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
        try {
            console.log(`Trying to validate user: ${req.email}`);
            if (
                !req ||
                !req.email ||
                !req.password ||
                req.isEntrepreneur === undefined
            ) {
                throw new UnauthorizedException(
                    "Dados de autenticação inválidos."
                )
            }

            console.log(`Trying to validate user: ${req.email}`);

            const { email, name, entrepreneurId, password } =
                await this.authService.validateUser(
                    req.email,
                    req.password,
                    req.isEntrepreneur
                )

            if (!email) {
                throw new UnauthorizedException("E-mail incorreto.")
            }

            if (!password) {
                throw new UnauthorizedException("Senha incorreta.")
            }

            return await this.authService.login(entrepreneurId, name)
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException("Erro de autenticação.")
        }
    }
}
