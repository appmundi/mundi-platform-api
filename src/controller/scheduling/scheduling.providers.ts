import { DataSource } from "typeorm"
import { Schedule } from "./entities/scheduling.entity"
import { Avaliation } from "../avaliation/entities/avaliation.entity"

export const ScheduleProviders = [
    {
        provide: "SCHEDULE_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Schedule),
        inject: ["DATA_SOURCE"]
    },
    {
            provide: "AVALIATION_REPOSITORY",
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Avaliation),
            inject: ["DATA_SOURCE"]
        }
]
