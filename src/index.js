// require('dotenv').config()
import dotenv from 'dotenv'

import connectDB from "./db/index.js";

dotenv.config({
     path: '/custom/path/to/.env' 
    })


connectDB() 

.then(() =>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is runnin at ${process.env.PORT || 8000}`);
        
    })
})
.catch((err) =>{
    console.log("MONGO_db connection failed !!!", err);
    
})