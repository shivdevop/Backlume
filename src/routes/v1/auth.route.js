import express from "express"
import { signup,login,getUser,refreshSession,logout } from "../../controllers/auth.controller.js"
import {signupSchema,loginSchema} from "../../modules/auth/auth.validator.js"
import { ValidateSchema } from "../../middlewares/inputValidator.js"
import { authenticateUser } from "../../middlewares/auth.middleware.js"
import { createLoginRateLimiter,createRefreshRateLimiter } from "../../middlewares/rateLimiter.js"


export const createAuthRoutesV1=()=>{
    const router=express.Router()


    router.post("/signup",ValidateSchema(signupSchema),signup)
    router.post("/login",createLoginRateLimiter(),ValidateSchema(loginSchema),login)
    router.get("/me",authenticateUser,getUser)
    router.post("/refresh",createRefreshRateLimiter(),refreshSession)
    router.post("/logout",authenticateUser,logout)

    return router

}

