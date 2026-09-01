import { Queue } from "bullmq";
import Redis from "ioredis";

// redis

const redis = new Redis("redis://localhost:6379", {
    maxRetriesPerRequest: null, // if the connection with redis is not made it will try again and again
})

// creating the queue  

const emailQueue = new Queue("emailQueue", { connection: redis })


export default emailQueue