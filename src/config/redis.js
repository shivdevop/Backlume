import {createClient} from "redis"
import {ENV} from "./env.js"

export const redisClient=createClient({
url:ENV.REDIS_URL
})

redisClient.on("error",(err)=>{
    console.log("error connecting to redis",err)
})

export const connectRedis=async()=>{
    try {
        await redisClient.connect()      
        console.log("connected to redis")
    } catch (err) {
        console.log("error connecting to redis",err)
        process.exit(1)
    }
}