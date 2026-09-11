const { db } = require('../index');

async function getConversationByContact(contactId) {
  const result = await db.query(
    'SELECT * FROM conversations WHERE contact_id = $1 ORDER BY created_at DESC LIMIT 1',
    [contactId]
  );
  return result.rows[0];
}

async function getConversationById(id) {
  const result = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
  return result.rows[0];
}

async function getConversationsByClient(clientId) {
  const result = await db.query(
    'SELECT * FROM conversations WHERE client_id = $1 ORDER BY last_message_at DESC',
    [clientId]
  );
  return result.rows;
}

async function createConversation(contactId, clientId) {
  const result = await db.query(
    'INSERT INTO conversations (contact_id, client_id) VALUES ($1, $2) RETURNING *',
    [contactId, clientId]
  );
  return result.rows[0];
}

async function updateLastMessage(conversationId) {
  const result = await db.query(
    'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [conversationId]
  );
  return result.rows[0];
}

module.exports = {
  getConversationByContact,
  getConversationById,
  getConversationsByClient,
  createConversation,
  updateLastMessage,
};
