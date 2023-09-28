import { IsNotEmpty, IsString, IsDate, IsInt } from "class-validator"

export class CreateClientDto {
    @IsNotEmpty({ message: 'O campo "name" não pode estar vazio' })
    @IsString({ message: 'O campo "name" deve ser uma string' })
    name: string

    @IsNotEmpty({ message: 'O campo "phone" não pode estar vazio' })
    @IsString()
    phone: string

    @IsNotEmpty({ message: 'O campo "date" não pode estar vazio' })
    @IsDate({ message: 'O campo "date" deve ser uma data válida' })
    date: string

    @IsInt()
    entrepreneur: number
}
