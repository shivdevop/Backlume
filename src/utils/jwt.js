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


export const signRefreshToken=(payload)=>{
    try {
        const token=jwt.sign(payload,ENV.JWT_REFRESH_SECRET,{
            expiresIn:ENV.JWT_REFRESH_EXPIRES_IN
        })
        return token
    } catch (err) {
        throw new Error("Failed to generate refresh token")
    }

}


export const verifyToken=(token)=>{
    const decoded=jwt.verify(token,ENV.JWT_SECRET)
    return decoded 
}

export const verifyRefreshToken=(token)=>{
    const decoded=jwt.verify(token,ENV.JWT_REFRESH_SECRET)
    console.log("decoded refresh token",decoded)
    return decoded 
}