import {Queue} from "bullmq"
import { queueRedisConfig } from "../../config/queueRedis.js"

let emailQueue=null

export const getEmailQueue=()=>{
    if(!emailQueue){
        emailQueue=new Queue("email-events",queueRedisConfig)
    }
    return emailQueue
}