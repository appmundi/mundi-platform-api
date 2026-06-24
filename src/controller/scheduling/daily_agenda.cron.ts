import { Injectable, Inject, Logger, Optional } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Between, In, Repository } from "typeorm"
import { DateTime } from "luxon"
import { AgendaStatus, Schedule } from "./entities/scheduling.entity"
import { NotificationsService } from "../notifications/notifications.service"

const TIMEZONE = "America/Sao_Paulo"

@Injectable()
export class DailyAgendaCron {
    private readonly logger = new Logger(DailyAgendaCron.name)

    constructor(
        @Inject("SCHEDULE_REPOSITORY")
        private readonly scheduleRepository: Repository<Schedule>,
        @Optional()
        private readonly notificationsService?: NotificationsService
    ) {}

    /// Runs every day at 06:00 (America/Sao_Paulo) and notifies clients and
    /// entrepreneurs about the appointments happening today.
    @Cron("0 6 * * *", { timeZone: TIMEZONE })
    async sendDailyAgenda(): Promise<void> {
        if (!this.notificationsService) {
            this.logger.warn("NotificationsService unavailable — skipping daily agenda")
            return
        }

        const now = DateTime.now().setZone(TIMEZONE)
        const startOfDay = now.startOf("day").toJSDate()
        const endOfDay = now.endOf("day").toJSDate()

        const schedules = await this.scheduleRepository.find({
            where: {
                scheduledDate: Between(startOfDay, endOfDay),
                status: In([AgendaStatus.INIT, AgendaStatus.STARTED])
            },
            relations: { user: true, entrepreneur: true, modality: true }
        })

        if (!schedules.length) {
            this.logger.log("Daily agenda: no appointments today")
            return
        }

        // Per-entrepreneur appointment count for the aggregated summary.
        const countByEntrepreneur = new Map<number, number>()

        for (const schedule of schedules) {
            const clientUserId = schedule.user?.userId
            if (clientUserId) {
                await this.notificationsService.notifyDailyAgendaClient(
                    clientUserId,
                    {
                        scheduleId: schedule.id,
                        serviceName: schedule.modality?.title ?? "Serviço",
                        providerName: schedule.entrepreneur?.name ?? "Profissional",
                        appointmentDatetime: schedule.scheduledDate
                    }
                )
            }

            const entrepreneurId = schedule.entrepreneur?.entrepreneurId
            if (entrepreneurId) {
                countByEntrepreneur.set(
                    entrepreneurId,
                    (countByEntrepreneur.get(entrepreneurId) ?? 0) + 1
                )
            }
        }

        for (const [entrepreneurId, count] of countByEntrepreneur) {
            await this.notificationsService.notifyDailyAgendaEntrepreneur(
                entrepreneurId,
                count
            )
        }

        this.logger.log(
            `Daily agenda sent: ${schedules.length} appointment(s), ${countByEntrepreneur.size} entrepreneur(s)`
        )
    }
}
