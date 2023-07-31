import { DataSource } from "typeorm"
import { Avaliation } from "./entities/avaliation.entity"

export const AvaliationProviders = [
    {
        provide: "AVALIATION_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Avaliation),
        inject: ["DATA_SOURCE"]
    }
]
