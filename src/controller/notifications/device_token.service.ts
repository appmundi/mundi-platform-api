import { Injectable, Inject, Logger } from "@nestjs/common"
import { Repository } from "typeorm"
import { DeviceToken } from "./entities/device_token.entity"

@Injectable()
export class DeviceTokenService {
    private readonly logger = new Logger(DeviceTokenService.name)

    constructor(
        @Inject("DEVICE_TOKEN_REPOSITORY")
        private deviceTokenRepository: Repository<DeviceToken>
    ) {}

    async upsert(
        token: string,
        platform: "android" | "ios",
        ownerType: "user" | "entrepreneur",
        ownerId: number,
        appVersion?: string
    ): Promise<void> {
        // Atomic INSERT ... ON DUPLICATE KEY UPDATE avoids race conditions
        await this.deviceTokenRepository
            .createQueryBuilder()
            .insert()
            .into(DeviceToken)
            .values({ token, platform, ownerType, ownerId, appVersion: appVersion ?? null })
            .orUpdate(["platform", "ownerType", "ownerId", "appVersion"], ["token"])
            .execute()
    }

    async findByOwner(
        ownerType: "user" | "entrepreneur",
        ownerId: number
    ): Promise<DeviceToken[]> {
        return this.deviceTokenRepository.find({
            where: { ownerType, ownerId }
        })
    }

    async removeByToken(token: string): Promise<void> {
        await this.deviceTokenRepository.delete({ token })
    }
}
