import { DataSource } from "typeorm"
import { createDatabaseOptions } from "./database.config"

export const databaseProviders = [
    {
        provide: "DATA_SOURCE",
        useFactory: async () => {
            const dataSource = new DataSource(createDatabaseOptions())

            return dataSource.initialize()
        }
    }
]
