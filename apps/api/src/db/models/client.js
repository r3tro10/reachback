const { db } = require('../index');

async function getAllClients() {
  const result = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
  return result.rows;
}

async function getClientById(id) {
  const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
  return result.rows[0];
}

async function createClient(name, phone, email) {
  const result = await db.query(
    'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
    [name, phone, email]
  );
  return result.rows[0];
}

async function updateClient(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  values.push(id);

  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE clients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deleteClient(id) {
  await db.query('DELETE FROM clients WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
