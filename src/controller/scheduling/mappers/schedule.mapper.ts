import { Schedule, AgendaStatus } from '../entities/scheduling.entity'
import { User } from '../../user/entities/user.entity'
import { Entrepreneur } from '../../entrepreneur/entities/entrepreneur.entity'
import { Modality } from '../../modality/entities/modality.entity'

export interface ScheduleDto {
    id: number
    scheduledDate: Date
    status: AgendaStatus
    statusLabel: string
    description: string
    addressZipCode?: string
    addressNumber?: string
    addressComplement?: string
    user: Partial<User>
    entrepreneur: Partial<Entrepreneur>
    modality: Partial<Modality>
}

const STATUS_LABELS: Record<AgendaStatus, string> = {
    [AgendaStatus.INIT]: 'Agendado',
    [AgendaStatus.STARTED]: 'Em andamento',
    [AgendaStatus.CANCELED]: 'Cancelado',
    [AgendaStatus.FEEDBACK]: 'Aguardando avaliação',
    [AgendaStatus.FINISHED]: 'Finalizado',
}

export class ScheduleMapper {
    static toDto(s: Schedule): ScheduleDto {
        const user = new User()
        user.userId = s.user.userId
        user.name = s.user.name
        user.address = s.user.address
        user.addressNumber = s.user.addressNumber
        user.cep = s.user.cep
        user.city = s.user.city
        user.state = s.user.state
        user.phone = s.user.phone

        const entrepreneur = new Entrepreneur()
        entrepreneur.entrepreneurId = s.entrepreneur.entrepreneurId
        entrepreneur.name = s.entrepreneur.name
        entrepreneur.companyName = s.entrepreneur.companyName
        entrepreneur.address = s.entrepreneur.address
        entrepreneur.addressNumber = s.entrepreneur.addressNumber
        entrepreneur.cep = s.entrepreneur.cep
        entrepreneur.city = s.entrepreneur.city
        entrepreneur.state = s.entrepreneur.state
        entrepreneur.phone = s.entrepreneur.phone
        entrepreneur.optionwork = s.entrepreneur.optionwork
        entrepreneur.latitude = s.entrepreneur.latitude
        entrepreneur.longitude = s.entrepreneur.longitude

        const modality = new Modality()
        modality.id = s.modality.id
        modality.title = s.modality.title
        modality.duration = s.modality.duration
        modality.price = s.modality.price

        return {
            id: s.id,
            scheduledDate: s.scheduledDate,
            status: s.status,
            statusLabel: STATUS_LABELS[s.status] ?? s.status,
            description: s.description,
            addressZipCode: s.addressZipCode,
            addressNumber: s.addressNumber,
            addressComplement: s.addressComplement,
            user,
            entrepreneur,
            modality,
        }
    }
}
