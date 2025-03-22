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
    UnauthorizedException,
    Inject
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
import { Schedule } from "../scheduling/entities/scheduling.entity"
import { Work } from "../work/entities/work.entity"
import { Category } from "../category/entities/category.entity"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"

@Controller("entrepreneur")
export class EntrepreneurController {
    constructor(
        private readonly entrepreneurService: EntrepreneurService,
        private authService: AuthService,
        private mailService: MailService,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
    ) {}

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
            console.log(`Trying to validate user: ${req.email}`)
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

            console.log(`Trying to validate user: ${req.email}`)

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
            console.log(e)
            throw new UnauthorizedException("Erro de autenticação.")
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id/update-schedule")
    async updateSchedule(
        @Param("id") id: number,
        @Body() scheduleData: Partial<Schedule[]>
    ): Promise<void> {
        await this.entrepreneurService.updateSchedule(id, scheduleData)
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id/update-work")
    async updateWork(
        @Param("id") id: number,
        @Body() workData: Partial<Work[]>
    ): Promise<void> {
        await this.entrepreneurService.updateWork(id, workData)
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id/update-category")
    async updateCategory(
        @Param("id") id: number,
        @Body() categoryData: Partial<Category[]>
    ): Promise<void> {
        await this.entrepreneurService.updateCategory(id, categoryData)
    }

    @Post('reset-password')
        async requestResetPassword(
            @Body('email') email: string,
        ): Promise<ResultDto> {
            try {
                const user = await this.entrepreneurService.findOneByEmail(email);
                if (!user) {
                    throw new HttpException(
                        'Usuário não encontrado',
                        HttpStatus.NOT_FOUND,
                    );
                }
    
                const resetCode = this.entrepreneurService.generateResetCode();
                await this.entrepreneurService.setResetPasswordCode(email, resetCode);
    
                await this.mailService.sendResetPasswordEmail(email, resetCode);
    
                return {
                    status: true,
                    mensagem: 'E-mail de redefinição de senha enviado com sucesso.',
                };
            } catch (error) {
                throw new HttpException(
                    error.message || 'Erro ao processar a solicitação',
                    error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    
        @Post('validate-reset-code')
        async validateResetCode(
            @Body('email') email: string,
            @Body('code') code: string,
        ): Promise<ResultDto> {
            try {
                const isValid = await this.entrepreneurService.validateResetPasswordCode(
                    email,
                    code,
                );
                if (!isValid) {
                    throw new HttpException(
                        'Código inválido ou expirado',
                        HttpStatus.BAD_REQUEST,
                    );
                }
    
                return {
                    status: true,
                    mensagem: 'Código válido.',
                };
            } catch (error) {
                throw new HttpException(
                    error.message || 'Erro ao validar o código',
                    error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    
        @Post('update-password')
        async updatePassword(
            @Body('email') email: string,
            @Body('code') code: string,
            @Body('newPassword') newPassword: string,
        ): Promise<ResultDto> {
            try {
                const isValid = await this.entrepreneurService.validateResetPasswordCode(
                    email,
                    code,
                );
                if (!isValid) {
                    throw new HttpException(
                        'Código inválido ou expirado',
                        HttpStatus.BAD_REQUEST,
                    );
                }
    
                const user = await this.entrepreneurService.findOneByEmail(email);
                if (!user) {
                    throw new HttpException(
                        'Usuário não encontrado',
                        HttpStatus.NOT_FOUND,
                    );
                }
    
                user.password = bcrypt.hashSync(newPassword, 8);
                await this.entrepreneurRepository.save(user);
    
                await this.entrepreneurService.clearResetPasswordCode(email);
    
                return {
                    status: true,
                    mensagem: 'Senha atualizada com sucesso.',
                };
            } catch (error) {
                throw new HttpException(
                    error.message || 'Erro ao atualizar a senha',
                    error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
}
