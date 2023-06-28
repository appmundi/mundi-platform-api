import { IsString } from "class-validator"

export class CreateServiceDto {
    @IsString({ message: "O nome é Obrigatorio" })
    readonly name: string

    @IsString()
    readonly profession: string

    @IsString()
    readonly phone: string

    @IsString()
    readonly optionwork: string

    @IsString()
    readonly cep: string

    readonly status: boolean
}
