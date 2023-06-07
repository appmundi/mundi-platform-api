import { DataSource } from "typeorm"
import { user_register } from "./entities/user.entity"

export const UserProviders = [
    {
        provide: "USER_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(user_register),
        inject: ["DATA_SOURCE"]
    }
]
