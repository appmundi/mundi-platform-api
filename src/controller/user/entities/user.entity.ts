import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    name: string

    @Column({ length: 200, unique: true })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ length: 25, unique: true })
    doc: string

    @Column()
    phone: string
}
