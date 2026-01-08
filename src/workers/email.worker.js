import { Worker } from "bullmq"
import { queueRedisConfig } from "../config/queueRedis.js"
import { sendWelcomeEmail } from "../services/email.service.js"

console.log("📨 Email worker started")

new Worker(
  "email-events",
  async (job) => {
    if (job.name !== "user.signedup") return

    const { email } = job.data
    console.log(`📧 Sending welcome email to ${email}`)

    // // simulate email provider latency  
    // await new Promise(res => setTimeout(res, 1000))

    try {
        await sendWelcomeEmail({email})
    } catch (err) {
        console.error("Error sending welcome email",err)
        throw err
    }

    console.log(`✅ Welcome email sent to ${email}`)
  },
  queueRedisConfig
)
