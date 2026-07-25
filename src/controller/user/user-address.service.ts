import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException
} from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { UserAddress } from "./entities/user-address.entity"
import { CreateUserAddressDto } from "./dto/create-user-address.dto"

@Injectable()
export class UserAddressService {
    constructor(
        @Inject("USER_ADDRESS_REPOSITORY")
        private userAddressRepository: Repository<UserAddress>,
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>
    ) {}

    // Colunas de User usadas pelo seed do endereço de cadastro — deliberadamente
    // sem password/email/doc/resetPasswordCode etc. Não há ClassSerializerInterceptor
    // nem @Exclude() neste projeto (verificado: main.ts e user.entity.ts), então
    // qualquer campo sensível carregado aqui poderia vazar se um dia essa entidade
    // for retornada direto por um controller. Mais seguro nunca carregar do que
    // confiar em lembrar de filtrar na saída.
    private static readonly SEED_PROFILE_COLUMNS = [
        "userId",
        "address",
        "addressNumber",
        "cep",
        "city",
        "state",
        "addressBookSeeded"
    ] as const

    async findByUserId(userId: number): Promise<UserAddress[]> {
        const user = await this.userRepository.findOne({
            where: { userId },
            select: [...UserAddressService.SEED_PROFILE_COLUMNS]
        })
        if (!user) {
            throw new NotFoundException("Usuário não encontrado")
        }

        if (!user.addressBookSeeded) {
            // Marca ANTES de tentar semear: mesmo que o dado legado esteja
            // incompleto e nada seja criado, nunca mais tenta de novo — evita
            // que apagar o endereço semeado o traga de volta no próximo GET.
            await this.userRepository.update(userId, { addressBookSeeded: true })

            const seed = this.buildSeedFromProfile(user)
            if (seed) {
                await this.userAddressRepository.save(seed)
            }
        }

        return this.userAddressRepository.find({
            where: { user: { userId } },
            order: { createdAt: "DESC" }
        })
    }

    async create(
        userId: number,
        dto: CreateUserAddressDto
    ): Promise<UserAddress> {
        // select: ['userId'] garante que nenhum campo sensível de User (senha,
        // e-mail etc.) entra em memória aqui — o objeto só existe pra dar ao
        // TypeORM a FK a persistir, e é isso que acaba indo (em memória) para
        // dentro do UserAddress salvo e retornado ao controller.
        const user = await this.userRepository.findOne({
            where: { userId },
            select: ["userId"]
        })
        if (!user) {
            throw new NotFoundException("Usuário não encontrado")
        }

        const address = this.userAddressRepository.create({
            user,
            label: dto.label,
            zipCode: dto.zipCode,
            street: dto.street,
            neighborhood: dto.neighborhood,
            city: dto.city,
            state: dto.state,
            number: dto.number,
            complement: dto.complement
        })

        return this.userAddressRepository.save(address)
    }

    async delete(id: number, userId: number): Promise<void> {
        const address = await this.userAddressRepository.findOne({
            where: { id },
            relations: { user: true }
        })

        if (!address) {
            throw new NotFoundException("Endereço não encontrado")
        }

        if (address.user.userId !== userId) {
            throw new ForbiddenException("Acesso negado a este endereço")
        }

        await this.userAddressRepository.remove(address)
    }

    /**
     * Converte o endereço embutido no cadastro (User.address/addressNumber/
     * cep/city/state) num UserAddress "Casa". O app grava `address` como
     * "Rua X, Bairro Y" (rua e bairro concatenados numa string só — ver
     * register_page.dart do app do cliente), então o split é no ÚLTIMO
     * vírgula (nomes de rua podem conter vírgula).
     *
     * Retorna null sempre que o dado legado não for confiável o bastante —
     * nunca grava um endereço incompleto/ruim. O caso mais comum de retorno
     * null é justamente o CEP genérico que motivou esta feature: o cadastro
     * salvou `address` vazio ou só ", Bairro" nesse caso.
     */
    private buildSeedFromProfile(user: User): UserAddress | null {
        if (
            !user.cep?.trim() ||
            !user.city?.trim() ||
            !user.state?.trim() ||
            !user.addressNumber?.trim() ||
            !user.address?.trim()
        ) {
            return null
        }

        const lastCommaIndex = user.address.lastIndexOf(",")
        const street = (
            lastCommaIndex >= 0
                ? user.address.slice(0, lastCommaIndex)
                : user.address
        ).trim()
        const neighborhood = (
            lastCommaIndex >= 0 ? user.address.slice(lastCommaIndex + 1) : ""
        ).trim()

        if (!street) {
            return null
        }

        return this.userAddressRepository.create({
            user,
            label: "Casa",
            zipCode: user.cep,
            street,
            neighborhood: neighborhood || null,
            city: user.city,
            state: user.state,
            number: user.addressNumber,
            complement: null
        })
    }
}
