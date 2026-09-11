# Reachback

AI-powered SMS outreach platform for roofers. Automatically handles missed calls, learns from a knowledge base, and manages opt-outs.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key
- Twilio account (or equivalent telephony provider)

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Database**
   ```bash
   npm run db:migrate
   ```

4. **Development servers**
   ```bash
   npm run dev
   ```

   - API: http://localhost:3001
   - Web: http://localhost:3000

## Project Structure

- `apps/api/` — Node.js/Express backend (webhooks, AI, SMS, database)
- `apps/web/` — Next.js frontend (admin dashboard)
- `docs/` — Requirements, diagrams, prompts, templates

## Documentation

- [SRS.md](docs/SRS.md) — Full requirements specification
- [UML.md](docs/UML.md) — System architecture diagrams
- [AI_PROMPT.md](docs/AI_PROMPT.md) — Production AI prompt
- [KNOWLEDGE_BASE_TEMPLATE.md](docs/KNOWLEDGE_BASE_TEMPLATE.md) — KB FAQ template
- [ONBOARDING_CHECKLIST.md](docs/ONBOARDING_CHECKLIST.md) — Client setup steps

## License

Private/Proprietary
