import * as dotenv from "dotenv"
import * as path from "path"

const HOMOLOGATION_ENVIRONMENTS = ["homol", "homologation", "hml"]
let loaded = false

export const getAppEnvironment = (): string =>
    (process.env.APP_ENV || process.env.NODE_ENV || "").toLowerCase()

export const isHomologationEnvironment = (): boolean =>
    HOMOLOGATION_ENVIRONMENTS.includes(getAppEnvironment())

export const loadEnvironmentVariables = (): void => {
    if (loaded) {
        return
    }

    dotenv.config()

    if (!isHomologationEnvironment()) {
        loaded = true
        return
    }

    dotenv.config({
        path: path.resolve(process.cwd(), "hom.env"),
        override: true
    })

    loaded = true
}
