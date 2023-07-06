import { IsString, IsEmail, IsNumber, IsBoolean } from "class-validator"

export class CreateEntrepreneurDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsString({ message: "O email é Obrigatorio" })
    @IsEmail()
    readonly email: string

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
    readonly fieldname: string

    @IsString()
    readonly originalname: string

    @IsString()
    readonly encoding: string

    @IsString()
    readonly mimetype: string

    @IsString()
    readonly destination: string

    @IsString()
    readonly filename: string

    @IsString()
    readonly path: string

    @IsBoolean()
    readonly monday: boolean

    @IsBoolean()
    readonly tuesday: boolean

    @IsBoolean()
    readonly wednesday: boolean

    @IsBoolean()
    readonly thursday: boolean

    @IsBoolean()
    readonly friday: boolean

    @IsBoolean()
    readonly saturday: boolean

    @IsBoolean()
    readonly sunday: boolean

    @IsBoolean()
    readonly status?: boolean
}
