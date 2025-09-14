import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { UserProviders } from "./user.providers"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { AuthModule } from "src/auth/auth.module"
import { MailService } from "src/mail/mail.service"
import { JwtService } from "@nestjs/jwt"
import { ImagesService } from "../uploads/upload.service"
import { UploadModule } from "../uploads/upload.module"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule), UploadModule],
    controllers: [UserController],
    providers: [...UserProviders, UserService, MailService, JwtService],
    exports: [UserService]
})
export class UserModule {}
