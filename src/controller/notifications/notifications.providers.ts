import { DataSource } from "typeorm"
import { DeviceToken } from "./entities/device_token.entity"

export const NotificationsProviders = [
    {
        provide: "DEVICE_TOKEN_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(DeviceToken),
        inject: ["DATA_SOURCE"]
    }
]
