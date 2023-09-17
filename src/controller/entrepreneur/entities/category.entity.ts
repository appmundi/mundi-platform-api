import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from "typeorm"
import { Entrepreneur } from "./entrepreneur.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    type: string

}
