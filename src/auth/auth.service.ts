import { Injectable } from "@nestjs/common"
import { UserService } from "../controller/user/user.service"
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findOne(email)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user
            return result
        }
        return null
    }

    async login(user: any) {
        const payload = { sub: user.userId, username: user.username }
        return {
            status: true,
            menssage: "Login efetuado com sucesso",
            access_token: await this.jwtService.sign(payload)
        }
    }
}
