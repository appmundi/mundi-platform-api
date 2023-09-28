import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    NotFoundException
} from "@nestjs/common"
import { ClientService } from "./client.service"
import { Client } from "./entities/client.entity"
import { CreateClientDto } from "./entities/client.dto"
import { EntrepreneurService } from "../entrepreneur/entrepreneur.service"

@Controller("registerClient")
export class ClientController {
    constructor(
        private readonly clientService: ClientService,
        private readonly entrepreneurService: EntrepreneurService
    ) {}

    @Post()
    async createClient(@Body() clientData: CreateClientDto): Promise<Client> {
        const entrepreneurId = clientData.entrepreneur

        const entrepreneur = await this.entrepreneurService.findOneById(
            entrepreneurId
        )

        if (!entrepreneur) {
            throw new NotFoundException(
                `Empresário com ID ${entrepreneurId} não encontrado.`
            )
        }

        return this.clientService.createClient({ ...clientData, entrepreneur })
    }

    @Get(":entrepreneurId")
    async findClientsByEntrepreneurId(
        @Param("entrepreneurId") entrepreneurId: number
    ): Promise<Client[]> {
        return this.clientService.findClientsByEntrepreneurId(entrepreneurId)
    }
}
