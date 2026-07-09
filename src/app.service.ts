import { Inject, Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class AppService {
    constructor(
        @Inject("DATA_SOURCE") private readonly dataSource: DataSource
    ) {}

    async getHello(): Promise<any> {
        const appStatus = "running"
        const databaseStatus = this.dataSource.isInitialized
            ? "connected"
            : "disconnected"

        return {
            app: appStatus,
            database: databaseStatus
        }
    }
}
