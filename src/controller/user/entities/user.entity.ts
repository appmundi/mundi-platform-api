import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class user_register {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    name: string

    @Column({ length: 200 })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ length: 20 })
    doc: string

    @Column({ length: 20 })
    phone: string
}
