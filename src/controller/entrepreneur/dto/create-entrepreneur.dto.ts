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
    readonly localization: string

    @IsNumber()
    readonly deslocation: number

    @IsString()
    readonly opration: string

    @IsBoolean()
    readonly status?: boolean
}
