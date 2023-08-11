import { DataSource } from "typeorm"
import { Schedule } from "./entities/scheduling.entity"

export const ScheduleProviders = [
    {
        provide: "SCHEDULE_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Schedule),
        inject: ["DATA_SOURCE"]
    }
]
