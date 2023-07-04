import { User } from "../entities/user.entity"

export class ReturnUserDto {
    id: number
    name: string
    email: string
    doc: string
    phone: string

    constructor(userEntity: User) {
        this.id = userEntity.id
        this.name = userEntity.name
        this.email = userEntity.email
        this.doc = userEntity.doc
        this.phone = userEntity.phone
    }
}
