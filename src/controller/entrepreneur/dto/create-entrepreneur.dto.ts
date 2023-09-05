import { IsString, IsEmail, IsNumber, IsBoolean } from "class-validator"

export class CreateEntrepreneurDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsString({ message: "O email é Obrigatorio" })
    @IsEmail()
    readonly email: string

    @IsString()
    readonly password: string

    @IsString()
    readonly phone: string

    @IsString()
    readonly doc: string

    @IsString()
    readonly category: string

    @IsString()
    readonly profession: string

    @IsBoolean()
    readonly optionwork: boolean

    @IsString()
    readonly address: string

    @IsNumber()
    readonly addressNumber: number

    @IsNumber()
    readonly cep: number

    @IsString()
    readonly city: string

    @IsString()
    readonly state: string

    @IsNumber()
    readonly deslocation: number

    @IsString()
    readonly opration: string

    @IsBoolean()
    readonly status?: boolean
}
