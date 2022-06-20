import * as dot from "dotenv"

dot.config()

export interface ENV_VARS {
    JWT_SECRET: string
}

export const config: ENV_VARS = {
    JWT_SECRET: process.env.JWT_SECRET || ""
}