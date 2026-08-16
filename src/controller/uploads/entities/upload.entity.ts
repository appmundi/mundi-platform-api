import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Entrepreneur } from "../../entrepreneur/entities/entrepreneur.entity";
import { getLargeTextColumnType } from "../../../database/database.config";

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column({ type: getLargeTextColumnType(), nullable: true })
    base64: string;

    @ManyToOne(() => Entrepreneur, (entrepreneur) => entrepreneur.images)
    entrepreneur: Entrepreneur;
}
