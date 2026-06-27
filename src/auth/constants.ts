import { loadEnvironmentVariables } from "src/config/environment"

loadEnvironmentVariables()

export const jwtConstants = {
    secret: String(process.env.ACCESS_TOKEN_SECRET)
}
