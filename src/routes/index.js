import {createAuthRoutesV1} from "./v1/auth.route.js"
import userRoutesV1 from "./v1/user.route.js"
import express from "express"

export const createRoutes=()=>{
    const router=express.Router()
    router.use("/v1/auth",createAuthRoutesV1())
    router.use("/v1/user",userRoutesV1)
    return router
}

