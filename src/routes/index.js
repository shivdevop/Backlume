import authRoutesV1 from "./v1/auth.route.js"
import userRoutesV1 from "./v1/user.route.js"
import express from "express"

const router=express.Router()

router.use("/v1/auth",authRoutesV1)
router.use("/v1/user",userRoutesV1)

export default router

