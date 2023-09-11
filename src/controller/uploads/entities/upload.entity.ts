import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    filename: string

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.images)
    entrepreneur: Entrepreneur
}
