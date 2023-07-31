import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Avaliation {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    iduser: number

    @Column()
    identrepreneur: number

    @Column({ length: 255 })
    description: string

    @Column()
    value: number
}
