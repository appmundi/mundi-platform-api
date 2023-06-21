import { IsEmail, IsString } from "class-validator"

export class CreateUserDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsEmail()
    @IsString({ message: "O email é Obrigatorio" })
    readonly email: string

    @IsString({ message: "O senha é Obrigatorio" })
    readonly password: string

    @IsString()
    readonly doc: string

    @IsString()
    readonly phone: string

    readonly profession?: string
}
