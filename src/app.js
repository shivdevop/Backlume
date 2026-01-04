import express from "express"
import routes from "./routes/index.js"

const app=express()

//global middlewares
app.use(express.json())

app.get("/health",(req,res)=>{
    res.send({
        status:"ok",
        service:"backlume"
    })
})

app.use("/api",routes)

export default app


