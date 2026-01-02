import {pool} from "../config/db.js"

export const createUser=async(email,hashedPassword)=>{

    const {rows}=await pool.query(`
        INSERT INTO users (email,password_hash) VALUES ($1,$2) RETURNING id,email,is_verified,created_at`,[email,hashedPassword])

    return rows[0]
}

export const findUserByEmail=async(email)=>{
    const {rows}=await pool.query(`
        SELECT * from users where email=$1`,[email])

    return rows[0]    
}