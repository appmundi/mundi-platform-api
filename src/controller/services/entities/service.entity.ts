import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 200 })
    name: string

    @Column({ length: 200 })
    profession: string

    @Column({ length: 200 })
    optionwork: string

    @Column()
    cep: string

    @Column()
    phone: string

    @Column()
    status: boolean
}
