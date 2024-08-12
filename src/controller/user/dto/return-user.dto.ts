import { User } from "../entities/user.entity"

export class ReturnUserDto {
    userId: number
    name: string
    email: string
    doc: string
    phone: string
    address: string
    addressNumber: string
    cep: string
    city: string
    state: string

    constructor(userEntity: User) {
        this.userId = userEntity.userId
        this.name = userEntity.name
        this.email = userEntity.email
        this.doc = userEntity.doc
        this.phone = userEntity.phone
        this.address = userEntity.address
        this.addressNumber = userEntity.addressNumber
        this.cep = userEntity.cep
        this.city = userEntity.city
        this.state = userEntity.state
    }
}
