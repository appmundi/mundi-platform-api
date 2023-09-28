import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    phone: string

    @Column()
    date: string

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.client)
    entrepreneur: Entrepreneur
}
