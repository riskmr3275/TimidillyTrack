const { sendInteractiveMessage } = require("../whatsapp/sendInteractiveMessage");
const axios = require('axios');
const { checkEmail, verifyPassword } = require('../controllers/authController');

// Function to handle the incoming 'hi' message
async function handleHiMessage(req, res) {
    const { from } = req.body;  // Incoming message sender's number
    try {
        // Send the buttons: Log In, Sign Up, Reset Password
        await sendInteractiveMessage(from, [
            { type: 'button', text: 'Log In', payload: 'login' },
            { type: 'button', text: 'Sign Up', payload: 'signup' },
            { type: 'button', text: 'Reset Password', payload: 'reset_password' }
        ]);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: "Failed to send buttons." });
    }
}

// Function to handle button responses (Log In, Sign Up, Reset Password)
async function handleButtonClick(req, res) {
    const { from, payload } = req.body; // The payload of the clicked button
    try {
        switch (payload) {
            case 'login':
                // Ask for email for log in
                await sendInteractiveMessage(from, [{ type: 'text', text: 'Please enter your email address.' }]);
                break;

            case 'signup':
                // Send sign-up instructions (you can customize this)
                await sendInteractiveMessage(from, [{ type: 'text', text: 'To sign up, visit our website and complete registration.' }]);
                break;

            case 'reset_password':
                // Send reset password instructions
                await sendInteractiveMessage(from, [{ type: 'text', text: 'Follow the instructions on our website to reset your password.' }]);
                break;

            default:
                res.status(400).json({ message: 'Unknown button action.' });
                break;
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: "Failed to process button click." });
    }
}

// Function to handle the email verification response
async function handleEmailVerification(req, res) {
    const { from, email } = req.body;
    try {
        const response = await axios.post('http://localhost:4000/api/v1/auth/check-email', { email });
        if (response.data.message === "Email found, proceed with password.") {
            // Ask for password after email verification
            await sendInteractiveMessage(from, [{ type: 'text', text: 'Please enter your password.' }]);
        } else {
            await sendInteractiveMessage(from, [{ type: 'text', text: 'Email not registered. Please sign up first.' }]);
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: "Error verifying email." });
    }
}

// Function to handle password verification
async function handlePasswordVerification(req, res) {
    const { from, email, password } = req.body;
    try {
        const response = await axios.post('http://localhost:4000/api/v1/auth/verify-password', { email, password });
        if (response.data.message === "Login successful") {
            // Fetch orders after successful login
            await sendInteractiveMessage(from, [{ type: 'text', text: 'Login successful. Fetching your orders...' }]);
        } else {
            await sendInteractiveMessage(from, [{ type: 'text', text: 'Incorrect password. Try again.' }]);
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: "Error verifying password." });
    }
}

module.exports = {
    handleHiMessage,
    handleButtonClick,
    handleEmailVerification,
    handlePasswordVerification,
};
