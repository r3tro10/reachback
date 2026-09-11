const { db } = require('../index');

async function getMessagesByConversation(conversationId, limit = 50) {
  const result = await db.query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2',
    [conversationId, limit]
  );
  return result.rows.reverse();
}

async function createMessage(conversationId, direction, content, messageType) {
  const result = await db.query(
    'INSERT INTO messages (conversation_id, direction, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
    [conversationId, direction, content, messageType]
  );
  return result.rows[0];
}

module.exports = {
  getMessagesByConversation,
  createMessage,
};
