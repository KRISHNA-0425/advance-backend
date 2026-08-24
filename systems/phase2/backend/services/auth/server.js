import express from 'express'
import dotenv from 'dotenv'
dotenv.config();

const app = express()

const port = process.env.PORT
app.use(express.json());


app.get("/", (req, res) => {
    res.send("hello from the auth service");
})


app.listen(port, () => {
    console.log(`server is runing at port: ${port}`)
})