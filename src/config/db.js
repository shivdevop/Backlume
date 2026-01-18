import pkg from "pg"
import { ENV } from "./env.js"

const {Pool}=pkg 

const pool=new Pool({
    connectionString:ENV.DATABASE_URL,
    ssl: ENV.NODE_ENV === "production" ?{rejectUnauthorized:false} :false,
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const connectDB=async()=>{
    const maxRetries = 10
    const retryDelay = 2000 // 2 seconds
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const client=await pool.connect()        
            console.log("connected to database")
            client.release()
            return
        } catch (err) {
            if (i === maxRetries - 1) {
                console.log("error connecting to database",err)
                process.exit(1)
            }
            console.log(`Database connection attempt ${i + 1} failed, retrying in ${retryDelay}ms...`)
            await sleep(retryDelay)
        }
    }
}

export {pool}
