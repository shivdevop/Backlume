import brcypt from "bcrypt";
import { findUserByEmail } from "../db/user.queries.js";
import { createUser } from "../db/user.queries.js";
import { publishUserSignupEvent } from "../producers/user.producer.js";

const SALT_ROUNDS=6


export const signupUser=async({email,password})=>{
    const existingUser=await findUserByEmail(email)
    if(existingUser){
        throw new Error("User already exists")
    }

    //if user doesnt exist, we create a new user .. first hash the password 
    const hashedPassword=await brcypt.hash(password,SALT_ROUNDS)
    const newUser=await createUser(email,hashedPassword)
    if(!newUser){
        throw new Error("Failed to create user")
    }

    //publish user signup event
    try {
        await publishUserSignupEvent({userId:newUser.id,email:newUser.email})
    } catch (err) {
        console.error("Error publishing user signup event",err)
        //continue with user creation even if event publishing fails
    }
    
    return newUser
}