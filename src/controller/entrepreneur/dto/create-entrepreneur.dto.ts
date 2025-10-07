import { IsString, IsEmail, IsNumber, IsBoolean, IsJSON, } from "class-validator"
import { Image } from "src/controller/uploads/entities/upload.entity"
import {
    OneToMany,
} from "typeorm"

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

    @IsNumber()
    readonly latitude: number

    @IsNumber()
    readonly longitude: number

    @IsString()
    readonly deslocation: string

    @IsString()
    readonly valueDeslocation: string

    @IsJSON()
    readonly operation: JSON

    @IsBoolean()
    readonly status?: boolean

    @IsString()
    readonly category: string

    readonly image: Express.Multer.File;
}
