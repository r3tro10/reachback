const { db } = require('../index');

async function getKBEntriesByClient(clientId) {
  const result = await db.query(
    'SELECT * FROM kb_entries WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  );
  return result.rows;
}

async function getKBEntryById(id) {
  const result = await db.query('SELECT * FROM kb_entries WHERE id = $1', [id]);
  return result.rows[0];
}

async function createKBEntry(clientId, question, answer, category) {
  const result = await db.query(
    'INSERT INTO kb_entries (client_id, question, answer, category) VALUES ($1, $2, $3, $4) RETURNING *',
    [clientId, question, answer, category]
  );
  return result.rows[0];
}

async function updateKBEntry(id, question, answer, category) {
  const result = await db.query(
    'UPDATE kb_entries SET question = $1, answer = $2, category = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [question, answer, category, id]
  );
  return result.rows[0];
}

async function deleteKBEntry(id) {
  await db.query('DELETE FROM kb_entries WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  getKBEntriesByClient,
  getKBEntryById,
  createKBEntry,
  updateKBEntry,
  deleteKBEntry,
};
