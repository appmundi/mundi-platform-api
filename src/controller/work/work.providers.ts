import { DataSource } from "typeorm"
import { Work } from "./entities/work.entity"

export const WorkProviders = [
    {
        provide: "WORK_REPOSITORY",
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Work),
        inject: ["DATA_SOURCE"]
    }
]
