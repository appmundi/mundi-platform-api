import { DataSource } from "typeorm"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { Category } from "../category/entities/category.entity"

export const EntrepreneurProviders = [
    {
        provide: "ENTREPRENEUR_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Entrepreneur),
        inject: ["DATA_SOURCE"],
    },
    {
            provide: "CATEGORY_REPOSITORY",
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Category),
            inject: ["DATA_SOURCE"]
        }
]
