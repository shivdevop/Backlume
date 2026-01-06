import rateLimit from "express-rate-limit"
import RedisStore from "rate-limit-redis"
import { redisClient } from "../config/redis.js"

export const createLoginRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many login attempts. Please try again later."
    },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args)
    })
  })

export const createRefreshRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many refresh attempts. Please try again later."
    },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args)
    })
  })
