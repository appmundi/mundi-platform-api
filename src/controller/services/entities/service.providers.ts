import { DataSource } from "typeorm"
import { Service } from "./service.entity"

export const ServiceProviders = [
    {
        provide: "SERVICE_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Service),
        inject: ["DATA_SOURCE"]
    }
]
