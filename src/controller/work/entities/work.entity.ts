import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Work {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    service: string

    @Column()
    value: number

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.work)
    entrepreneur: Entrepreneur
}
