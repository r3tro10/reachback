const express = require('express');
const { getContactsByClient, createContact, setOptOut } = require('../db/models/contact');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { client_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id required' });
    }
    const contacts = await getContactsByClient(client_id);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { client_id, phone, name } = req.body;
    const contact = await createContact(client_id, phone, name);
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/opt-out', async (req, res, next) => {
  try {
    const contact = await setOptOut(req.params.id, true);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/opt-in', async (req, res, next) => {
  try {
    const contact = await setOptOut(req.params.id, false);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
