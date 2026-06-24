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

export interface DailyAgendaClientPayload {
    scheduleId: number
    serviceName: string
    providerName: string
    appointmentDatetime: Date
}

export interface NewBookingPayload {
    scheduleId: number
    serviceName: string
    clientName: string
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

    /// Morning reminder to the client: one push per appointment happening today.
    async notifyDailyAgendaClient(
        clientUserId: number,
        payload: DailyAgendaClientPayload
    ): Promise<void> {
        const tokens = await this.deviceTokenService.findByOwner(
            "user",
            clientUserId
        )
        if (!tokens.length) return

        const data: Record<string, string> = {
            type: "daily_agenda",
            appointment_id: String(payload.scheduleId),
            service_name: payload.serviceName,
            provider_name: payload.providerName,
            appointment_datetime: payload.appointmentDatetime.toISOString()
        }

        await this.fcmService.sendToTokens(
            tokens.map((t) => t.token),
            data
        )
    }

    /// New booking made by a client: notify the entrepreneur of the establishment.
    async notifyNewBooking(
        entrepreneurId: number,
        payload: NewBookingPayload
    ): Promise<void> {
        const tokens = await this.deviceTokenService.findByOwner(
            "entrepreneur",
            entrepreneurId
        )
        if (!tokens.length) return

        const data: Record<string, string> = {
            type: "new_booking",
            appointment_id: String(payload.scheduleId),
            service_name: payload.serviceName,
            other_party_name: payload.clientName,
            appointment_datetime: payload.appointmentDatetime.toISOString()
        }

        await this.fcmService.sendToTokens(
            tokens.map((t) => t.token),
            data
        )
        this.logger.log(
            `new_booking sent to entrepreneur ${entrepreneurId} — ${tokens.length} token(s)`
        )
    }

    /// Morning summary to the entrepreneur: a single aggregated push with the
    /// number of appointments scheduled for today.
    async notifyDailyAgendaEntrepreneur(
        entrepreneurId: number,
        count: number
    ): Promise<void> {
        if (count <= 0) return

        const tokens = await this.deviceTokenService.findByOwner(
            "entrepreneur",
            entrepreneurId
        )
        if (!tokens.length) return

        const data: Record<string, string> = {
            type: "daily_agenda",
            count: String(count)
        }

        await this.fcmService.sendToTokens(
            tokens.map((t) => t.token),
            data
        )
    }
}
