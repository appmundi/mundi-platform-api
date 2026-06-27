import { Injectable } from "@nestjs/common"
import {
    createConnection,
    type Connection,
    type ConnectionOptions
} from "mysql2/promise"

@Injectable()
export class AppService {
    async getHello(): Promise<any> {
        const appStatus = "running"
        let databaseStatus = "disconnected"

        const dbConfig: ConnectionOptions = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        }

        let connection: Connection | undefined

        try {
            connection = await createConnection(dbConfig)
            await connection.ping()
            databaseStatus = "connected"
        } catch (error) {
            console.error("Error connecting to the database:", error)
        } finally {
            await connection?.end()
        }

        return {
            app: appStatus,
            database: databaseStatus
        }
    }
}
