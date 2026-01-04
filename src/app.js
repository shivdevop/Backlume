import express from "express"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"

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
app.use("/api/user",userRoutes)

export default app


