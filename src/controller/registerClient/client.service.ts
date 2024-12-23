import { Injectable, Inject, NotFoundException, HttpException, HttpStatus } from "@nestjs/common"
import { Repository } from "typeorm"
import { Client } from "./entities/client.entity"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"

@Injectable()
export class ClientService {
    constructor(
        @Inject("CLIENT_REPOSITORY")
        private clientRepository: Repository<Client>,
        private entrepreneurService: EntrepreneurService
    ) {}

    async createClient(
        freelancerId: number,
        name: string,
        phone: string,
        date: Date
    ): Promise<Client> {
        const entrepreneur = await this.entrepreneurService.getUserById(
            freelancerId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Entrepreneur ID ${freelancerId} não encontrado`
            )
        }

        const client = new Client()
        client.name = name
        client.phone = phone
        client.date = date
        client.entrepreneur = entrepreneur

        return this.clientRepository.save(client)
    }

    async findClientsByEntrepreneurId(
        entrepreneurId: number
    ): Promise<Client[]> {
        return this.clientRepository.find({
            where: { entrepreneur: { entrepreneurId: entrepreneurId } }
        })
    }

    async findClientsById(
        clientId: number
    ): Promise<Client[]> {
        return this.clientRepository.find({
            where: { id: clientId }
        })
    }

    async deleteUser(clientId: number): Promise<void> {
        const user = await this.findClientsById(clientId)
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Usuario nao encontrado"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        await this.clientRepository.remove(user)
    }
}
