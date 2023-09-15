import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Avaliation {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    rating: number

    @Column()
    comment: string

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.avaliation)
    entrepreneur: Entrepreneur
}
