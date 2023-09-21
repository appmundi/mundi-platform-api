import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm"
import { Avaliation } from "src/controller/avaliation/entities/avaliation.entity"
import { Work } from "src/controller/work/entities/work.entity"
import { Image } from "src/controller/uploads/entities/upload.entity"
import { Schedule } from "src/controller/scheduling/entities/scheduling.entity"
import { Category } from "src/controller/category/entities/category.entity"

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

    @Column({ type: "json" })
    operation: JSON

    @Column()
    status?: boolean

    @ManyToMany(() => Category)
    @JoinTable()
    category: Category[]

    @OneToMany(() => Schedule, (schedulling) => schedulling.entrepreneur)
    schedulling: Schedule[]

    @OneToMany(() => Avaliation, (evaluation) => evaluation.entrepreneur)
    avaliation: Avaliation[]

    @OneToMany(() => Work, (work) => work.entrepreneur)
    work: Work[]

    @OneToMany(() => Image, (image) => image.entrepreneur)
    images: Image[]
}
