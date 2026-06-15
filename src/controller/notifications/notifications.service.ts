import { Injectable, Logger } from "@nestjs/common"
import { FcmService } from "./fcm.service"
import { DeviceTokenService } from "./device_token.service"

export type ServiceStep = "en_route" | "started" | "finished"

export interface ServiceStepPayload {
    scheduleId: number
    providerName: string
    modalityTitle: string
    eta?: string
}

export interface CancellationPayload {
    scheduleId: number
    serviceName: string
    cancellerName: string
    cancellerRole: "user" | "entrepreneur"
    appointmentDatetime: Date
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name)

    constructor(
        private readonly fcmService: FcmService,
        private readonly deviceTokenService: DeviceTokenService
    ) {}

    async notifyServiceStep(
        clientUserId: number,
        step: ServiceStep,
        payload: ServiceStepPayload
    ): Promise<void> {
        const tokens = await this.deviceTokenService.findByOwner(
            "user",
            clientUserId
        )
        if (!tokens.length) return

        const data: Record<string, string> = {
            type: "service_step",
            appointment_id: String(payload.scheduleId),
            step,
            provider_name: payload.providerName,
            modality_title: payload.modalityTitle,
            eta: payload.eta ?? "",
            provider_avatar_url: ""
        }

        await this.fcmService.sendToTokens(
            tokens.map((t) => t.token),
            data
        )
        this.logger.log(
            `service_step(${step}) sent to user ${clientUserId} — ${tokens.length} token(s)`
        )
    }

    async notifyCancellation(
        otherPartyOwnerType: "user" | "entrepreneur",
        otherPartyId: number,
        payload: CancellationPayload
    ): Promise<void> {
        const tokens = await this.deviceTokenService.findByOwner(
            otherPartyOwnerType,
            otherPartyId
        )
        if (!tokens.length) return

        const data: Record<string, string> = {
            type: "cancellation",
            appointment_id: String(payload.scheduleId),
            service_name: payload.serviceName,
            other_party_name: payload.cancellerName,
            other_party_role: payload.cancellerRole,
            appointment_datetime: payload.appointmentDatetime.toISOString()
        }

        await this.fcmService.sendToTokens(
            tokens.map((t) => t.token),
            data
        )
        this.logger.log(
            `cancellation sent to ${otherPartyOwnerType} ${otherPartyId} — ${tokens.length} token(s)`
        )
    }
}
