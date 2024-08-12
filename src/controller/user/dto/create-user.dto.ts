import { IsDate, IsEmail, IsString } from "class-validator"

export class CreateUserDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsEmail()
    @IsString({ message: "O email é Obrigatorio ou está duplicado" })
    readonly email: string

    @IsString({ message: "O senha é Obrigatorio" })
    readonly password: string

    @IsString()
    readonly doc: string

    @IsString()
    readonly address: string

    @IsString()
    readonly addressNumber: string

    @IsString()
    readonly cep: string

    @IsString()
    readonly city: string

    @IsString()
    readonly state: string

    /*@IsDate()
    readonly date: Date*/

    @IsString()
    readonly phone: string
}
