import { Injectable, Inject } from "@nestjs/common"
import { Repository } from "typeorm"
import { Entrepreneur } from "../entrepreneur/entities/entrepreneur.entity"
import { Client } from "./entities/client.entity"

@Injectable()
export class ClientService {
    constructor(
        @Inject("CLIENT_REPOSITORY")
        private clientRepository: Repository<Client>
    ) {}

    async createClient(clientData: Partial<Client>): Promise<Client> {
        const client = this.clientRepository.create(clientData)
        return await this.clientRepository.save(client)
    }

    async findClientsByEntrepreneurId(
        entrepreneurId: number
    ): Promise<Client[]> {
        return this.clientRepository.find({
            where: { entrepreneur: { entrepreneurId: entrepreneurId } }
        })
    }
}
