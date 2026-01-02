import {success,error} from "../utils/response.js"
import { verifyToken } from "../utils/jwt.js"


export const authenticateUser=async(req,res,next)=>{
    try {

        const authHeader=req.headers.authorization
        const [type,token]=authHeader.split(" ")

        if(type!="Bearer" || !token){
            return error(res,"Invalid auth headers",401)
        }
        const decoded=verifyToken(token)
        if(!decoded){
            return error(res,"Unauthorized",401)
        }
        console.log(decoded)
        req.user=decoded
        next()

    } catch (err) {
        return error(res,err.message,401)
    }

}