import rateLimit from "express-rate-limit"

export const loginRateLimiter=rateLimit({
    windowMs:15*60*1000,
    max:5,
    message:"Too many login attempts, please try again later",
    standardHeaders:true,
    legacyHeaders:false
})

export const refreshRateLimiter=rateLimit({
    windowMs:15*60*1000,
    max:10,
    message:"Too many refresh attempts, please try again later",
    standardHeaders:true,
    legacyHeaders:false
})