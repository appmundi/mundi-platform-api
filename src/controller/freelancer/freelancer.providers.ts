import { DataSource } from "typeorm"
import { freelancer_register } from "./entities/freelancer.entity"

export const FreelancerProviders = [
    {
        provide: "FREELANCER_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(freelancer_register),
        inject: ["DATA_SOURCE"]
    }
]
