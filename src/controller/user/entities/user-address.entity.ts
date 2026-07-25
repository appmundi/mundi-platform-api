import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from "typeorm"
import { User } from "./user.entity"

@Entity()
export class UserAddress {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User

    @Column({ nullable: true })
    label: string // "Casa" | "Trabalho" | texto livre — vem dos chips do app

    @Column()
    zipCode: string

    @Column()
    street: string

    // Nullable na COLUNA (o seed do endereço de cadastro pode não conseguir
    // extrair bairro do dado legado) mas OBRIGATÓRIO no DTO de escrita — no
    // formulário novo, bairro é campo obrigatório.
    @Column({ nullable: true })
    neighborhood: string

    @Column()
    city: string

    @Column()
    state: string

    @Column()
    number: string

    @Column({ nullable: true })
    complement: string

    @CreateDateColumn()
    createdAt: Date
}
