import { Schedule } from "../../scheduling/entities/scheduling.entity"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { getLargeTextColumnType } from "../../../database/database.config"

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

    @Column({ nullable: true })
    resetPasswordCode: string;

    @Column({ nullable: true })
    resetPasswordExpires: Date;

    /*@Column()
    date: Date*/

    @OneToMany(() => Schedule, (schedulling) => schedulling.user)
    schedulling: Schedule[]

    // `select: false` para o base64 não vir em toda consulta de usuário. Quem
    // precisa dele pede explicitamente (ver ImagesService.getUserProfileImage).
    @Column({
        type: getLargeTextColumnType(),
        nullable: true,
        default: null,
        select: false
    })
    imageUrl: string | null

    // Guarda o seed do endereço de cadastro em UserAddress (ver
    // UserAddressService.findByUserId): evita semear de novo depois que o
    // usuário apagar o endereço "Casa" gerado automaticamente.
    @Column({ default: false })
    addressBookSeeded: boolean
}
