import { Schedule } from "src/controller/scheduling/entities/scheduling.entity"
import { Work } from "src/controller/work/entities/work.entity"
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity()
export class Modality {
    @PrimaryGeneratedColumn()
    modalityId: number

    @Column()
    title: string

    @Column()
    duration: number

    @Column()
    price: number

    @OneToMany(() => Schedule, (schedulling) => schedulling.modality)
    schedulling: Schedule[]

    @ManyToOne(() => Work, (work) => work.id)
    work: Work
}
