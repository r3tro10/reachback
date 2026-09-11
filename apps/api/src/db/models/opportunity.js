const { db } = require('../index');

async function getOpportunitiesByClient(clientId) {
  const result = await db.query(
    'SELECT * FROM opportunities WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  );
  return result.rows;
}

async function getOpportunitiesById(id) {
  const result = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
  return result.rows[0];
}

async function createOpportunity(contactId, clientId, title, description, value) {
  const result = await db.query(
    'INSERT INTO opportunities (contact_id, client_id, title, description, value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [contactId, clientId, title, description, value]
  );
  return result.rows[0];
}

async function updateOpportunity(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  values.push(id);

  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE opportunities SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

module.exports = {
  getOpportunitiesByClient,
  getOpportunitiesById,
  createOpportunity,
  updateOpportunity,
};
