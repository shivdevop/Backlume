import { error } from "../utils/response.js"

export const ValidateSchema=(schema)=>{
    return (req,res,next)=>{
        try {
            schema.safeParse(req.body)
            next()
        } catch (err) {
            return error(res,err.message)
        }
    }
}

