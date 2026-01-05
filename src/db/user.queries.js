import {pool} from "../config/db.js"
import { redisClient } from "../config/redis.js"

export const createUser=async(email,hashedPassword)=>{

    const {rows}=await pool.query(`
        INSERT INTO users (email,password_hash) VALUES ($1,$2) RETURNING id,email,is_verified,created_at`,[email,hashedPassword])

    return rows[0]
}

export const findUserByEmail=async(email)=>{
    const {rows}=await pool.query(`
        SELECT * from users where email=$1`,[email])

    return rows[0]    
}

export const updateRefreshToken=async(userId,refreshToken)=>{
    await pool.query(`UPDATE users SET refresh_token=$1,updated_at=now() where id=$2`,[refreshToken,userId])
}

export const findUserById=async(userId)=>{
    const cacheKey=`user:profile:v1:${userId}`

    //try redis for finding the user 
    const cachedUser=await redisClient.get(cacheKey)
    if(cachedUser){
        console.log("user found in redis")
        return JSON.parse(cachedUser)
    }

    //fetch from db
    const {rows}=await pool.query(`SELECT * FROM users where id=$1`,[userId])
    const user=rows[0]
    if(!user){
        return null
    }
    console.log("user not found in redis, fetching from db")
    //cache the user in redis for 10 minutes
    await redisClient.setEx(cacheKey,600,JSON.stringify(user))
    console.log("user cached in redis")
    return user
}