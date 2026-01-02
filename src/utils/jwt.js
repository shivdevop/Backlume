import {ENV} from "../config/env.js"
import jwt from "jsonwebtoken"
import { error } from "./response.js"

export const generateToken=(payload)=>{
    try {
        const token=jwt.sign(payload,ENV.JWT_SECRET,{
            expiresIn:ENV.JWT_EXPIRES_IN
        })
        return token
    } catch (err) {
        throw new Error("Failed to generate token")
    }
}

export const verifyToken=(token)=>{
    const decoded=jwt.verify(token,ENV.JWT_SECRET)
    return decoded 
}