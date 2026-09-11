# UML Diagrams
## Reachback System Architecture

### 1. Use Case Diagram

```mermaid
actor Roofer
actor Customer
actor Admin

Roofer --> EditKB: Manage FAQ
Roofer --> ViewConversations: Review chats
Roofer --> ManageClients: Create account
Admin --> ManageClients
Admin --> ManageUsers

Customer --> ReceiveSMS: Get missed call response
Customer --> SendSMS: Reply to AI
Customer --> OptOut: Stop communications
```

### 2. Class Diagram

```mermaid
classDiagram
    class Client {
        +int id
        +string name
        +string phone
        +string email
        +string status
        +timestamp created_at
    }

    class Contact {
        +int id
        +int client_id
        +string phone
        +string name
        +bool opted_out
        +timestamp cooldown_until
    }

    class Conversation {
        +int id
        +int contact_id
        +int client_id
        +string status
        +timestamp last_message_at
    }

    class Message {
        +int id
        +int conversation_id
        +string direction
        +string content
        +string message_type
        +timestamp created_at
    }

    class KBEntry {
        +int id
        +int client_id
        +string question
        +string answer
        +string category
        +timestamp created_at
    }

    class Opportunity {
        +int id
        +int contact_id
        +int client_id
        +string title
        +string description
        +decimal value
        +string status
    }

    Client "1" --> "*" Contact
    Client "1" --> "*" Conversation
    Contact "1" --> "*" Conversation
    Conversation "1" --> "*" Message
    Client "1" --> "*" KBEntry
    Client "1" --> "*" Opportunity
    Contact "1" --> "*" Opportunity
```

### 3. Sequence Diagram - Missed Call Handling

```mermaid
sequenceDiagram
    participant Twilio
    participant API
    participant DB
    participant OpenAI
    participant SMS

    Twilio->>API: POST /webhooks/call (missed call event)
    API->>DB: Get contact by phone
    API->>DB: Get conversation history
    API->>DB: Get KB entries for client
    API->>OpenAI: Generate response (context + KB)
    OpenAI-->>API: Return AI response
    API->>SMS: Send SMS (outbound)
    SMS->>Twilio: Deliver message
    API->>DB: Log conversation & message
    API-->>Twilio: 200 OK
```

### 4. Sequence Diagram - Inbound SMS Handling

```mermaid
sequenceDiagram
    participant Twilio
    participant API
    participant DB
    participant OpenAI

    Twilio->>API: POST /webhooks/sms (inbound message)
    API->>DB: Check if contact opted out
    alt Contact opted out
        API->>Twilio: 200 OK (skip)
    else Contact active
        API->>DB: Get conversation history
        API->>DB: Check cooldown status
        alt In cooldown
            API->>Twilio: 200 OK (skip response)
        else Cooldown expired
            API->>DB: Get KB entries
            API->>OpenAI: Generate response
            OpenAI-->>API: Return response
            alt Response contains STOP keyword
                API->>DB: Mark contact as opted out
            else Normal response
                API->>DB: Send SMS reply
            end
        end
    end
    API->>DB: Log message
    API-->>Twilio: 200 OK
```

### 5. State Diagram - Contact Status

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> OptedOut: Customer sends STOP
    Active --> Cooldown: AI response sent\n(after missed call)
    Cooldown --> Active: 1 hour passes
    OptedOut --> Active: Admin manually opts in
    Active --> [*]
```

### 6. Component Diagram

```mermaid
graph TB
    subgraph "Frontend"
        Web["Next.js Dashboard"]
    end

    subgraph "Backend"
        API["Express API"]
        Webhooks["Webhook Handlers"]
        Services["Services<br/>AI, SMS, Notify"]
        DB["Postgres DB"]
    end

    subgraph "External Services"
        Twilio["Twilio API<br/>(SMS/Calls)"]
        OpenAI["OpenAI API<br/>(Completions)"]
    end

    Web <-->|REST API| API
    Webhooks <-->|Verify & Process| API
    API <-->|Query/Insert| DB
    Webhooks <--->|Webhook Events| Twilio
    Services <-->|Send SMS| Twilio
    Services <-->|Generate Text| OpenAI
    API <-->|Business Logic| Services
```

### 7. Activity Diagram - Client Onboarding

```mermaid
graph TD
    A["Start: New Client"] --> B["Create client account"]
    B --> C["Generate webhook URLs"]
    C --> D["Configure Twilio webhooks"]
    D --> E["Create sample KB entries"]
    E --> F["Test missed call flow"]
    F --> G{Configured?}
    G -->|Yes| H["Client active"]
    G -->|No| E
    H --> I["End"]
```
