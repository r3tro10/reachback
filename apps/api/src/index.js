require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const signatureMiddleware = require('./middleware/signature');
const errorHandler = require('./middleware/errorHandler');

const clientRoutes = require('./routes/clients');
const conversationRoutes = require('./routes/conversations');
const kbRoutes = require('./routes/kb');
const contactRoutes = require('./routes/contacts');

const callWebhook = require('./webhooks/call');
const smsWebhook = require('./webhooks/sms');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Webhook routes (no auth, signature validation)
app.post('/webhooks/call', signatureMiddleware, callWebhook);
app.post('/webhooks/sms', signatureMiddleware, smsWebhook);

// Protected API routes
app.use('/api/clients', authMiddleware, clientRoutes);
app.use('/api/conversations', authMiddleware, conversationRoutes);
app.use('/api/kb', authMiddleware, kbRoutes);
app.use('/api/contacts', authMiddleware, contactRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

module.exports = app;
