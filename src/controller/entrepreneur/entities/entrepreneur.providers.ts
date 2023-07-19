import { DataSource } from "typeorm"
import { Entrepreneur } from "./entrepreneur.entity"

export const EntrepreneurProviders = [
    {
        provide: "ENTREPRENEUR_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Entrepreneur),
        inject: ["DATA_SOURCE"]
    }
]
