import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    type: string

    @ManyToMany(() => Entrepreneur, (entrepreneur) => entrepreneur.category)
    entrepreneur: Entrepreneur
}
