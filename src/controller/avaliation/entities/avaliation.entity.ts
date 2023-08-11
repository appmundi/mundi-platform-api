import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Avaliation {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    iduser: number

    @Column()
    identrepreneur: number

    @Column({ length: 255 })
    @ManyToOne(() => Entrepreneur)
    description: string

    @ManyToOne(() => Entrepreneur)
    value: number
}
