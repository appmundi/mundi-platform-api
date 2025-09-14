import {
    Inject,
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
    UnauthorizedException,
    UseInterceptors,
    UploadedFile,
    Request
} from "@nestjs/common"
import { UserService } from "./user.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"
import { AuthService } from "src/auth/auth.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ReturnUserDto } from "./dto/return-user.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"
import { User } from "./entities/user.entity"
import { MailService } from "../../mail/mail.service"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { FileInterceptor } from "@nestjs/platform-express"
import { ImagesService } from "../uploads/upload.service"
import { JwtService } from "@nestjs/jwt"
import { AuthenticatedRequest } from "../helpers/authenticated_request"

@Controller("user")
export class UserController {
    constructor(
        private readonly userService: UserService,
        private authService: AuthService,
        private mailService: MailService,
        private imageService: ImagesService,
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get("searchAll")
    async findAll(): Promise<ReturnUserDto[]> {
        return this.userService.findAll()
    }

    @Get("searchById:id")
    async findOneByUserId(@Param("id") userId: number): Promise<User> {
        try {
            return this.userService.findOneByUserId(userId)
        } catch (e) {
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
        console.log(`Trying to validate user: ${req.email}`)
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

    @Post("reset-password")
    async requestResetPassword(
        @Body("email") email: string
    ): Promise<ResultDto> {
        try {
            const user = await this.userService.findOneByEmail(email)
            if (!user) {
                throw new HttpException(
                    "Usuário não encontrado",
                    HttpStatus.NOT_FOUND
                )
            }

            const resetCode = this.userService.generateResetCode()
            await this.userService.setResetPasswordCode(email, resetCode)

            await this.mailService.sendResetPasswordEmail(email, resetCode)

            return {
                status: true,
                mensagem: "E-mail de redefinição de senha enviado com sucesso."
            }
        } catch (error) {
            throw new HttpException(
                error.message || "Erro ao processar a solicitação",
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post("validate-reset-code")
    async validateResetCode(
        @Body("email") email: string,
        @Body("code") code: string
    ): Promise<ResultDto> {
        try {
            const isValid = await this.userService.validateResetPasswordCode(
                email,
                code
            )
            if (!isValid) {
                throw new HttpException(
                    "Código inválido ou expirado",
                    HttpStatus.BAD_REQUEST
                )
            }

            return {
                status: true,
                mensagem: "Código válido."
            }
        } catch (error) {
            throw new HttpException(
                error.message || "Erro ao validar o código",
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post("update-password")
    async updatePassword(
        @Body("email") email: string,
        @Body("code") code: string,
        @Body("newPassword") newPassword: string
    ): Promise<ResultDto> {
        try {
            const isValid = await this.userService.validateResetPasswordCode(
                email,
                code
            )
            if (!isValid) {
                throw new HttpException(
                    "Código inválido ou expirado",
                    HttpStatus.BAD_REQUEST
                )
            }

            const user = await this.userService.findOneByEmail(email)
            if (!user) {
                throw new HttpException(
                    "Usuário não encontrado",
                    HttpStatus.NOT_FOUND
                )
            }

            user.password = bcrypt.hashSync(newPassword, 8)
            await this.userRepository.save(user)

            await this.userService.clearResetPasswordCode(email)

            return {
                status: true,
                mensagem: "Senha atualizada com sucesso."
            }
        } catch (error) {
            throw new HttpException(
                error.message || "Erro ao atualizar a senha",
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put("/update-image/:id")
    @UseInterceptors(FileInterceptor("image"))
    async updateImage(
        @UploadedFile() image: Express.Multer.File,
        @Param("id") id: string
    ) {
        const result = await this.imageService.storeImage(image)
        await this.userService.updateImage(Number(id), result.name)

        return { status: true, message: "Imagem atualizada com sucesso." }
    }
}
