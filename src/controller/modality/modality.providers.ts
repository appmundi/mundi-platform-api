import { DataSource } from "typeorm";
import { Modality } from "./entities/modality.entity";

export const ModalityProviders = [
    {
        provide: "MODALITY_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Modality),
        inject: ["DATA_SOURCE"]
    }
]