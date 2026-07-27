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
    Patch,
    Delete,
    Param,
    Request,
    UnauthorizedException,
    Inject,
    UseInterceptors,
    UploadedFile,
    Query,
    Logger
} from "@nestjs/common"
import { Headers } from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import { EntrepreneurService, NearbyResult } from "./entrepreneur.service"
import { parseCoordinatePair } from "../helpers/geo"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { UpdateOperationsDto } from "./dto/update-operations.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { ResultDto } from "../../dto/result.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"
import { JwtAuthGuard } from "../../auth/jwt-auth.guard"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "../../auth/auth.service"
import { Schedule } from "../scheduling/entities/scheduling.entity"
import { Work } from "../work/entities/work.entity"
import { Category } from "../category/entities/category.entity"
import { MailService } from "../../mail/mail.service"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { FileInterceptor } from "@nestjs/platform-express"

@Controller("entrepreneur")
export class EntrepreneurController {
    private readonly logger = new Logger(EntrepreneurController.name)

    constructor(
        private readonly entrepreneurService: EntrepreneurService,
        private authService: AuthService,
        private mailService: MailService,
        @Inject("ENTREPRENEUR_REPOSITORY")
        private entrepreneurRepository: Repository<Entrepreneur>,
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
    async findAll(
        @Query("query") query?: string,
        @Query("section") section?: string,
    ): Promise<Entrepreneur[]> {
        return this.entrepreneurService.findAll(query, section)
    }

    @Get("nearby")
    async findNearby(
        @Query("query") query?: string,
        @Query("section") section?: string,
        @Query("lat") lat?: string,
        @Query("lng") lng?: string,
        @Headers("authorization") authorizationHeader?: string
    ): Promise<NearbyResult> {
        const position = parseCoordinatePair(lat, lng)
        const caller = this.decodeCallerOrNull(authorizationHeader)

        return this.entrepreneurService.findNearby({
            query,
            section,
            latitude: position?.latitude,
            longitude: position?.longitude,
            userId: caller?.id,
            role: caller?.role
        })
    }

    // Este endpoint nunca pode responder 401/400: o app trata 401 como sucesso
    // (validateStatus) e qualquer outro erro vira tela de erro na home.
    private decodeCallerOrNull(
        authorizationHeader?: string
    ): { id?: number; role?: string } | null {
        if (!authorizationHeader) return null

        try {
            const token = authorizationHeader.split(" ")[1]
            if (!token) return null

            const payload = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            ) as unknown as { sub?: number; id?: number; role?: string }

            return { id: payload.id ?? payload.sub, role: payload.role }
        } catch {
            return null
        }
    }

    @Get("check-availability")
    async checkAvailability(
        @Query("email") email?: string,
        @Query("doc") doc?: string
    ): Promise<{ status: boolean; emailInUse?: boolean; docInUse?: boolean }> {
        const result: { emailInUse?: boolean; docInUse?: boolean } = {}
        if (email) {
            const existing = await this.entrepreneurService.findOneByEmail(
                email.trim()
            )
            result.emailInUse = !!existing
        }
        if (doc) {
            const digits = doc.replace(/\D/g, "")
            const existing = await this.entrepreneurService.findOneByCpf(digits)
            result.docInUse = !!existing
        }
        return { status: true, ...result }
    }

    @Get("search/:id")
    async findOneEntrepreneur(
        @Param("id") entrepreneurId: number
    ): Promise<Entrepreneur> {
        this.logger.debug(`findOneEntrepreneur id=${entrepreneurId}`)
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
        this.logger.debug(`deleteUser id=${id}`)
        await this.entrepreneurService.deleteUser(id)
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

            this.logger.debug(`login attempt: ${req.email}`)

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

            return await this.authService.login(entrepreneurId, name, "entrepreneur")
        } catch (e) {
            this.logger.warn(`login failed: ${e.message}`)
            throw new UnauthorizedException("Erro de autenticação.")
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id/operations")
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateOperations(
        @Param("id") id: number,
        @Body() dto: UpdateOperationsDto,
    ): Promise<void> {
        await this.entrepreneurService.updateOperations(id, dto.operations)
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
        @Body() categoryData: Category[]
    ): Promise<ResultDto> {
        try {
            await this.entrepreneurService.updateCategory(id, categoryData)

            return {
                mensagem: "Categorias atualizadas",
                status: true,
            };
        } catch(error) {
            throw new HttpException(
                error.message || 'Erro ao processar a solicitação',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

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
