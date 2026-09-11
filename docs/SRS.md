# Software Requirements Specification (SRS)
## Reachback: AI-Powered SMS Outreach Platform

### 1. Executive Summary

Reachback is an AI-powered SMS outreach platform designed for roofing contractors. It automatically handles missed calls by sending intelligent SMS responses powered by OpenAI, learns from a client-managed knowledge base, and provides a web dashboard for conversation management and opt-out tracking.

### 2. System Overview

**Core Features:**
- Automatic missed-call handling via SMS
- AI-powered response generation using customer knowledge base
- Conversation history tracking
- Contact opt-out management
- Knowledge base editor for client customization
- Admin dashboard for conversation review

**Key Actors:**
- **Roofer (Client):** Uses the web dashboard to manage KB and review conversations
- **Customer (End User):** Receives SMS notifications and interacts via SMS
- **Admin:** Manages multiple clients and system configuration

### 3. Functional Requirements

#### 3.1 Webhook Handling
- Receive Twilio missed-call webhooks (`/webhooks/call`)
- Receive Twilio inbound SMS webhooks (`/webhooks/sms`)
- Validate webhook signatures for security
- Log all webhook events

#### 3.2 AI Response Generation
- Parse contact's phone number and client ID from webhook
- Retrieve knowledge base entries for the client
- Assemble prompt with KB context + conversation history
- Call OpenAI API to generate contextual response
- Return response to SMS service for delivery

#### 3.3 SMS Management
- Send outbound SMS via Twilio API
- Respect opt-out contacts (do not send)
- Enforce cooldown period after missed calls (1 hour default)
- Track sent/received messages in database

#### 3.4 Contact Management
- Track per-contact opt-out status
- Support opt-in/opt-out via SMS keywords ("STOP", "REMOVE")
- Prevent duplicate contacts per client

#### 3.5 Knowledge Base
- CRUD operations for FAQ entries
- Organize by category (Pricing, Services, etc.)
- Support per-client KB (isolated by client_id)
- Web UI for roofer to edit KB

#### 3.6 Conversation History
- Store all inbound/outbound messages
- Group by contact/conversation
- Display in chronological order
- Track message metadata (direction, type, timestamp)

#### 3.7 Client Management
- Create new client accounts
- Manage client phone, email, status
- List all clients in admin dashboard

### 4. Non-Functional Requirements

- **Latency:** SMS response generation < 3 seconds
- **Uptime:** 99.5% availability during business hours
- **Security:** Webhook signature validation, JWT auth for API
- **Scalability:** Support up to 100 clients, 10K messages/day
- **Data Retention:** Conversations stored indefinitely

### 5. Database Schema

See migrations in `apps/api/src/db/migrations/`:
1. `clients` — Client accounts
2. `contacts` — Customer contacts per client
3. `conversations` — Chat threads
4. `messages` — Individual messages
5. `kb_entries` — FAQ database
6. `opportunities` — Potential sales leads
7. `webhook_logs` — Event tracking

### 6. API Endpoints

**Webhooks:**
- `POST /webhooks/call` — Missed call receiver
- `POST /webhooks/sms` — Inbound SMS receiver

**Clients (Protected):**
- `GET /api/clients` — List all clients
- `POST /api/clients` — Create client
- `GET /api/clients/:id` — View client
- `PUT /api/clients/:id` — Update client
- `DELETE /api/clients/:id` — Delete client

**Conversations (Protected):**
- `GET /api/conversations?client_id=X` — List conversations
- `GET /api/conversations/:id` — View conversation thread

**Knowledge Base (Protected):**
- `GET /api/kb?client_id=X` — List KB entries
- `POST /api/kb` — Create KB entry
- `PUT /api/kb/:id` — Update KB entry
- `DELETE /api/kb/:id` — Delete KB entry

**Contacts (Protected):**
- `GET /api/contacts?client_id=X` — List contacts
- `POST /api/contacts/:id/opt-out` — Mark opted out
- `POST /api/contacts/:id/opt-in` — Mark opted in

### 7. Security Considerations

- JWT token authentication for admin routes
- Twilio webhook signature validation
- Sensitive env vars (API keys) not in repo
- SQL injection prevention via parameterized queries
- Input validation on all form submissions

### 8. Error Handling

- Invalid phone numbers → 404 error
- Missing KB entries → Return generic response
- Opted-out contacts → Log and skip sending
- AI API failures → Log and return fallback message
- Database errors → 500 error with logging

### 9. Future Enhancements

- Two-way conversation threading
- Lead qualification via SMS
- Custom SMS templates per client
- Analytics dashboard
- Callback scheduling
- Integration with CRM systems
