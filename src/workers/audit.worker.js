import { Worker } from "bullmq";
import { queueRedisConfig } from "../config/queueRedis.js";


new Worker(
  "audit-events",
  async (job) => {
    if (job.name !== "user.signedup") return

    console.log("📝 Audit log:", {
      event: job.name,
      payload: job.data
    })
  },
  queueRedisConfig
)
