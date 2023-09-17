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
    constructor(private readonly entrepreneurService: EntrepreneurService, private authService: AuthService) { }


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
        return this.entrepreneurService.findAll()
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
    async login(@Body() req: { email: string, password: string, isEntrepreneur: boolean }) {
        try {

            const { name,  entrepreneurId } = await this.authService.validateUser(req.email, req.password, req.isEntrepreneur);

            if (name && entrepreneurId) {
                return this.authService.login(entrepreneurId, name)
            } else {
                throw new UnauthorizedException()
            }
        } catch (e) {
            throw new UnauthorizedException()
        }
    }
}
