import { Injectable, OnModuleInit, Logger } from "@nestjs/common"
import * as admin from "firebase-admin"
import { DeviceTokenService } from "./device_token.service"

@Injectable()
export class FcmService implements OnModuleInit {
    private readonly logger = new Logger(FcmService.name)
    private app: admin.app.App

    constructor(private readonly deviceTokenService: DeviceTokenService) {}

    onModuleInit() {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
        if (!raw) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 not set")
        }
        // Guard against duplicate initialization (hot-reload, test re-entry)
        const existing = admin.apps.find((a) => a?.name === "mundi-notifications")
        if (existing) {
            this.app = existing
            return
        }
        const json = JSON.parse(
            Buffer.from(raw, "base64").toString("utf8")
        )
        this.app = admin.initializeApp(
            { credential: admin.credential.cert(json) },
            "mundi-notifications"
        )
    }

    async sendToToken(
        token: string,
        data: Record<string, string>
    ): Promise<void> {
        try {
            await admin.messaging(this.app).send({
                token,
                data,
                android: { priority: "high", ttl: 300_000 },
                apns: this.apnsConfig()
            })
        } catch (e: any) {
            const code: string = e?.errorInfo?.code ?? ""
            if (
                code === "messaging/registration-token-not-registered" ||
                code === "messaging/invalid-argument"
            ) {
                await this.deviceTokenService.removeByToken(token)
                this.logger.warn(`Removed stale FCM token: ${token.slice(0, 20)}…`)
            } else {
                this.logger.error(`FCM send error: ${code}`, e?.message)
            }
        }
    }

    async sendToTokens(
        tokens: string[],
        data: Record<string, string>
    ): Promise<void> {
        if (!tokens.length) return

        const response = await admin
            .messaging(this.app)
            .sendEachForMulticast({
                tokens,
                data,
                android: { priority: "high" },
                apns: this.apnsConfig()
            })

        const staleCleanup: Promise<void>[] = []
        response.responses.forEach((r, i) => {
            if (!r.success) {
                const code = r.error?.code ?? ""
                if (
                    code === "messaging/registration-token-not-registered" ||
                    code === "messaging/invalid-argument"
                ) {
                    staleCleanup.push(
                        this.deviceTokenService.removeByToken(tokens[i])
                    )
                } else {
                    this.logger.error(
                        `FCM multicast error for token[${i}]: ${code}`
                    )
                }
            }
        })
        await Promise.all(staleCleanup)
    }

    private apnsConfig(): admin.messaging.ApnsConfig {
        return {
            headers: {
                "apns-priority": "10",
                "apns-push-type": "alert"
            },
            payload: {
                aps: {
                    "content-available": 1,
                    "mutable-content": 1,
                    alert: { title: "Mundi", body: "Toque para ver" }
                }
            }
        }
    }
}
