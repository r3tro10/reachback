const express = require('express');
const { getConversationsByClient, getConversationById } = require('../db/models/conversation');
const { getMessagesByConversation } = require('../db/models/message');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { client_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id required' });
    }
    const conversations = await getConversationsByClient(client_id);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await getMessagesByConversation(conversation.id);
    res.json({ ...conversation, messages });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
