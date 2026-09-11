const { getContactByPhone, setOptOut } = require('../db/models/contact');
const { createMessage } = require('../db/models/message');
const { getConversationByContact, createConversation } = require('../db/models/conversation');
const aiService = require('../services/ai');
const smsService = require('../services/sms');
const cooldownService = require('../services/cooldown');

async function handleInboundSMS(req, res) {
  try {
    const { from: caller_phone, body: message_text, client_id } = req.body;

    const contact = await getContactByPhone(caller_phone, client_id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (contact.opted_out) {
      return res.status(200).json({ status: 'opted_out' });
    }

    // Check cooldown
    const inCooldown = await cooldownService.isInCooldown(contact.id);
    if (inCooldown) {
      return res.status(200).json({ status: 'cooldown', message: 'Contact in cooldown period' });
    }

    // Get conversation
    let conversation = await getConversationByContact(contact.id);
    if (!conversation) {
      conversation = await createConversation(contact.id, client_id);
    }

    // Log inbound message
    await createMessage(conversation.id, 'inbound', message_text, 'user_message');

    // Generate AI response
    const aiResponse = await aiService.generateResponse(contact, conversation, 'inbound_sms', message_text);

    // Handle opt-out
    if (aiResponse.action === 'opt_out') {
      await setOptOut(contact.id, true);
      return res.status(200).json({ status: 'opted_out' });
    }

    // Send response
    if (aiResponse.message) {
      await smsService.sendSMS(caller_phone, aiResponse.message);
      await createMessage(conversation.id, 'outbound', aiResponse.message, 'ai_response');
    }

    // Set cooldown if needed
    if (aiResponse.set_cooldown) {
      await cooldownService.setCooldown(contact.id, aiResponse.cooldown_duration);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = handleInboundSMS;
