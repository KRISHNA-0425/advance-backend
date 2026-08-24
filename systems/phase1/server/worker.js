import { Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./config/sendEmail.js";

const redis = new Redis("redis://localhost:6379", {
    maxRetriesPerRequest: null
});

// name of the queue, job, connection string for redis
const worker = new Worker("emailQueue", async (job) => {
    const email = job.data.email
    await sendEmail(email);
    console.log('job compeleted')
}, { connection: redis })



export default worker