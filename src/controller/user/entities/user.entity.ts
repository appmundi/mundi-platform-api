import { Schedule } from "src/controller/scheduling/entities/scheduling.entity"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number

    @Column({ length: 100 })
    name: string

    @Column({ length: 200, unique: true })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ length: 25, unique: true })
    doc: string

    @Column()
    phone: string

    @OneToMany(() => Schedule, (schedulling) => schedulling.user)
    schedulling: Schedule[]
}
