import app from "./app.js"
import {ENV} from "./config/env.js"
import {connectDB} from "./config/db.js"
import {connectRedis} from "./config/redis.js"

const startServer=async()=>{
    try {
      //start the db first
      await connectDB()
      await connectRedis()
      //then start the server
      app.listen(ENV.PORT,()=>{
        console.log(`Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`)
      })  
    } catch (err) {
        console.log("error starting server",err)
        process.exit(1)        
    }
}

startServer()

