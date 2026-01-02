import express from "express"
import { signup,login } from "../controllers/auth.controller.js"
import {signupSchema,loginSchema} from "../modules/auth/auth.validator.js"
import { ValidateSchema } from "../middlewares/inputValidator.js"


const router=express.Router()


router.post("/signup",ValidateSchema(signupSchema),signup)
router.post("/login",ValidateSchema(loginSchema),login)

export default router 