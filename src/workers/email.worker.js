import { Worker } from "bullmq"
import { queueRedisConfig } from "../config/queueRedis.js"

console.log("📨 Email worker started")

new Worker(
  "email-events",
  async (job) => {
    if (job.name !== "user.signedup") return

    const { email } = job.data
    console.log(`📧 Sending welcome email to ${email}`)

    // simulate email provider latency
    await new Promise(res => setTimeout(res, 1000))

    console.log(`✅ Welcome email sent to ${email}`)
  },
  queueRedisConfig
)
