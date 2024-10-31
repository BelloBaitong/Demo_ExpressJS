const axios = require('axios');

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN; // Add LINE Notify Token in .env

/* LINE Notification*/
async function sendLineNotification(message) {
    try {
        await axios.post('https://notify-api.line.me/api/notify', `message=${message}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
            },
        });
        console.log('Notification sent!');
    } catch (error) {
        console.error('Error sending notification:', error.response?.data || error.message);
    }
}
module.exports = {sendLineNotification}; 
