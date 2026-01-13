import { ENV } from "./env.js";

// Parse Redis URL for BullMQ
const parseRedisUrl = (url) => {
  if (!url) {
    return { host: 'localhost', port: 6379 }
  }
  
  try {
    const urlObj = new URL(url)
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 6379
    }
  } catch (err) {
    console.error('Error parsing REDIS_URL:', err)
    return { host: 'localhost', port: 6379 }
  }
}

export const queueRedisConfig = {
  connection: parseRedisUrl(ENV.REDIS_URL)
}

// Debug logging
console.log('🔍 Queue Redis Config:', queueRedisConfig)
console.log('🔍 REDIS_URL from ENV:', ENV.REDIS_URL)