const axios = require('axios');

async function sendSMS(toPhone, message) {
  try {
    // Use Twilio API or equivalent
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        From: process.env.TWILIO_PHONE_NUMBER,
        To: toPhone,
        Body: message,
      },
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      }
    );

    return {
      success: true,
      message_id: response.data.sid,
    };
  } catch (error) {
    console.error('SMS send error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendSMS };
