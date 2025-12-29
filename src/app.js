import express from "express"

const app=express()

//global middlewares
app.use(express.json())

app.get("/health",(req,res)=>{
    res.send({
        status:"ok",
        service:"backlume"
    })
})

export default app