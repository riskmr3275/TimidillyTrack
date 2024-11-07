const express = require('express');
const cookieParser = require('cookie-parser');
const database = require("./config/database");
const userRoutes=require("./routes/Auth")
const trackRoutes=require("./routes/Track")
require('dotenv').config();
const fileUpload = require("express-fileupload");
const cors = require("cors");
 

const app = express();
database.connect();
 
app.use(express.json());
app.use(cookieParser());
 
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}))

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/track', trackRoutes);
 

app.get("/", (req, res) => {
    return res.json({  
        success: true,
        message: "Your server is up and running.............."
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
