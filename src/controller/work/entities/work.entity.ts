import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm"
import { Entrepreneur } from "src/controller/entrepreneur/entities/entrepreneur.entity"
import { Modality } from "src/controller/modality/entities/modality.entity"

@Entity()
export class Work {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    service: string

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.work)
    entrepreneur: Entrepreneur

    @OneToMany(() => Modality, (Modality) => Modality.work)
    modalities: Modality[]

    @Column({default: true})
    active: boolean
}
