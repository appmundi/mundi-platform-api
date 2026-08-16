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

/**
 * Espelha os textos que os apps montam em `RenderXxxUseCase`, para o iOS —
 * que recebe o alerta pronto — exibir o mesmo que o Android.
 */
const SERVICE_STEP_COPY: Record<ServiceStep, { title: string; body: string }> = {
    en_route: {
        title: "Profissional a caminho",
        body: "Seu profissional está indo até você"
    },
    started: { title: "Serviço iniciado", body: "Seu serviço foi iniciado" },
    finished: {
        title: "Serviço finalizado",
        body: "Seu serviço foi concluído com sucesso"
    }
}

function formatAppointmentDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, "0")
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const h = String(date.getHours()).padStart(2, "0")
    const min = String(date.getMinutes()).padStart(2, "0")
    return `${d}/${m} às ${h}h${min}`
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
        try {
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

            const copy = SERVICE_STEP_COPY[step]
            const etaSuffix = payload.eta ? ` — ETA: ${payload.eta}` : ""

            await this.fcmService.sendToTokens(
                tokens.map((t) => t.token),
                data,
                {
                    title: `${copy.title} • ${payload.modalityTitle}`,
                    body: `${copy.body}${etaSuffix}\n${payload.providerName}`
                }
            )
            this.logger.log(
                `service_step(${step}) sent to user ${clientUserId} — ${tokens.length} token(s)`
            )
        } catch (e) {
            this.logger.error(`notifyServiceStep failed: ${e?.message ?? e}`)
        }
    }

    async notifyCancellation(
        otherPartyOwnerType: "user" | "entrepreneur",
        otherPartyId: number,
        payload: CancellationPayload
    ): Promise<void> {
        try {
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

            const roleLabel =
                payload.cancellerRole === "user" ? "cliente" : "profissional"
            const dateLabel = ` de ${formatAppointmentDate(
                payload.appointmentDatetime
            )}`

            await this.fcmService.sendToTokens(
                tokens.map((t) => t.token),
                data,
                {
                    title: "Agendamento cancelado",
                    body: `${payload.cancellerName} (${roleLabel}) cancelou "${payload.serviceName}"${dateLabel}.`
                }
            )
            this.logger.log(
                `cancellation sent to ${otherPartyOwnerType} ${otherPartyId} — ${tokens.length} token(s)`
            )
        } catch (e) {
            this.logger.error(`notifyCancellation failed: ${e?.message ?? e}`)
        }
    }

    /// Morning reminder to the client: one push per appointment happening today.
    async notifyDailyAgendaClient(
        clientUserId: number,
        payload: DailyAgendaClientPayload
    ): Promise<void> {
        try {
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
                data,
                {
                    title: "Você tem um agendamento hoje",
                    body: `${payload.serviceName} com ${payload.providerName} às ${formatAppointmentDate(payload.appointmentDatetime).split(" às ")[1]}`
                }
            )
        } catch (e) {
            this.logger.error(`notifyDailyAgendaClient failed: ${e?.message ?? e}`)
        }
    }

    /// New booking made by a client: notify the entrepreneur of the establishment.
    async notifyNewBooking(
        entrepreneurId: number,
        payload: NewBookingPayload
    ): Promise<void> {
        try {
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
                data,
                {
                    title: "Novo agendamento",
                    body: `${payload.clientName} agendou "${payload.serviceName}" para ${formatAppointmentDate(payload.appointmentDatetime)}`
                }
            )
            this.logger.log(
                `new_booking sent to entrepreneur ${entrepreneurId} — ${tokens.length} token(s)`
            )
        } catch (e) {
            this.logger.error(`notifyNewBooking failed: ${e?.message ?? e}`)
        }
    }

    /// Morning summary to the entrepreneur: a single aggregated push with the
    /// number of appointments scheduled for today.
    async notifyDailyAgendaEntrepreneur(
        entrepreneurId: number,
        count: number
    ): Promise<void> {
        try {
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
                data,
                {
                    title: "Sua agenda de hoje",
                    body:
                        count === 1
                            ? "Você tem 1 agendamento hoje"
                            : `Você tem ${count} agendamentos hoje`
                }
            )
        } catch (e) {
            this.logger.error(`notifyDailyAgendaEntrepreneur failed: ${e?.message ?? e}`)
        }
    }
}
