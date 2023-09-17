import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToOne
} from "typeorm"
import { User } from "src/controller/user/entities/user.entity"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"
import { Modality } from "src/controller/modality/entities/modality.entity"

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(() => Entrepreneur, entreprepreneur => entreprepreneur.entrepreneurId)
    @JoinColumn()
    entrepreneur: Entrepreneur

    @Column({ type: "timestamp" })
    scheduledDate: Date

    @OneToOne(() => Modality)
    @JoinColumn()
    modality: Modality

}
