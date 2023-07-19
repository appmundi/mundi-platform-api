import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { UserProviders } from "./user.providers"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { AuthModule } from "src/auth/auth.module"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [UserController],
    providers: [...UserProviders, UserService],
    exports: [UserService]
})
export class UserModule {}
