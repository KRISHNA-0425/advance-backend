import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import User from './model/user.model.js';
import Redis from 'ioredis';
import rateLimter from './middleware/rateLimter.js';
import sendEmail from './config/sendEmail.js';
import emailQueue from './queue.js';
dotenv.config();

const port = process.env.PORT

const app = express()

// using redis

// step-1: Create the redis instance
export const redis = new Redis(process.env.REDIS_URL);


app.use(express.json());

app.get("/", (_, res) => {
    res.send("hello");
})

// without redis fetching time is 67ms
// with redis fetching time is 8ms 

app.post("/create", async (req, res) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
    })
    await sendEmail();

    return res.json(user);
})

// we will delete the old data form redis and again store the latest data

app.post("/redis-create", async (req, res) => {

    const { name, email, password } = req.body;

    await redis.del("user:all"); // deleting the previous data

    const user = await User.create({
        name,
        email,
        password
    })

    return res.json(user);
})


app.get("/get", rateLimter, async (req, res) => {
    const user = await User.find({})
    return res.json(user)
})

app.get("/redis-get", async (req, res) => {

    // first check redis

    const data = await redis.get("user:all") // getting data of all users

    if (data) {
        // changing back to the json format
        const user = JSON.parse(data)
        return res.json(user);
    }

    const user = await User.find({})

    // user data in redis
    // data is stored in the form of string

    await redis.set("user:all", JSON.stringify(user));

    return res.json(user)
})

app.post("/redis-otp", async (req, res) => {
    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`opt: ${email}`, otp, "EX", 300); // "EX",300 means otp expires in 300 seconds i.e. 5 mins

    return res.json(otp)
})


app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body

    const cachedOtp = await redis.get(`opt: ${email}`);
    if (!cachedOtp) {
        return res.json({ message: 'otp not found' })
    }

    if (cachedOtp === otp) {
        return res.json({ message: "correct otp" })
    }

    return res.json({ message: "incorrect otp" })
})

app.post("/queue-create", async (req, res) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
    })

    // adding the job in the queue and also sending any required data
    await emailQueue.add("sendEmail", { email })

    return res.json(user);
})


app.listen(port, () => {
    connectDb()
    console.log(`server is running at port: ${port}`)
})