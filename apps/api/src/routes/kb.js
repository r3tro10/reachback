const express = require('express');
const { getKBEntriesByClient, getKBEntryById, createKBEntry, updateKBEntry, deleteKBEntry } = require('../db/models/kb');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { client_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id required' });
    }
    const entries = await getKBEntriesByClient(client_id);
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const entry = await getKBEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'KB entry not found' });
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { client_id, question, answer, category } = req.body;
    const entry = await createKBEntry(client_id, question, answer, category);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { question, answer, category } = req.body;
    const entry = await updateKBEntry(req.params.id, question, answer, category);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteKBEntry(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
