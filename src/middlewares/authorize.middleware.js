import { error } from "../utils/response.js"

export const authorize=(allowedRoles=[])=>{
    return async(req,res,next)=>{
    try {
        const userRole=req.user.role 

        if(!userRole){
            return error(res,"User role not found",403)
        }

        if (!allowedRoles.includes(userRole)){
            return error(res,"Unauthorized",403)
        }
        next()
        
    } catch (err) {
        return error(res,err.message,403)
    }
    }

}