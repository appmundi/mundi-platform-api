import { Injectable, OnModuleInit, Logger } from "@nestjs/common"
import * as admin from "firebase-admin"
import { DeviceTokenService } from "./device_token.service"

/** Texto exibido no iOS, onde a notificação não é montada pelo app. */
export interface PushAlert {
    title: string
    body: string
}

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
        data: Record<string, string>,
        alert: PushAlert
    ): Promise<void> {
        try {
            await admin.messaging(this.app).send({
                token,
                data,
                android: { priority: "high", ttl: 300_000 },
                apns: this.apnsConfig(alert)
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
        data: Record<string, string>,
        alert: PushAlert
    ): Promise<void> {
        if (!tokens.length) return

        try {
            const response = await admin
                .messaging(this.app)
                .sendEachForMulticast({
                    tokens,
                    data,
                    android: { priority: "high" },
                    apns: this.apnsConfig(alert)
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
        } catch (e) {
            this.logger.error(`FCM multicast send error: ${e?.message ?? e}`)
        }
    }

    /**
     * iOS recebe um alerta pronto; Android ignora este bloco e continua
     * renderizando pelo `silentDataHandle` a partir do `data`.
     *
     * O tratamento precisa ser diferente por plataforma porque o layout
     * ProgressBar do fluxo de agendamento é exclusivo do Android
     * (awesome_notifications, README "ProgressBar and Inbox layouts are only
     * available for Android devices"), e push silencioso no iOS não é entregue
     * de forma confiável. O texto enviado aqui espelha o que o Android monta,
     * para o usuário ler a mesma coisa nas duas plataformas.
     *
     * Sem `mutable-content`: o `data` não está no formato do awesome, então a
     * Notification Service Extension marcaria como INVALID e exibiria o texto
     * cru mesmo assim. Sem ela, o alerta chega exatamente como enviado.
     */
    private apnsConfig(alert: PushAlert): admin.messaging.ApnsConfig {
        return {
            headers: {
                "apns-push-type": "alert",
                "apns-priority": "10"
            },
            payload: {
                aps: {
                    alert: { title: alert.title, body: alert.body },
                    sound: "default"
                }
            }
        }
    }
}
