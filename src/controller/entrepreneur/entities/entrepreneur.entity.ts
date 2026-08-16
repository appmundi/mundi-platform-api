import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm"
import { Avaliation } from "../../avaliation/entities/avaliation.entity"
import { Work } from "../../work/entities/work.entity"
import { Image } from "../../uploads/entities/upload.entity"
import { Schedule } from "../../scheduling/entities/scheduling.entity"
import { Category } from "../../category/entities/category.entity"
import { Client } from "../../registerClient/entities/client.entity"
import { getLargeTextColumnType } from "../../../database/database.config"

@Entity()
export class Entrepreneur {
    @PrimaryGeneratedColumn()
    entrepreneurId: number

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
    companyName: string

    @Column()
    optionwork: boolean

    @Column()
    address: string

    @Column()
    addressNumber: string

    @Column()
    cep: string

    @Column()
    city: string

    @Column()
    state: string

    @Column()
    deslocation: string

    @Column()
    valueDeslocation: string

    @Column("double precision", { default: 0 })
    latitude: number

    @Column("double precision", { default: 0.0 })
    longitude: number

    @Column({ type: "json" })
    operation: JSON

    @Column()
    status?: boolean

    @Column({ nullable: true })
    resetPasswordCode: string

    @Column({ nullable: true })
    resetPasswordExpires: Date

    @Column({ type: "text", nullable: true })
    description: string

    @ManyToMany(() => Category)
    @JoinTable()
    category: Category[]

    @OneToMany(() => Schedule, (schedulling) => schedulling.entrepreneur)
    schedulling: Schedule[]

    @OneToMany(() => Client, (registerClient) => registerClient.entrepreneur)
    client: Client[]

    @OneToMany(() => Avaliation, (evaluation) => evaluation.entrepreneur)
    avaliation: Avaliation[]

    @OneToMany(() => Work, (work) => work.entrepreneur)
    work: Work[]

    @OneToMany(() => Image, (image) => image.entrepreneur)
    images: Image[]

    @Column({
        type: getLargeTextColumnType(),
        nullable: true,
        select: false
    })
    profileImage: string | null
}
