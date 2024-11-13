const express = require('express');
const cookieParser = require('cookie-parser');
const database = require("./config/database");
const userRoutes = require("./routes/Auth");
const trackRoutes = require("./routes/Track");
const orderRoutes = require("./routes/Order");
const {sendInteractiveMessage} =require("./whatsapp/sendInteractiveMessage ")
require('dotenv').config();
const fileUpload = require("express-fileupload");
const cors = require("cors");
const axios = require('axios'); // Import axios for API requests

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

// WhatsApp message sending route using a template
app.post('/api/v1/send-whatsapp-template', async (req, res) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: process.env.TEST_PHONE_NUMBER,
                type: "template",
                template: {
                    name: "hello_world",
                    language: { code: "en_US" }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Template message sent successfully",
            data: response.data
        });
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: "Failed to send template message",
            error: error.message
        });
    }
});




app.post('/webhook', async (req, res) => {
    const { object, entry } = req.body;

    if (object === 'whatsapp_business_account') {
        entry.forEach(entry => {
            const changes = entry.changes;
            changes.forEach(async (change) => {
                const message = change.value.messages && change.value.messages[0];

                if (message && message.text && message.text.body.toLowerCase() === 'hi') {
                    await sendInteractiveMessage(message.from); // Send initial options
                } else if (message && message.button) {
                    const button = message.button.text;
                    const phoneNumber = message.from;

                    // Handle user button actions
                    if (button === "Log In") {
                        // Direct to email verification
                    } else if (button === "Sign Up") {
                        // Direct to signup flow
                    } else if (button === "Reset Password") {
                        // Handle password reset flow
                    }
                }
            });
        });
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
