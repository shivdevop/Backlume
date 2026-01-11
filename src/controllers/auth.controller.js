import { success,error } from "../utils/response.js"
import { createUser,findUserByEmail, updateRefreshToken, findUserById } from "../db/user.queries.js"
import brcypt from "bcrypt"
import { generateToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js"
import { redisClient } from "../config/redis.js"
import { publishUserSignupEvent } from "../producers/user.producer.js"
import { tryCatch } from "bullmq"
import { signupUser } from "../services/auth.service.js"



export const signup =async(req,res)=>{

    //we want to create new user and the input payload validation will already be done in the route

    try {
        const {email,password}=req.body
        const newUser=await signupUser({email,password})
        return success(res,newUser) 
    } catch (err) {

        return error(res,err.message,400)
    }

}

export const login=async(req,res)=>{

    //first find if the user exist 
   const {email,password}=req.body
   console.log(email,password)
    const existingUser=await findUserByEmail(email)
    if(!existingUser){
        return error(res,"User not found",404)
    }

    //verify password 
    const isPasswordValid=await brcypt.compare(password,existingUser.password_hash)
    if(!isPasswordValid){
        return error(res,"Invalid password",401)
    }

    //if password is valid, we will generate a jwt token and send it to user 
    const token=generateToken({
        id:existingUser.id,
        email:existingUser.email,
        role:existingUser.role
    })

    const refreshToken=signRefreshToken({
        id:existingUser.id
    })
    
    //we will store the refresh token in the database
    await updateRefreshToken(existingUser.id,refreshToken)

    //now we will get the user from the database again to get the updated user data
    const newUser=await findUserById(existingUser.id)

    if(!newUser){
        return error(res,"Failed to get user",500)
    }

    //password valid then lets return response, jwt token we will implement later 
    return success(res,{
        user:newUser,
        accessToken:token,
        refreshToken:refreshToken
    })

}

export const getUser=async(req,res)=>{
    const targetUserId=req.user.id

    const targetuser=await findUserById(targetUserId)

    if(!targetuser){
        return error(res,"User not found",404)
    }

    return success(res,targetuser)
}


export const refreshSession=async(req,res)=>{
    try {
        const {refreshToken}=req.body

        if(!refreshToken){
            return error(res,"Refresh token is required",400)
        }
    
        const decoded=verifyRefreshToken(refreshToken)
        const user=await findUserById(decoded.id)
    
        if(!user || user.refresh_token !==refreshToken){
            return error(res,"Invalid refresh token",401)
        }
    
        const newAccessToken=generateToken({
            id:user.id,
            email:user.email
        })

        return success(res,{
            user:{
                id:user.id,
                email:user.email
            },
            accessToken:newAccessToken
        })
        
    } catch (err) {
        return error(res,err.message,401)
    }
    
}

export const logout=async(req,res)=>{

    try {
        //user should be logged in and authenticated to log out 
        const userId=req.user.id
        await updateRefreshToken(userId,null)

        //clear the user from redis; invalidate cached profile 
        await redisClient.del(`user:profile:v1:${userId}`)
        console.log("user profile invalidated from redis")

        return success(res,{
            message:"Logged out successfully"
        })
    } catch (err) {
        return error(res,err.message,500)
    }

}

