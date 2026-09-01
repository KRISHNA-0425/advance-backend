import express from 'express';
import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import fs from 'fs'
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const llm = new ChatGroq({
    model: "openai/gpt-oss-120b"
})

// pdf parsing

const upload = async () => {
    const pdfPath = "./green_meadow_market_catalog.pdf";
    const buffer = fs.readFileSync(pdfPath);

    const pdfRes = new PDFParse({
        url: pdfPath,
        data: buffer,
        rangeChunkSize: 10
    })

    // this will convert the binary data into text format
    const text = await pdfRes.getText();

    // console.log(text.text)

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100, //just to make sure that information is not adrupt
    })
    splitter.createDocuments([text]);
}

upload()

app.get("/", (_, res) => {
    res.send("hello")
});


app.post('/rag', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await llm.invoke(prompt);
        res.status(200).json({ "ai:": response.content });
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log(`sever is running at port: ${port}`);
});