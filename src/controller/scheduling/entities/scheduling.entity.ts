import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm"
import { User } from "src/controller/user/entities/user.entity"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(() => Entrepreneur, )
    @JoinColumn()
    entrepreneur: Entrepreneur

    @Column({ type: "timestamp" })
    scheduledDate: Date
}
