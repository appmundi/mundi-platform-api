import * as fs from "fs"
import { DataSourceOptions } from "typeorm"
import {
    isHomologationEnvironment,
    loadEnvironmentVariables
} from "../config/environment"

loadEnvironmentVariables()

export type SupportedDatabaseType = "mysql" | "postgres"

const getOptionalBoolean = (value: string | undefined): boolean | undefined => {
    if (value === undefined) {
        return undefined
    }

    return ["true", "1", "yes"].includes(value.toLowerCase())
}

const getNumberEnv = (value: string | undefined, fallback: number): number => {
    const parsedValue = Number(value)

    return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const shouldSynchronize = (): boolean => {
    const synchronize = getOptionalBoolean(process.env.DB_SYNCHRONIZE)

    return synchronize ?? process.env.NODE_ENV !== "production"
}

const getDatabaseUrl = (): string | undefined =>
    process.env.DATABASE_URL || process.env.DB_URL

export const getDatabaseType = (): SupportedDatabaseType => {
    if (!isHomologationEnvironment()) {
        return "mysql"
    }

    return "postgres"
}

const getMysqlSslConfig = () => {
    const useSSL = getOptionalBoolean(process.env.DB_SSL) ?? false

    if (!useSSL) {
        return undefined
    }

    const caPath = process.env.DB_SSL_CA ?? "./global-bundle.pem"

    return {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    }
}

const getPostgresSslConfig = () => {
    const useSSL = getOptionalBoolean(process.env.DB_SSL) ?? true

    if (!useSSL) {
        return undefined
    }

    return {
        rejectUnauthorized:
            getOptionalBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED) ?? false
    }
}

export const createDatabaseOptions = (): DataSourceOptions => {
    const databaseType = getDatabaseType()
    const baseOptions = {
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        synchronize: shouldSynchronize()
    }
    const connectionOptions = {
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }

    if (databaseType === "postgres") {
        const databaseUrl = getDatabaseUrl()
        const ssl = getPostgresSslConfig()

        if (databaseUrl) {
            return {
                type: "postgres",
                ...baseOptions,
                url: databaseUrl,
                ...(ssl && { ssl })
            }
        }

        return {
            type: "postgres",
            ...baseOptions,
            ...connectionOptions,
            port: getNumberEnv(process.env.DB_PORT, 5432),
            ...(ssl && { ssl })
        }
    }

    const ssl = getMysqlSslConfig()

    return {
        type: "mysql",
        ...baseOptions,
        ...connectionOptions,
        port: getNumberEnv(process.env.DB_PORT, 3306),
        ...(ssl && { ssl })
    }
}
