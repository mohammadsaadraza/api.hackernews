import * as jwt from "jsonwebtoken"
import {config} from "../config";

export interface AuthTokenPayload {
    userId: number
}

export const decodeAuthHeader = (authHeader: string) : AuthTokenPayload | null => {
    const token = authHeader.replace("Bearer ", "")

    if(!token){
        throw new Error("No Token Found.")
    }

    try{
        return jwt.verify(token, config.JWT_SECRET) as AuthTokenPayload
    }catch (e){
        return null
    }
}