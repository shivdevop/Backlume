import pkg from "pg"
import { ENV } from "./env.js"

const {Pool}=pkg 

const pool=new Pool({
    connectionString:ENV.DATABASE_URL,
    ssl: ENV.NODE_ENV === "production" ?{rejectUnauthorized:false} :false,
})

export const connectDB=async()=>{
    try {
         const client=await pool.connect()        
         console.log("connected to database")
         client.release()
    } catch (err) {
        console.log("error connecting to database",err)
        process.exit(1)
    }
}

export {pool}
