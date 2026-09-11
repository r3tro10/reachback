# Reachback API

Node.js/Express backend for Reachback.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   ```bash
   cp .env.example .env
   ```

3. Run migrations
   ```bash
   npm run migrate
   ```

4. Start development server
   ```bash
   npm run dev
   ```

Server runs on http://localhost:3001

## Architecture

- `webhooks/` — Telephony event handlers (missed calls, inbound SMS)
- `services/` — Core business logic (AI, SMS sender, notifications)
- `db/` — Database models and migrations
- `routes/` — REST API endpoints
- `middleware/` — Auth, signature validation, error handling

## Key Endpoints

- `POST /api/webhooks/call` — Incoming call webhook
- `POST /api/webhooks/sms` — Inbound SMS webhook
- `GET/POST /api/clients` — Client management
- `GET /api/conversations` — Conversation history
- `POST/GET /api/kb` — Knowledge base management
