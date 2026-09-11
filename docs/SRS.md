# Software Requirements Specification
## AnteikuAI — Missed-Call Text-Back AI Service
**Version:** 1.0  
**Date:** September 2026  
**Author:** Abdul Hadi Rauf, AnteikuAI  
**Status:** Draft for Development

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for the AnteikuAI Missed-Call Text-Back (MCTB) service — a multi-tenant SaaS platform that automatically initiates and manages AI-driven SMS conversations when a roofing contractor misses an inbound call from a potential customer.

### 1.2 Scope
The system handles the full lifecycle of a missed-call event:
- Detection of a missed inbound call via telephony webhook
- Suppression of duplicate events via cooldown logic
- CRM lookup to classify the caller (new lead vs existing client)
- AI-driven SMS conversation to capture lead details and book a site visit
- Internal notification to the roofer
- Admin dashboard for AnteikuAI staff to manage client accounts

The service is sold to UK roofing contractors at £500 setup + £400/month recurring. Each client is provisioned with their own phone number, AI configuration, and knowledge base.

### 1.3 Definitions
| Term | Definition |
|---|---|
| MCTB | Missed-Call Text-Back — the core automated SMS response event |
| Client | A roofing contractor who has purchased the service |
| Contact | An end customer who called the roofer's number |
| Cooldown | A 24-hour suppression window preventing duplicate SMS to the same contact |
| KB | Knowledge Base — per-client FAQ data used to ground AI responses |
| Webhook | An HTTP callback fired by the telephony provider on call events |
| Opportunity | A CRM pipeline record representing a sales lead |

### 1.4 System Overview
AnteikuAI is a web application with three logical layers:
1. **Telephony layer** — receives missed-call webhooks, sends/receives SMS
2. **AI engine** — processes inbound SMS replies using an LLM with per-client context
3. **Admin dashboard** — manages clients, numbers, KB, and conversation monitoring

---

## 2. Overall Description

### 2.1 User Classes
| User | Description |
|---|---|
| **AnteikuAI Admin** | Platform operator (Abdul Hadi Rauf). Full access to all client accounts, provisioning, billing, and system config. |
| **Client (Roofer)** | Pays for the service. Receives internal notifications. May access a read-only portal (v2 feature). |
| **End Customer** | The homeowner who called. Interacts only via SMS — never logs into the platform. |

### 2.2 Operating Environment
- Hosted as a Next.js web application (Node.js runtime)
- PostgreSQL database (hosted)
- Deployed on a cloud platform with public HTTPS endpoints for webhooks
- All webhook endpoints must be publicly reachable 24/7
- SMS and telephony provided via a UK-capable telephony API
- AI responses powered by OpenAI GPT-4o API

### 2.3 Constraints
- UK phone numbers and SMS compliance (ICO, PECR) required
- STOP opt-out must be honoured immediately and permanently
- STOP instruction included on first message per conversation only
- No SMS sent to contacts who have opted out
- Response latency target: AI reply sent within 10 seconds of inbound SMS receipt
- System must handle multiple clients concurrently without cross-contamination of data or prompts

---

## 3. Functional Requirements

### 3.1 Telephony & Missed Call Detection

**FR-T01 — Webhook Receiver**  
The system SHALL expose a public HTTPS endpoint that receives call event webhooks from the telephony provider. The endpoint SHALL process events of type: `call.missed`, `call.completed`, `sms.received`.

**FR-T02 — Missed Call Classification**  
On receipt of a missed call webhook, the system SHALL extract:
- Caller number (E.164 format)
- Called number (the client's Anteiku AI number)
- Call timestamp (UTC)
- Call direction (inbound)

The system SHALL only trigger the MCTB flow for **inbound** missed calls.

**FR-T03 — Client Resolution**  
The system SHALL resolve the called number to a specific client account. If no client is mapped to the called number, the event SHALL be logged and discarded.

**FR-T04 — SMS Send**  
The system SHALL send outbound SMS via the telephony API using the client's assigned number as the sender. Messages SHALL be UTF-8 encoded and within GSM 160-character segments where possible.

**FR-T05 — Inbound SMS Routing**  
The system SHALL expose a public HTTPS endpoint for inbound SMS webhooks. On receipt, the system SHALL resolve the destination number to a client account and the sender number to a contact record, then route to the AI engine.

---

### 3.2 Cooldown & Deduplication

**FR-C01 — Cooldown Check**  
Before initiating any MCTB flow, the system SHALL check whether the contact has an active cooldown flag. If the flag is set, the missed call event SHALL be silently discarded.

**FR-C02 — Cooldown Set**  
Immediately after the first MCTB SMS is sent, the system SHALL set a cooldown flag on the contact record with an expiry of **24 hours**.

**FR-C03 — Cooldown Expiry**  
After 24 hours, the cooldown flag SHALL be automatically removed, re-enabling future MCTB flows for that contact.

---

### 3.3 Contact & Opportunity Management

**FR-O01 — Contact Lookup**  
On a missed call event, the system SHALL look up the caller's phone number in the client's contact database. If no record exists, a new contact record SHALL be created with: phone number, timestamp, source = "missed_call".

**FR-O02 — Opportunity Lookup**  
After contact resolution, the system SHALL check for an existing open opportunity record linked to that contact in the client's pipeline.

**FR-O03 — Lead Classification**  
Based on FR-O02, the contact SHALL be classified as one of:
- **New Lead** — no existing opportunity found
- **Existing Client** — open opportunity found

This classification determines which SMS template and notification template are used.

**FR-O04 — Opportunity Creation**  
For New Leads, the system SHALL create an opportunity record in the client's pipeline after the MCTB SMS is sent. Stage: "Missed Call — Contacted".

---

### 3.4 SMS Templates

**FR-S01 — New Lead Opening SMS**  
For contacts classified as New Lead, the system SHALL send the following opener:  
`"Hi — sorry we missed your call, we're out on a job right now. How can we help? Just reply here and we'll get back to you."`

**FR-S02 — Existing Client Opening SMS**  
For contacts classified as Existing Client, the system SHALL send a tailored callback message referencing the ongoing relationship. Exact copy is configurable per client.

**FR-S03 — STOP Compliance**  
The STOP opt-out instruction SHALL be appended to the **first message only** in any new conversation thread. It SHALL NOT appear on subsequent messages in the same thread. Exact wording: `"Reply STOP to unsubscribe."`

**FR-S04 — Opt-Out Enforcement**  
If a contact replies STOP (case-insensitive), the system SHALL:
1. Immediately cease all outbound SMS to that contact
2. Set an opt-out flag on the contact record
3. Send a single confirmation: `"You've been unsubscribed and won't receive further messages."`
4. Never send another message to that contact unless they explicitly opt back in

---

### 3.5 AI Conversation Engine

**FR-A01 — Conversation State**  
The system SHALL maintain a per-conversation message history. Each message SHALL be stored with: role (user/assistant), content, timestamp, conversation_id.

**FR-A02 — Context Assembly**  
On each inbound SMS, the system SHALL assemble the LLM context as:
1. System prompt (per-client, configured at provisioning)
2. Knowledge base content (per-client FAQ pairs, injected as context)
3. Full conversation history (all prior messages in this thread)
4. New inbound message

**FR-A03 — AI Goal**  
The AI SHALL pursue one goal: book a free, no-obligation site visit. It SHALL collect: nature of the roofing problem, urgency (water ingress yes/no), full address with postcode, callback number, preferred day/time, and customer name.

**FR-A04 — Conversation Flow (5 Steps)**  
The AI SHALL follow this sequence, one step per message:
1. **Acknowledge** — warm acknowledgement, no question
2. **Identify problem** — "What's going on with the roof?" (skip if already disclosed)
3. **Assess urgency** — "Is water actively getting through right now?" (water/damp jobs only)
4. **Collect details** — address (postcode mandatory) → callback number → preferred time → name
5. **Close** — "Thank you [NAME], your visit has been booked for [DAY/TIME]. You'll hear from [ROOFER NAME] shortly to confirm — no charge, no obligation."

**FR-A05 — Behavioural Rules**  
The AI SHALL enforce the following rules at all times:
- TWO SEPARATE FACTS: problem type and urgency are independent disclosures. Never infer one from the other.
- NAMES: never address the customer by name until they provide it. Roofer name always from KB, never generic.
- OFF-SCRIPT FALLBACK: park only the part that doesn't fit (e.g. neighbour enquiry); continue on the caller's own issue.
- MULTI-PART MESSAGES: answer the customer's question first, then continue the flow.
- WRAP-UP AT 10: if Step 5 not reached by message 10, hand off gracefully.
- ADDRESS: never accept vague locations. Postcode is mandatory.
- RETURNING CUSTOMERS: skip Steps 2–3. Go straight to address confirmation.
- IMPATIENCE OVERRIDE: if customer signals impatience and problem is known, skip to Step 4.
- PRICING: share KB price ranges when asked. Repeated question = rephrase, not deflect.
- REPAIR vs REPLACE: never recommend either. Defer to the site visit.

**FR-A06 — Message Limit**  
The AI SHALL not exceed 15 messages per conversation. At message 15, if Step 5 is not complete, the AI SHALL hand off to the roofer.

**FR-A07 — Knowledge Base Grounding**  
All business-specific facts (roofer name, coverage areas, pricing, services, accreditations, hours, emergency response time) SHALL be sourced exclusively from the client's KB. The AI SHALL never invent facts not present in the KB.

---

### 3.6 Knowledge Base

**FR-K01 — Structure**  
Each client SHALL have a knowledge base consisting of FAQ pairs (question + answer). Minimum viable KB: 15 entries covering the fields in FR-K02.

**FR-K02 — Required KB Entries (per client)**  
| Topic | Required |
|---|---|
| Company identity (name, years trading) | Yes |
| Roofer's name | Yes |
| Coverage areas / postcodes | Yes |
| Services offered | Yes |
| Emergency response time | Yes |
| Pricing ranges | Yes |
| Quote process (photos / site visit) | Yes |
| Job duration estimates | Yes |
| Payment methods | Yes |
| Guarantee / warranty | Yes |
| Accreditations | Yes |
| Working hours | Yes |
| Callback time commitment | Yes |
| Website URL | No |
| Flat roof systems (if applicable) | No |

**FR-K03 — KB Injection**  
At AI context assembly time, all KB entries SHALL be injected into the system context. KB content SHALL NOT be used as few-shot examples — it SHALL be injected as factual reference.

---

### 3.7 Internal Notifications

**FR-N01 — New Lead Notification**  
When a new lead MCTB is triggered, the system SHALL send an internal notification to the roofer. Channel: SMS to the roofer's personal mobile. Content: caller number, timestamp, and a link to the conversation thread.

**FR-N02 — Existing Client Notification**  
When an existing client missed call is detected, the system SHALL send a distinct internal notification flagging the returning client.

**FR-N03 — Booking Notification**  
When the AI successfully reaches Step 5 (booking close), the system SHALL send a summary notification to the roofer containing: customer name, address, postcode, preferred time, and callback number.

---

### 3.8 Admin Dashboard

**FR-D01 — Client Management**  
The admin dashboard SHALL allow AnteikuAI staff to:
- Create a new client account
- Assign a UK phone number to the client
- Configure the client's system prompt and KB
- Set the roofer's personal mobile number for notifications
- View all conversations for a client
- Deactivate a client account

**FR-D02 — Conversation View**  
For each client, the dashboard SHALL display all conversation threads, showing: contact number, message history, current status (active / booked / handed off / opted out), and timestamps.

**FR-D03 — KB Editor**  
The dashboard SHALL provide a UI to add, edit, and delete KB entries per client without requiring a code deployment.

**FR-D04 — Opt-Out Management**  
The dashboard SHALL display all opted-out contacts per client. Opted-out contacts SHALL be clearly flagged and blocked from receiving messages.

---

### 3.9 Client Onboarding Flow

**FR-ON01 — Onboarding Sequence**  
New clients SHALL be onboarded in this order:
1. Phone call — verbal agreement to terms
2. Stripe payment — setup fee + first month (card before provisioning)
3. Onboarding form — client completes 24-field data collection form
4. Admin provisions account — number assigned, KB populated from form, prompt configured
5. End-to-end test — admin verifies MCTB loop before going live

**FR-ON02 — Onboarding Form Fields**  
The onboarding form SHALL collect (minimum):
- Business trading name
- Owner / director full name
- Business phone number
- Coverage areas and postcodes
- Services offered (checklist)
- Emergency definition and response time
- Pricing ranges per job type
- Job duration estimates
- Payment methods accepted
- Accreditations held
- Operating hours
- Callback time commitment
- Flat roof systems (if applicable)
- Guarantee / warranty terms
- Website URL
- Quote process preference

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-P01:** AI reply SHALL be sent within 10 seconds of inbound SMS receipt under normal load.
- **NFR-P02:** Missed-call opener SMS SHALL be sent within 5 seconds of webhook receipt.
- **NFR-P03:** The system SHALL handle at least 50 concurrent active conversations without degradation.

### 4.2 Reliability
- **NFR-R01:** Webhook endpoints SHALL have 99.9% uptime.
- **NFR-R02:** All inbound webhooks SHALL be acknowledged with HTTP 200 within 3 seconds to prevent telephony provider retries.
- **NFR-R03:** Failed message sends SHALL be retried up to 3 times with exponential backoff.
- **NFR-R04:** All events (calls, messages, AI calls, errors) SHALL be logged with timestamp and client ID.

### 4.3 Security
- **NFR-S01:** Webhook endpoints SHALL validate the provider's signature header on every request.
- **NFR-S02:** All data in transit SHALL use TLS 1.2 or higher.
- **NFR-S03:** Database credentials, API keys, and secrets SHALL be stored as environment variables — never hardcoded.
- **NFR-S04:** Client data SHALL be logically isolated — no cross-client data access is permissible.
- **NFR-S05:** Admin dashboard SHALL require authentication (username + password minimum; 2FA recommended).

### 4.4 Scalability
- **NFR-SC01:** The system architecture SHALL support adding new clients by inserting a database record — no code changes required.
- **NFR-SC02:** The database schema SHALL support unlimited clients and contacts.
- **NFR-SC03:** The AI engine SHALL be stateless — all context assembled fresh per request from the database.

### 4.5 Compliance
- **NFR-CO01:** All SMS communications SHALL comply with UK PECR and ICO guidance.
- **NFR-CO02:** STOP opt-outs SHALL be processed immediately and irreversibly.
- **NFR-CO03:** No personal data SHALL be retained beyond what is necessary for the service function.
- **NFR-CO04:** Conversation data SHALL be retained for a maximum of 12 months unless a client requests earlier deletion.

---

## 5. System Architecture

### 5.1 Components
```
┌─────────────────────────────────────────────┐
│              Next.js Web Application         │
│                                             │
│  ┌─────────────┐   ┌─────────────────────┐  │
│  │  Dashboard  │   │     API Routes       │  │
│  │  (Frontend) │   │                     │  │
│  │             │   │ /api/webhook/call   │  │
│  │  - Clients  │   │ /api/webhook/sms    │  │
│  │  - Convos   │   │ /api/ai/respond     │  │
│  │  - KB edit  │   │ /api/clients        │  │
│  └─────────────┘   └─────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼───────────┐
    │          │           │
┌───▼───┐ ┌───▼───┐ ┌─────▼─────┐
│  DB   │ │  AI   │ │Telephony  │
│Postgres│ │OpenAI │ │   API     │
│       │ │GPT-4o │ │           │
└───────┘ └───────┘ └───────────┘
```

### 5.2 Database Schema (Core Tables)

**clients**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| business_name | VARCHAR | |
| roofer_name | VARCHAR | Used in AI close |
| phone_number | VARCHAR | Assigned UK number |
| roofer_mobile | VARCHAR | For notifications |
| system_prompt | TEXT | Per-client AI prompt |
| active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

**contacts**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK | |
| phone | VARCHAR | E.164 format |
| opted_out | BOOLEAN | STOP flag |
| cooldown_until | TIMESTAMPTZ | Null = no cooldown |
| is_existing_client | BOOLEAN | From opportunity lookup |
| created_at | TIMESTAMPTZ | |

**conversations**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK | |
| contact_id | UUID FK | |
| status | ENUM | active/booked/handed_off/opted_out |
| message_count | INT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**messages**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| conversation_id | UUID FK | |
| role | ENUM | user/assistant |
| content | TEXT | |
| sent_at | TIMESTAMPTZ | |

**knowledge_base**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK | |
| question | TEXT | |
| answer | TEXT | |
| created_at | TIMESTAMPTZ | |

### 5.3 Core Event Flow
```
Inbound missed call webhook
  → Validate signature
  → Resolve client by called number
  → Resolve/create contact by caller number
  → Check opt-out → if opted out: discard
  → Check cooldown → if active: discard
  → Set cooldown (24h)
  → Look up opportunity (existing client?)
  → Select SMS template (new lead / existing)
  → Append STOP instruction if first contact
  → Send opening SMS
  → Create conversation record
  → Notify roofer (internal SMS)

Inbound SMS reply webhook
  → Validate signature
  → Resolve client + contact
  → Check opt-out → if STOP: process opt-out, confirm, stop
  → Fetch conversation + full message history
  → Check message count → if ≥ 15: hand off
  → Assemble LLM context (prompt + KB + history + new message)
  → Call OpenAI API
  → Store assistant reply
  → Send SMS reply
  → If Step 5 detected: update conversation status = booked, notify roofer with summary
```

---

## 6. External Interfaces

### 6.1 Telephony API
- Provide UK mobile/geographic numbers
- Fire webhooks on: inbound call missed, inbound SMS received
- Accept API calls to: send SMS, look up number status
- Webhook payload SHALL include: from, to, direction, timestamp, event type

### 6.2 OpenAI API
- Model: GPT-4o (or equivalent)
- Interface: Chat Completions endpoint
- Input: messages array (system + user/assistant history)
- Output: assistant message content
- Timeout: 8 seconds. On timeout, send fallback: "Sorry, something went wrong on our end — the roofer will be in touch shortly."

### 6.3 Stripe
- Used for client billing only (not part of the core product)
- Setup fee: £500 one-time
- Monthly fee: £400 recurring
- No contract — cancel anytime

---

## 7. Out of Scope (v1)
- Voice AI / call answering
- Email channel
- Roofer client portal (self-service login)
- Automated KB generation from website crawl
- Multi-language support
- Outbound prospecting workflow (DEMO SMS to cold roofer leads) — separate product
- Calendar booking integration
- WhatsApp channel

---

## 8. Acceptance Criteria

The system SHALL be considered ready for first client go-live when all of the following pass:

| Test | Pass Condition |
|---|---|
| Missed call → SMS delivered | Opener SMS received on test phone within 5s |
| Cooldown | Second missed call within 24h does not send SMS |
| Cooldown reset | Third missed call after 24h sends SMS |
| Opt-out | STOP reply stops all messages; confirmation sent |
| Opt-out persistence | Subsequent missed calls do not trigger SMS |
| AI reply | Inbound SMS receives AI response within 10s |
| KB accuracy | AI cites correct roofer name, prices, postcodes |
| Step 5 close | Full 5-step flow completes correctly end-to-end |
| Message limit | Conversation wraps at message 15 |
| Multi-client isolation | Client A's contacts never receive Client B's messages |
| Notification | Roofer receives internal SMS on every new MCTB event |
| Booking notification | Roofer receives summary SMS when AI closes a booking |

---

*End of Document*  
*AnteikuAI — Slough, Berkshire, GB*