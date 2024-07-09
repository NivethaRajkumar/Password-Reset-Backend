import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Database/config.js';
import userrouter from './Routers/userRouter.js';

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors({
    origin:"*",
    credentials:true
}))

//db connection
connectDB();

app.use('/api/user',userrouter);
// routes
app.get('/',(req,res)=>{
  res.status(200).send("Welcome to our api");
})


//listen
app.listen(process.env.PORT,()=>{
    console.log("App is started at the end port");
})