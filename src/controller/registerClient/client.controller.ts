import {
    Body,
    Controller,
    Get,
    Delete,
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

    @Post(":id/scheduli")
    async createClient(
        @Param("id") entrepreneurId: number,
        @Body() clientData: { name: string; phone: string; date?: Date }
    ) {
        try {
            const scheduledDate = clientData.date || new Date()

            const clientService = await this.clientService.createClient(
                entrepreneurId,
                clientData.name,
                clientData.phone,
                scheduledDate
            )

            return { message: "Serviço criado com sucesso", clientService }
        } catch (error) {
            console.error("Erro ao criar cliente:", error)
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message)
            }
            throw new Error(
                `Falha ao enviar avaliação. Detalhes: ${error.message}`
            )
        }
    }
    @Get(":id/clients")
    async findClientsByEntrepreneurId(@Param("id") entrepreneurId: number) {
        try {
            const clients =
                await this.clientService.findClientsByEntrepreneurId(
                    entrepreneurId
                )

            return { clients }
        } catch (error) {
            throw new Error("Falha ao buscar clientes por empreendedor")
        }
    }

    @Delete(":id/delete")
    async deleteUser(@Param("id") clientId: number): Promise<void> {
        return this.clientService.deleteUser(clientId)
    }
}
