import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { Request as ExpressRequest } from "express"
import { JwtAuthGuard } from "../../auth/jwt-auth.guard"
import { UserAddressService } from "./user-address.service"
import { CreateUserAddressDto } from "./dto/create-user-address.dto"
import { UserAddress } from "./entities/user-address.entity"

// Shape real de req.user sob JwtAuthGuard — ver JwtStrategy.validate()
// (retorna { userId, username }). NÃO usar a interface AuthenticatedRequest
// de src/controller/helpers: ela está desatualizada (tipa user.id como
// string) e não é usada em nenhum outro lugar do projeto.
interface RequestWithUser extends ExpressRequest {
    user: { userId: number; username: string }
}

@Controller("user/address")
@UseGuards(JwtAuthGuard)
export class UserAddressController {
    constructor(private readonly userAddressService: UserAddressService) {}

    @Get()
    async findByUserId(
        @Request() req: RequestWithUser
    ): Promise<UserAddress[]> {
        return this.userAddressService.findByUserId(req.user.userId)
    }

    @Post()
    @UsePipes(ValidationPipe)
    async create(
        @Request() req: RequestWithUser,
        @Body() dto: CreateUserAddressDto
    ): Promise<UserAddress> {
        return this.userAddressService.create(req.user.userId, dto)
    }

    @Delete(":id")
    async delete(
        @Request() req: RequestWithUser,
        @Param("id") id: number
    ): Promise<void> {
        return this.userAddressService.delete(Number(id), req.user.userId)
    }
}
