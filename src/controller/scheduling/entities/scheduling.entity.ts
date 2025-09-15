import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm"
import { User } from "src/controller/user/entities/user.entity"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"
import { Modality } from "src/controller/modality/entities/modality.entity"

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
        type: 'enum',
        enum: AgendaStatus,
        default: AgendaStatus.INIT, 
      })
      status: AgendaStatus;

}
