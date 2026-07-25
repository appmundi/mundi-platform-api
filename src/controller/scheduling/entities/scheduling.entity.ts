import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm"
import { User } from "../../user/entities/user.entity"
import { Entrepreneur } from "../../entrepreneur/entities/entrepreneur.entity"
import { Modality } from "../../modality/entities/modality.entity"

export enum AgendaStatus {
    INIT = 'INIT',
    STARTED = 'STARTED',
    CANCELED = 'CANCELED',
    FEEDBACK = 'FEEDBACK',
    FINISHED = 'FINISHED',
  }

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(
        () => Entrepreneur,
        (entreprepreneur) => entreprepreneur.entrepreneurId
    )
    @JoinColumn()
    entrepreneur: Entrepreneur

    @Column({ type: "timestamp" })
    scheduledDate: Date

    @ManyToOne(() => Modality, (modality) => modality.id)
    @JoinColumn()
    modality: Modality

    @Column({
        nullable: true,
    })
    description: string

    @Column({
        nullable: true
    })
    addressZipCode: string

    @Column({
        nullable: true
    })
    addressNumber: string

    @Column({
        nullable: true
    })
    addressComplement: string

    @Column({
        nullable: true
    })
    addressStreet: string

    @Column({
        nullable: true
    })
    addressNeighborhood: string

    @Column({
        nullable: true
    })
    addressCity: string

    @Column({
        nullable: true
    })
    addressState: string

    @Column({
        type: 'enum',
        enum: AgendaStatus,
        default: AgendaStatus.INIT, 
      })
      status: AgendaStatus;

}
