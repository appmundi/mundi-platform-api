import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Entrepreneur {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 200 })
    name: string

    @Column({ length: 200, unique: true })
    email: string

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

    //  @Column()
    // fieldname: string

    // @Column()
    // originalname: string

    // @Column()
    // encoding: string

    // @Column()
    // mimetype: string

    // @Column()
    // destination: string

    // @Column()
    // filename: string

    // @Column()
    // path: string

    @Column()
    monday: boolean

    @Column()
    tuesday: boolean

    @Column()
    wednesday: boolean

    @Column()
    thursday: boolean

    @Column()
    friday: boolean

    @Column()
    saturday: boolean

    @Column()
    sunday: boolean

    @Column()
    status?: boolean
}
