import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserService } from "../controller/user/user.service"
import { EntrepreneurService } from "src/controller/entrepreneur/entrepreneur.service"
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"
import { User } from "src/controller/user/entities/user.entity"

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private entrepreneurService: EntrepreneurService,
        private jwtService: JwtService
    ) { }

    private async validateUserOrEntrepreneur(
        emailOrCpf: string,
        password: string,
        isEntrepreneur: boolean
    ): Promise<Entrepreneur | User> {
        const isEmail = emailOrCpf.includes("@")
        const service = isEntrepreneur
            ? this.entrepreneurService
            : this.userService

        const user = isEmail
            ? await service.findOneByEmail(emailOrCpf)
            : await service.findOneByCpf(emailOrCpf)



        if (user && (await bcrypt.compare(password, user.password))) {
            return user
        }
        return null
    }

    async validateUser(
        emailOrCpf: string,
        password: string,
        isEntrepreneur: boolean
    ): Promise<any> {
        return this.validateUserOrEntrepreneur(
            emailOrCpf,
            password,
            isEntrepreneur
        )
    }

    async validateEntrepreneur(
        emailOrCpf: string,
        password: string,
        isEntrepreneur: boolean
    ): Promise<any> {
        return this.validateUserOrEntrepreneur(
            emailOrCpf,
            password,
            isEntrepreneur
        )
    }

    async login(userId: string, username: string) {
        const payload = { id: userId, username: username }
        console.log("Payload", payload)
        return {
            status: true,
            message: "Login efetuado com sucesso",
            access_token: this.jwtService.sign(payload)
        }
    }
}
