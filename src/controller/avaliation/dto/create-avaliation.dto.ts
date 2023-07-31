import { IsString, IsNumber } from "class-validator"

export class CreateAvaliationDto {
    @IsNumber()
    readonly iduser: number

    @IsNumber()
    readonly identrepreneur: number

    @IsString()
    readonly description: string

    @IsNumber()
    readonly value: number
}
