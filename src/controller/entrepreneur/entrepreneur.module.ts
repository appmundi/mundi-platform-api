import { Module, forwardRef } from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { EntrepreneurController } from "./entrepreneur.controller"
import { EntrepreneurProviders } from "./entrepreneur.providers"

import { DatabaseModule } from "src/database/database.module"
import { AuthModule } from "src/auth/auth.module"
import { MailService } from "src/mail/mail.service"

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [EntrepreneurController],
    providers: [...EntrepreneurProviders, EntrepreneurService, MailService],
    exports: [EntrepreneurService]
})
export class EntrepreneurModule {}
