import { DataSource } from "typeorm"
import { UserAddress } from "./entities/user-address.entity"

export const UserAddressProviders = [
    {
        provide: "USER_ADDRESS_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(UserAddress),
        inject: ["DATA_SOURCE"]
    }
]
