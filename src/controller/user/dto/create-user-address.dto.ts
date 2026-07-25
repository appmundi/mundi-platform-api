import { IsOptional, IsString } from "class-validator"

export class CreateUserAddressDto {
    // Chips do app mandam "Casa" | "Trabalho" | texto livre. Sem @IsEnum de
    // propósito: o chip "Outro" abre campo livre, e travar o vocabulário aqui
    // quebraria isso sem ganho nenhum de integridade.
    @IsOptional()
    @IsString()
    readonly label?: string

    @IsString({ message: "O CEP é obrigatório" })
    readonly zipCode: string

    @IsString({ message: "A rua é obrigatória" })
    readonly street: string

    @IsString({ message: "O bairro é obrigatório" })
    readonly neighborhood: string

    @IsString({ message: "A cidade é obrigatória" })
    readonly city: string

    @IsString({ message: "A UF é obrigatória" })
    readonly state: string

    @IsString({ message: "O número é obrigatório" })
    readonly number: string

    @IsOptional()
    @IsString()
    readonly complement?: string
}
