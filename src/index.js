// require('dotenv').config()
import dotenv from 'dotenv'
import { app } from './app.js';
import connectDB from "./db/index.js";

dotenv.config({
     path: '/custom/path/to/.env' 
    })


connectDB()
.then(() => {
    app.listen(process.env.PORT, () =>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
  });