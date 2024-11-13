const axios = require('axios');

async function sendInteractiveMessage(to, buttons) {
    try {
        const messageData = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: "Please select an option" },
                action: { buttons }
            }
        };   

        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            messageData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error("Failed to send interactive message.");
    }
}

module.exports = { sendInteractiveMessage };
