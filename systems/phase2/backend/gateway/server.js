import express from 'express'
import dotenv from 'dotenv'
import proxy from 'express-http-proxy'
dotenv.config();

const app = express()

const port = process.env.PORT
app.use(express.json());


app.get("/", (req, res) => {
    res.send(`hello from the api gateway: ${process.env.GATEWAY_NAME} `);
})

// when it sees /auth in url it will route to port 3000 i.e. auth server
app.use("/auth", proxy("http://auth-service:3000"))
app.use("/order", proxy("http://order-service:3001"))
app.use("/product", proxy("http://product-service:3002"))

app.listen(port, () => {
    console.log(`server is runing at port: ${port}`)
})