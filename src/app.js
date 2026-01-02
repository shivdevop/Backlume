import express from "express"
import authRoutes from "./routes/auth.route.js"

const app=express()

//global middlewares
app.use(express.json())

app.get("/health",(req,res)=>{
    res.send({
        status:"ok",
        service:"backlume"
    })
})

app.use("/api/auth",authRoutes)

export default app