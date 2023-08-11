import { Module, forwardRef } from "@nestjs/common"
import { DatabaseModule } from "../../database/database.module"
import { UserProviders } from "./user.providers"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { AuthModule } from "src/auth/auth.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([User])
    ],
    controllers: [UserController],
    providers: [...UserProviders, UserService],
    exports: [UserService, ...UserProviders, UserModule]
})
export class UserModule {}
