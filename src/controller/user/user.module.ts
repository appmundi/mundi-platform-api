import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { UserProviders } from "./user.providers"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { AuthModule } from "src/auth/auth.module"
import { MailService } from "src/mail/mail.service"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [UserController],
    providers: [...UserProviders, UserService, MailService],
    exports: [UserService]
})
export class UserModule {}
