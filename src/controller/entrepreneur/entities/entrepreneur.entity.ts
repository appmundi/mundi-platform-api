import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Entrepreneur {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 200 })
    name: string

    @Column({ length: 200, unique: true })
    email: string

    @Column({ length: 200 })
    password: string

    @Column({ length: 20, unique: true })
    doc: string

    @Column({ length: 20 })
    phone: string

    @Column({ length: 200 })
    category: string

    @Column({ length: 200 })
    profession: string

    @Column()
    optionwork: boolean

    @Column()
    localization: string

    @Column()
    deslocation: number

    @Column({ length: 25 })
    operation: string

    @Column()
    status?: boolean
}
