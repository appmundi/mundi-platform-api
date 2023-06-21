import { user_register } from "../entities/user.entity"

export class ReturnUserDto {
    id: number
    name: string
    email: string
    doc: string
    phone: string
    profession?: string
    constructor(userEntity: user_register) {
        this.id = userEntity.id
        this.name = userEntity.name
        this.email = userEntity.email
        this.doc = userEntity.doc
        this.phone = userEntity.phone
        this.profession = userEntity.profession
    }
}
