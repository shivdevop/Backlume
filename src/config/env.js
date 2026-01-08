import dotenv from "dotenv"

dotenv.config()

export const ENV={
    PORT:process.env.PORT,
    NODE_ENV:process.env.NODE_ENV,
    DATABASE_URL:process.env.DATABASE_URL,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_EXPIRES_IN:process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN:process.env.JWT_REFRESH_EXPIRES_IN,
    REDIS_URL:process.env.REDIS_URL,
    SENDGRID_API_KEY:process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL:process.env.SENDGRID_FROM_EMAIL
}