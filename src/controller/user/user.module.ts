import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { UserProviders } from "./user.providers"
import { UserAddressProviders } from "./user-address.providers"
import { UserService } from "./user.service"
import { UserAddressService } from "./user-address.service"
import { UserController } from "./user.controller"
import { UserAddressController } from "./user-address.controller"
import { AuthModule } from "../../auth/auth.module"
import { MailService } from "../../mail/mail.service"
import { JwtService } from "@nestjs/jwt"
import { ImagesService } from "../uploads/upload.service"
import { UploadModule } from "../uploads/upload.module"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule), UploadModule],
    controllers: [UserController, UserAddressController],
    providers: [
        ...UserProviders,
        ...UserAddressProviders,
        UserService,
        UserAddressService,
        MailService,
        JwtService
    ],
    exports: [UserService]
})
export class UserModule {}
