import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { Avaliation } from "src/controller/avaliation/entities/avaliation.entity"
import { Work } from "src/controller/work/entities/work.entity"

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

    @OneToMany(() => Avaliation, (evaluation) => evaluation.entrepreneur)
    avaliation: Avaliation[]

    @OneToMany(() => Work, (work) => work.entrepreneur)
    work: Work[]
}
