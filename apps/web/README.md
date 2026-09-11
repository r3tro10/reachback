# Reachback Dashboard

Next.js admin dashboard for managing clients, conversations, and knowledge base.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   ```bash
   cp .env.example .env.local
   ```

3. Start development server
   ```bash
   npm run dev
   ```

Dashboard runs on http://localhost:3000

## Architecture

- `app/` — Next.js pages (routing)
- `components/` — Reusable UI components
- `lib/` — Utility functions (API client, auth helpers)

## Key Pages

- `/` — Dashboard home
- `/clients` — Client management
- `/conversations` — Conversation history
- `/kb/:clientId` — Knowledge base editor
