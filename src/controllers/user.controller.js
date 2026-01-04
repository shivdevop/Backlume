import { success,error } from "../utils/response.js"


//example controller to check role based access 

export const getDashboard=async(req,res)=>{
    return success(res,{
        message:"Welcome to the dashboard",
        user:req.user
    })
}