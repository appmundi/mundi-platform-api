import { Module, forwardRef } from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { EntrepreneurController } from "./entrepreneur.controller"
import { EntrepreneurProviders } from "./entities/entrepreneur.providers"
import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [EntrepreneurController],
    providers: [...EntrepreneurProviders, EntrepreneurService]
})
export class EntrepreneurModule {}
