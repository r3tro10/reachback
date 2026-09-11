const { db } = require('../index');

async function getContactByPhone(phone, clientId) {
  const result = await db.query(
    'SELECT * FROM contacts WHERE phone = $1 AND client_id = $2',
    [phone, clientId]
  );
  return result.rows[0];
}

async function getContactById(id) {
  const result = await db.query('SELECT * FROM contacts WHERE id = $1', [id]);
  return result.rows[0];
}

async function getContactsByClient(clientId) {
  const result = await db.query('SELECT * FROM contacts WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
  return result.rows;
}

async function createContact(clientId, phone, name) {
  const result = await db.query(
    'INSERT INTO contacts (client_id, phone, name) VALUES ($1, $2, $3) RETURNING *',
    [clientId, phone, name]
  );
  return result.rows[0];
}

async function setOptOut(contactId, optedOut) {
  const result = await db.query(
    'UPDATE contacts SET opted_out = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [optedOut, contactId]
  );
  return result.rows[0];
}

module.exports = {
  getContactByPhone,
  getContactById,
  getContactsByClient,
  createContact,
  setOptOut,
};
