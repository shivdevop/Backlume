import express from "express"
import { getDashboard } from "../controllers/user.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"

const router=express.Router()

router.get("/dashboard",authenticateUser,authorize(["admin"]),getDashboard)


export default router 