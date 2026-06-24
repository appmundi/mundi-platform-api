import {
    Controller,
    Post,
    Delete,
    Body,
    Headers,
    Param,
    HttpException,
    HttpStatus
} from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import { RegisterTokenDto } from "./dto/register-token.dto"
import { DeviceTokenService } from "./device_token.service"

interface JwtPayload {
    id: number
    username: string
}

@Controller("device-tokens")
export class NotificationsController {
    constructor(
        private readonly deviceTokenService: DeviceTokenService
    ) {}

    @Post()
    async registerToken(
        @Body() body: RegisterTokenDto,
        @Headers("authorization") authorizationHeader: string
    ) {
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            )
        }

        const token = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(token) as JwtPayload

        if (!decodedToken?.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

        await this.deviceTokenService.upsert(
            body.token,
            body.platform,
            body.ownerType,
            decodedToken.id,
            body.appVersion
        )

        return { message: "Token registrado com sucesso" }
    }

    @Delete(":token")
    async unregisterToken(
        @Param("token") fcmToken: string,
        @Headers("authorization") authorizationHeader: string
    ) {
        if (!authorizationHeader) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT ausente" },
                HttpStatus.BAD_REQUEST
            )
        }

        const jwtToken = authorizationHeader.split(" ")[1]
        const decodedToken = jwt.decode(jwtToken) as JwtPayload

        if (!decodedToken?.id) {
            throw new HttpException(
                { status: HttpStatus.BAD_REQUEST, error: "Token JWT inválido" },
                HttpStatus.BAD_REQUEST
            )
        }

        await this.deviceTokenService.removeByToken(
            decodeURIComponent(fcmToken)
        )

        return { message: "Token removido com sucesso" }
    }
}
