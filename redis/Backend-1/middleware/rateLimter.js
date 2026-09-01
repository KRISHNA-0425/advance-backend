import { redis } from "../server.js";

// const redis = new Redis(process.env.REDIS_URL);

const rateLimter = async (req, res, next) => {

    try {
        // find the ip of the user
        const ip = req.ip;
        const key = `rateLimit: ${ip}`;

        const request = await redis.incr(key);

        const maxReq = 5;

        if (request === 1) {
            await redis.expire(key, 60)
        }

        // defining time to live
        const ttl = await redis.ttl(key)

        if (request > maxReq) {
            return res.status(429).json({
                message: "too many request",
                retryIn: ttl
            })
        }

    } catch (error) {
        console.log(error)
    }
    finally {
        next()
    }
}

export default rateLimter
