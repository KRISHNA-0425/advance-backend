import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT;
const app = express();


app.get("/", (req, res) => {
    res.send("hello from docker phase 2");
})

app.listen(port, () => {
    console.log(`server is running at port: ${port}`);
})