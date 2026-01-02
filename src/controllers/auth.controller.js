import { success,error } from "../utils/response.js"
import { createUser,findUserByEmail } from "../db/user.queries.js"
import brcypt from "bcrypt"

const SALT_ROUNDS=6

export const signup =async(req,res)=>{

    //we want to create new user and the input payload validation will already be done in the route 

    // we will try to find if the user already exists
    const {email,password}=req.body
    const existingUser=findUserByEmail(email)
    if(existingUser){
        return error(res,"User already exists",400)
    }

    //if user doesnt exist, we create a new user .. first hash the password 
    const hashedPassword=await brcypt.hash(password,SALT_ROUNDS)
    const newUser=createUser(email,hashedPassword)
    if(!newUser){
        return error(res,"Failed to create user",500)
    }

    return success(res,newUser)

}

export const login=async(req,res)=>{

    //first find if the user exist 
   const {email,password}=req.body
    const existingUser=findUserByEmail(email)
    if(!existingUser){
        return error(res,"User not found",404)
    }

    //verify password 
    const isPasswordValid=await brcypt.compare(password,existingUser.password_hash)
    if(!isPasswordValid){
        return error(res,"Invalid password",401)
    }

    //password valid then lets return response, jwt token we will implement later 
    return success(res,existingUser)

}

