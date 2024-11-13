const express = require('express');
const { handleHiMessage, handleButtonClick, handleEmailVerification, handlePasswordVerification } = require('../middlewares/whatsappSender');

const router = express.Router();

router.post('/webhook', handleHiMessage);  // WhatsApp webhook for incoming messages
router.post('/button-click', handleButtonClick);  // Handle button click actions
router.post('/verify-email', handleEmailVerification);  // Handle email verification
router.post('/verify-password', handlePasswordVerification);  // Handle password verification

module.exports = router;
