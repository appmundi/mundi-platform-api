import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Entrepreneur } from "../../entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    phone: string

    @Column({ type: "timestamp" })
    date: Date

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.client)
    entrepreneur: Entrepreneur
}
