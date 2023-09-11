import { IsString, IsEmail, IsNumber, IsBoolean } from "class-validator"

export class CreateEntrepreneurDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsString()
    readonly companyName: string

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

    @IsBoolean()
    readonly optionwork: boolean

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

    @IsString()
    readonly deslocation: string

    @IsString()
    readonly valueDeslocation: string

    @IsString()
    readonly operation: string

    @IsBoolean()
    readonly status?: boolean
}
