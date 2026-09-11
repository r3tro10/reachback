const { getContactByPhone } = require('../db/models/contact');
const { createMessage } = require('../db/models/message');
const { getConversationByContact, createConversation } = require('../db/models/conversation');
const aiService = require('../services/ai');
const smsService = require('../services/sms');
const notifyService = require('../services/notify');

async function handleMissedCall(req, res) {
  try {
    const { caller_phone, client_id } = req.body;

    const contact = await getContactByPhone(caller_phone, client_id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if contact is opted out
    if (contact.opted_out) {
      return res.status(200).json({ status: 'opted_out', message: 'Contact has opted out' });
    }

    // Get or create conversation
    let conversation = await getConversationByContact(contact.id);
    if (!conversation) {
      conversation = await createConversation(contact.id, client_id);
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(contact, conversation, 'missed_call');

    // Send SMS
    await smsService.sendSMS(caller_phone, aiResponse.message);

    // Log message
    await createMessage(conversation.id, 'inbound', caller_phone, 'missed_call');
    await createMessage(conversation.id, 'outbound', aiResponse.message, 'ai_response');

    // Notify roofer
    await notifyService.notifyRoofer(client_id, `Missed call from ${caller_phone}`);

    res.status(200).json({ success: true, message_id: 'generated' });
  } catch (error) {
    console.error('Missed call webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = handleMissedCall;
