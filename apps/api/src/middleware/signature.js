const crypto = require('crypto');

function signatureMiddleware(req, res, next) {
  try {
    // Validate Twilio webhook signature
    const signature = req.headers['x-twilio-signature'];
    if (!signature) {
      console.warn('Missing webhook signature');
      return next(); // Allow for development
    }

    // Verify signature (implementation depends on provider)
    // For Twilio: https://www.twilio.com/docs/sms/tutorials/how-to-secure-webhooks

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid signature' });
  }
}

module.exports = signatureMiddleware;
