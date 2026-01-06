import express from "express"
import {createRoutes} from "./routes/index.js"


export const createApp=()=>{
    const app=express()

    //global middlewares
    app.use(express.json())
    
    app.get("/health",(req,res)=>{
        res.send({
            status:"ok",
            service:"backlume"
        })
    })
    
    app.use("/api",createRoutes())
    return app
}





