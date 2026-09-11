const { db } = require('../db');

const COOLDOWN_CACHE = new Map(); // In production, use Redis

async function isInCooldown(contactId) {
  try {
    const result = await db.query(
      'SELECT cooldown_until FROM contacts WHERE id = $1',
      [contactId]
    );

    if (!result.rows[0]) return false;

    const cooldownUntil = result.rows[0].cooldown_until;
    if (!cooldownUntil) return false;

    return new Date(cooldownUntil) > new Date();
  } catch (error) {
    console.error('Cooldown check error:', error);
    return false;
  }
}

async function setCooldown(contactId, durationSeconds) {
  try {
    const cooldownUntil = new Date(Date.now() + durationSeconds * 1000);

    await db.query(
      'UPDATE contacts SET cooldown_until = $1 WHERE id = $2',
      [cooldownUntil, contactId]
    );

    return { success: true };
  } catch (error) {
    console.error('Cooldown set error:', error);
    throw error;
  }
}

async function clearCooldown(contactId) {
  try {
    await db.query(
      'UPDATE contacts SET cooldown_until = NULL WHERE id = $1',
      [contactId]
    );

    return { success: true };
  } catch (error) {
    console.error('Cooldown clear error:', error);
    throw error;
  }
}

module.exports = { isInCooldown, setCooldown, clearCooldown };
