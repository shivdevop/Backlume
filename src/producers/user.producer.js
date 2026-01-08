//produce events 

import {getAuditQueue} from "../queues/userSignup/audit.queue.js"
import {getEmailQueue} from "../queues/userSignup/email.queue.js"
export const publishUserSignupEvent=async({userId,email})=>{
    const auditQueue=getAuditQueue()
    const emailQueue=getEmailQueue()
    await auditQueue.add("user.signedup",
        {
        userId,email,occuredAt:new Date().toISOString(),version:1
        },
        {
            attempts:3,
            backoff:{
                type:"exponential",
                delay:1000
            }
        }
    )
    await emailQueue.add("user.signedup",
        {
        userId,email,occuredAt:new Date().toISOString(),version:1
        },
        {
            attempts:3,
            backoff:{
                type:"exponential",
                delay:1000
            }
        }
    )
    console.log(`User signup event published for user ${userId} to audit and email queues`)
}