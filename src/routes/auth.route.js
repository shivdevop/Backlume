import express from "express"
import { signup,login,getUser } from "../controllers/auth.controller.js"
import {signupSchema,loginSchema} from "../modules/auth/auth.validator.js"
import { ValidateSchema } from "../middlewares/inputValidator.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"


const router=express.Router()


router.post("/signup",ValidateSchema(signupSchema),signup)
router.post("/login",ValidateSchema(loginSchema),login)
router.get("/me",authenticateUser,getUser)
export default router 