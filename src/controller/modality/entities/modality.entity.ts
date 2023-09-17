import { Work } from "src/controller/work/entities/work.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Modality {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    duration: number

    @Column()
    price: number

    @ManyToOne(() => Work, (work) => work.id)
    work: Work
}
