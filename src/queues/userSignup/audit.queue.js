import {Queue} from "bullmq"
import {queueRedisConfig} from "../../config/queueRedis.js"

let auditQueue=null

export const getAuditQueue=()=>{
    if(!auditQueue){
        auditQueue=new Queue("audit-events",queueRedisConfig)
    }
    return auditQueue
}
