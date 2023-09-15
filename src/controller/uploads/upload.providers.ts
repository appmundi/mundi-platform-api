import { DataSource } from "typeorm"
import { Image } from "./entities/upload.entity"

export const ImageProviders = [
    {
        provide: "IMAGE_REPOSITORY",
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Image),
        inject: ["DATA_SOURCE"]
    }
]
