import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { UserService } from "./user.service"
import { user_register } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { ResultDto } from "src/dto/result.dto"

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("searchAll")
    async findAll(): Promise<user_register[]> {
        return this.userService.findAll()
    }

    @Post("register")
    async create(@Body() data: CreateUserDto): Promise<ResultDto> {
        return this.userService.register(data)
    }

    @UseGuards(AuthGuard("local"))
    @Post("login")
    async login(@Request() req) {
        return req.user
    }
}
