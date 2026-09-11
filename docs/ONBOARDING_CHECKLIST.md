# Client Onboarding Checklist
## Reachback Setup Guide

Use this checklist to onboard new roofing contractor clients.

---

## Phase 1: Account Setup (30 min)

- [ ] Create new client account in dashboard
  - Client name
  - Primary phone number
  - Business email
  
- [ ] Generate API credentials
  - API key for dashboard access
  - Webhook URLs for Twilio integration

- [ ] Send client access email with:
  - Dashboard login link
  - Username/password
  - KB editing instructions
  - Twilio webhook setup guide

---

## Phase 2: Twilio Integration (20 min)

- [ ] Verify client has Twilio account set up
  - Account SID
  - Auth token
  - Twilio phone number assigned

- [ ] Configure Twilio webhooks
  - Missed call webhook: `https://[API_URL]/webhooks/call`
  - Inbound SMS webhook: `https://[API_URL]/webhooks/sms`
  - Enable webhook signature validation

- [ ] Test webhook connectivity
  - Send test missed call event
  - Verify API receives callback
  - Check that SMS response fires

- [ ] Document webhook URLs for client reference

---

## Phase 3: Knowledge Base Setup (45 min)

- [ ] Provide KB template (see `KNOWLEDGE_BASE_TEMPLATE.md`)

- [ ] Client customizes KB entries:
  - [ ] Pricing Q&A
  - [ ] Services offered
  - [ ] Service area
  - [ ] Materials & durability
  - [ ] Insurance handling
  - [ ] How to get started
  - [ ] Payment & scheduling

- [ ] Add client business details:
  - Business name
  - Phone number
  - Website
  - Service area(s)
  - Financing partner (if any)

- [ ] Test KB with sample questions
  - Verify AI generates relevant responses
  - Check SMS format (keep under 160 chars)
  - Confirm tone matches business

---

## Phase 4: Testing & Validation (30 min)

### Missed Call Flow
- [ ] Admin calls client's Twilio number and hangs up
- [ ] Verify missed call webhook sent to API
- [ ] Confirm AI response generated
- [ ] Check SMS delivered to admin's phone

### Inbound SMS Flow
- [ ] Send test SMS to Twilio number
- [ ] Verify message logged in dashboard
- [ ] Confirm AI generated appropriate response
- [ ] Check response delivered

### Opt-Out Flow
- [ ] Send "STOP" keyword to Twilio number
- [ ] Verify contact marked as opted out
- [ ] Confirm no more messages sent to contact
- [ ] Test opt-in re-enables messages

### Cooldown Period
- [ ] Trigger missed call (cooldown starts)
- [ ] Send inbound SMS during cooldown
- [ ] Verify no response sent
- [ ] Wait 1 hour, repeat SMS
- [ ] Verify response sent after cooldown expires

---

## Phase 5: Live Deployment (10 min)

- [ ] Enable production mode in API settings
- [ ] Update Twilio webhook URLs to production (if different from staging)
- [ ] Verify client's phone number is correct
- [ ] Run final end-to-end test
- [ ] Document any custom configurations

---

## Phase 6: Training & Handoff (30 min)

- [ ] Schedule training call with client
  - Dashboard navigation
  - KB editing workflow
  - Viewing conversation history
  - Contact opt-out management
  - Interpreting AI responses

- [ ] Provide runbook:
  - Common issues & fixes
  - Dashboard login process
  - KB update guidelines
  - Contact information for support

- [ ] Set expectations:
  - Response time (typically <3 seconds)
  - KB best practices (keep answers concise)
  - Monthly review to monitor AI quality

---

## Phase 7: Post-Launch (Ongoing)

- [ ] Week 1: Monitor for issues
  - Check webhook delivery success rate
  - Review sample AI responses
  - Confirm contacts receiving messages

- [ ] Week 2: First KB optimization
  - Review customer conversations
  - Identify unanswered questions
  - Suggest new KB entries

- [ ] Monthly: Performance review
  - Message volume & trends
  - AI response quality (sample review)
  - Opt-out rate analysis
  - Customer feedback

- [ ] Quarterly: Renewal discussion
  - Pricing, add-ons, upgrades
  - Feature requests
  - Expansion opportunities

---

## Troubleshooting

### Issue: Webhook not received
- Verify Twilio webhook URL is correct and reachable
- Check API logs for errors
- Confirm webhook signature validation is disabled in dev

### Issue: AI responses not relevant
- Review client's KB entries for completeness
- Suggest adding more specific Q&A pairs
- Check conversation history for context gaps

### Issue: SMS not delivering
- Verify Twilio account has credits/balance
- Confirm phone numbers are in valid format
- Check for opt-out status on contact

### Issue: Cooldown not working
- Verify cooldown duration is set (default: 3600 sec)
- Check database for `cooldown_until` timestamp
- Clear manually if needed

---

## Quick Reference

**Key Links:**
- Dashboard: `https://[WEB_URL]`
- API docs: `https://[API_URL]/docs` (if enabled)
- Twilio console: `https://console.twilio.com`

**Contact Hours:**
- Support: Monday-Friday, 9 AM - 5 PM
- Emergency (API down): 24/7 via [EMERGENCY_CONTACT]

**Typical Timeline:**
- Account creation: 5 min
- Twilio setup: 15-20 min
- KB customization: 45-60 min
- Testing: 30 min
- Total: ~2 hours (spread over 1-2 days)
