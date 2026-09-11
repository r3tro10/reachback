1.Use_Case

graph LR
    subgraph Actors
        Admin[AnteikuAI Admin]
        Roofer[Roofer / Client]
        Customer[End Customer]
    end

    subgraph Admin Use Cases
        UC1[Provision Client Account]
        UC2[Assign Phone Number]
        UC3[Configure AI Prompt]
        UC4[Manage Knowledge Base]
        UC5[View All Conversations]
        UC6[Deactivate Client]
        UC7[Manage Opt-Out List]
    end

    subgraph Roofer Use Cases
        UC8[Receive Missed Call Notification]
        UC9[Receive Booking Summary]
        UC10[View Conversation Thread]
    end

    subgraph Customer Use Cases
        UC11[Call Roofer Number]
        UC12[Receive MCTB Opening SMS]
        UC13[Reply to AI via SMS]
        UC14[Book Site Visit]
        UC15[Opt Out via STOP]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Roofer --> UC8
    Roofer --> UC9
    Roofer --> UC10
    Customer --> UC11
    Customer --> UC12
    Customer --> UC13
    Customer --> UC14
    Customer --> UC15
    UC11 -->|triggers| UC12
    UC13 -->|drives| UC14
    UC14 -->|triggers| UC9


..........................................................................................

2.Class

classDiagram
    class Client {
        +UUID id
        +String businessName
        +String rooferName
        +String phoneNumber
        +String rooferMobile
        +Text systemPrompt
        +Boolean active
        +DateTime createdAt
        +resolveByNumber(phone) Client
        +getKnowledgeBase() KBEntry[]
    }

    class Contact {
        +UUID id
        +UUID clientId
        +String phone
        +Boolean optedOut
        +DateTime cooldownUntil
        +Boolean isExistingClient
        +DateTime createdAt
        +isOnCooldown() Boolean
        +setOptOut() void
        +setCooldown(hours) void
    }

    class Conversation {
        +UUID id
        +UUID clientId
        +UUID contactId
        +Enum status
        +Int messageCount
        +DateTime createdAt
        +DateTime updatedAt
        +getHistory() Message[]
        +incrementCount() void
        +markBooked() void
        +markHandedOff() void
    }

    class Message {
        +UUID id
        +UUID conversationId
        +Enum role
        +Text content
        +DateTime sentAt
    }

    class KBEntry {
        +UUID id
        +UUID clientId
        +String question
        +Text answer
        +DateTime createdAt
    }

    class Opportunity {
        +UUID id
        +UUID clientId
        +UUID contactId
        +String stage
        +DateTime createdAt
    }

    class AIEngine {
        +assembleContext(client, conversation) Prompt
        +callLLM(prompt) String
        +detectBooking(reply) Boolean
        +respond(conversationId) void
    }

    class WebhookHandler {
        +handleMissedCall(payload) void
        +handleInboundSMS(payload) void
        +validateSignature(headers) Boolean
    }

    class NotificationService {
        +sendRooferAlert(client, contact) void
        +sendBookingSummary(client, contact, details) void
        +sendOptOutConfirm(contact) void
    }

    Client "1" --> "*" Contact : has
    Client "1" --> "*" Conversation : has
    Client "1" --> "*" KBEntry : has
    Contact "1" --> "*" Conversation : participates in
    Contact "1" --> "0..1" Opportunity : has
    Conversation "1" --> "*" Message : contains
    WebhookHandler --> Contact : resolves
    WebhookHandler --> Client : resolves
    WebhookHandler --> AIEngine : delegates
    AIEngine --> KBEntry : reads
    AIEngine --> Conversation : updates
    AIEngine --> NotificationService : triggers


..................................................................................

3.Sequence: Missed Call

sequenceDiagram
    autonumber
    participant C as Customer Phone
    participant T as Telephony API
    participant W as Webhook Handler
    participant D as Database
    participant N as Notification Service
    participant R as Roofer Mobile

    C->>T: Dials roofer number (no answer)
    T->>W: POST /api/webhook/call
    W->>W: Validate webhook signature

    W->>D: Resolve client by called number
    D-->>W: Client record

    W->>D: Lookup contact by caller number
    D-->>W: Contact record (or create new)

    W->>D: Check opted_out flag
    alt Contact has opted out
        W-->>T: 200 OK — discard silently
    else Not opted out
        W->>D: Check cooldown_until
        alt Cooldown active
            W-->>T: 200 OK — discard silently
        else No cooldown
            W->>D: SET cooldown_until = now + 24h
            W->>D: Lookup opportunity record
            D-->>W: Existing client OR new lead
            W->>D: Create conversation record
            W->>T: Send opening SMS (template by classification)
            T->>C: Deliver opening SMS
            W->>N: Trigger roofer alert
            N->>T: Send internal notification SMS
            T->>R: Deliver missed call alert
        end
    end

..................................................................................

4.Squence AI Reply

sequenceDiagram
    autonumber
    participant C as Customer Phone
    participant T as Telephony API
    participant W as SMS Webhook Handler
    participant D as Database
    participant A as AI Engine
    participant O as OpenAI API
    participant N as Notification Service
    participant R as Roofer Mobile

    C->>T: Sends SMS reply
    T->>W: POST /api/webhook/sms
    W->>W: Validate webhook signature
    W->>D: Resolve client + contact

    W->>W: Detect STOP keyword
    alt STOP received
        W->>D: SET opted_out = true
        W->>T: Send opt-out confirmation SMS
        T->>C: Deliver confirmation
    else Normal reply
        W->>D: Fetch conversation record
        D-->>W: Conversation + message count

        alt Message count >= 15
            W->>T: Send hand-off message
            W->>D: SET status = handed_off
        else Within limit
            W->>D: Store inbound message (role: user)
            A->>D: Fetch KB entries for client
            D-->>A: KB FAQ pairs
            A->>D: Fetch full conversation history
            D-->>A: Messages array
            A->>O: POST /chat/completions
            Note over A,O: system_prompt + KB + history + new message
            O-->>A: Assistant reply text
            A->>D: Store assistant message (role: assistant)
            A->>D: Increment message_count
            A->>T: Send SMS reply to customer
            T->>C: Deliver AI reply

            A->>A: Detect Step 5 booking close
            alt Booking confirmed
                A->>D: SET conversation status = booked
                A->>N: Trigger booking summary
                N->>T: Send booking details SMS
                T->>R: Deliver booking notification
            end
        end
    end

...................................................................................

5. State Conversation

stateDiagram-v2
    [*] --> Pending : Missed call webhook received

    Pending --> Active : Opening SMS sent + cooldown set
    Pending --> Discarded : Opted out OR cooldown active

    Active --> Active : AI reply sent (msg count < 15)
    Active --> Booked : Step 5 close detected
    Active --> HandedOff : Message limit reached (15 msgs)
    Active --> HandedOff : Wrap-up triggered (Step 5 not reached by msg 10)
    Active --> OptedOut : STOP keyword received
    Active --> Expired : 24h elapsed with no reply

    Booked --> [*] : Roofer notified with booking summary
    HandedOff --> [*] : Roofer notified to follow up manually
    OptedOut --> [*] : Opt-out confirmed, contact flagged
    Expired --> [*] : Cooldown tag removed, contact re-eligible
    Discarded --> [*]

    note right of Active
        Message roles: user / assistant
        KB injected fresh on every turn
        Cooldown remains active throughout
    end note

    note right of Booked
        Summary sent to roofer:
        name, address, postcode,
        preferred time, callback number
    end note

............................................................................................

6. component 

graph TB
    subgraph Browser["Client Browser"]
        UI[Admin Dashboard UI\nNext.js React Pages]
    end

    subgraph App["Next.js Application Server"]
        AUTH[Auth Middleware]
        WH_CALL[Missed Call Handler\n/api/webhook/call]
        WH_SMS[Inbound SMS Handler\n/api/webhook/sms]
        AI[AI Engine\n/api/ai/respond]
        NOTIFY[Notification Service\n/api/notify]
        CLIENT_API[Client Manager\n/api/clients]
        KB_API[KB Manager\n/api/kb]
        CONVO_API[Conversation Viewer\n/api/conversations]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL\nDatabase)]
    end

    subgraph External["External Services"]
        TEL[Telephony API\nUK Numbers + SMS + Webhooks]
        OAI[OpenAI API\nGPT-4o]
        STRIPE[Stripe\nBilling]
    end

    UI --> AUTH
    AUTH --> CLIENT_API
    AUTH --> KB_API
    AUTH --> CONVO_API
    CLIENT_API --> STRIPE

    TEL -->|missed call webhook| WH_CALL
    TEL -->|inbound SMS webhook| WH_SMS

    WH_CALL --> DB
    WH_CALL --> NOTIFY
    WH_CALL --> TEL

    WH_SMS --> AI
    WH_SMS --> DB

    AI --> DB
    AI --> OAI
    AI --> TEL
    AI --> NOTIFY

    NOTIFY --> TEL

    CLIENT_API --> DB
    KB_API --> DB
    CONVO_API --> DB

.............................................................................................

7. ER Diagram

erDiagram
    CLIENT {
        uuid id PK
        string business_name
        string roofer_name
        string phone_number
        string roofer_mobile
        text system_prompt
        boolean active
        timestamptz created_at
    }

    CONTACT {
        uuid id PK
        uuid client_id FK
        string phone
        boolean opted_out
        timestamptz cooldown_until
        boolean is_existing_client
        string source
        timestamptz created_at
    }

    CONVERSATION {
        uuid id PK
        uuid client_id FK
        uuid contact_id FK
        varchar status
        int message_count
        timestamptz created_at
        timestamptz updated_at
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        varchar role
        text content
        timestamptz sent_at
    }

    KB_ENTRY {
        uuid id PK
        uuid client_id FK
        text question
        text answer
        int sort_order
        timestamptz created_at
    }

    OPPORTUNITY {
        uuid id PK
        uuid client_id FK
        uuid contact_id FK
        varchar stage
        timestamptz created_at
    }

    WEBHOOK_LOG {
        uuid id PK
        uuid client_id FK
        varchar event_type
        text payload
        varchar status
        timestamptz received_at
    }

    CLIENT ||--o{ CONTACT : "has"
    CLIENT ||--o{ CONVERSATION : "owns"
    CLIENT ||--o{ KB_ENTRY : "configures"
    CLIENT ||--o{ OPPORTUNITY : "tracks"
    CLIENT ||--o{ WEBHOOK_LOG : "receives"
    CONTACT ||--o{ CONVERSATION : "has"
    CONTACT ||--o| OPPORTUNITY : "linked to"
    CONVERSATION ||--o{ MESSAGE : "contains"

...........................................................................................
