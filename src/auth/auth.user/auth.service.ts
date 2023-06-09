import { Injectable } from "@nestjs/common"
import { UserService } from "../../controller/user/user.service"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async signIn(email: string, password: string): Promise<any> {
        const user = await this.userService.findOne(email)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user
            return result
        }
        return null
    }
}
