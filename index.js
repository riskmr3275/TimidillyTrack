const express = require('express');
const cookieParser = require('cookie-parser');
const database = require("./config/database");
const userRoutes = require("./routes/Auth");
const trackRoutes = require("./routes/Track");
const orderRoutes = require("./routes/Order");
require('dotenv').config();
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

// Connect to the database
database.connect();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials (cookies)
}));
app.use(fileUpload()); // Handles file uploads

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/track', trackRoutes);
app.use('/api/v1/order', orderRoutes);

// Default route
app.get("/", (req, res) => {
    return res.json({  
        success: true,
        message: "Your server is up and running.............."
    });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "An internal server error occurred",
        error: err.message
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
