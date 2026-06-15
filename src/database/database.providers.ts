import { DataSource } from "typeorm"
import * as fs from "fs"

export const databaseProviders = [
    {
        provide: "DATA_SOURCE",
        useFactory: async () => {
            const useSSL = process.env.DB_SSL === "true"
            const caPath = process.env.DB_SSL_CA ?? "./global-bundle.pem"

            const dataSource = new DataSource({
                type: "mysql",
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [__dirname + "/../**/*.entity{.ts,.js}"],
                synchronize: true,
                ...(useSSL && {
                    ssl: {
                        ca: fs.readFileSync(caPath),
                        rejectUnauthorized: true,
                    },
                }),
            })

            return dataSource.initialize()
        },
    },
]
