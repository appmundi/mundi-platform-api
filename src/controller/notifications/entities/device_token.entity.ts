import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class DeviceToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 512, unique: true })
    token: string

    @Column({ type: "enum", enum: ["android", "ios"] })
    platform: "android" | "ios"

    @Column({ type: "enum", enum: ["user", "entrepreneur"] })
    ownerType: "user" | "entrepreneur"

    @Column()
    ownerId: number

    @Column({ length: 32, nullable: true })
    appVersion: string

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt: Date
}
