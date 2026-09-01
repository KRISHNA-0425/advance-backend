import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

const uri = process.env.MONGO_URI;

const connectDb = async () => {
    try {
        await mongoose.connect(uri);
        console.log('db connected');
    } catch (error) {
        console.log(error)
    }
}

export default connectDb