# Praxis Agent Carbon Platform - Architecture Diagrams

This document provides detailed architecture diagrams showing how all components interact within the Praxis Agent Carbon Platform.

---

## 🏛️ High-Level Platform Architecture

```mermaid
graph TB
    subgraph "User Layer"
        WEB[Web UI]
        CHAT[Chat Apps<br/>WhatsApp, Telegram, Discord]
        API[API Clients]
    end
    
    subgraph "Orchestration Layer"
        SWARM[Swarm<br/>Orchestrator]
        AGENT[Praxis Agent Carbon<br/>Framework]
        WS[WebSocket Manager]
    end
    
    subgraph "Backend Layer"
        PG[(PostgreSQL)]
        REST[PostgREST API]
        DENO[Deno Functions]
        S3[S3 Storage]
    end
    
    WEB --> WS
    CHAT --> SWARM
    API --> AGENT
    
    WS --> AGENT
    AGENT --> REST
    SWARM --> REST
    
    REST --> PG
    DENO --> PG
    
    AGENT --> S3
    SWARM --> S3
    
    style SWARM fill:#10B981
    style AGENT fill:#1E3A8A
    style PG fill:#F59E0B
```

---

## 🔄 Data Flow Architecture

### 1. User Message Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Web UI
    participant WS as WebSocket
    participant AZ as Agent Zero
    participant PG as PostgREST
    participant DB as PostgreSQL
    participant LLM as LLM Provider

    U->>UI: Type message
    UI->>WS: Send message
    WS->>AZ: Forward to agent
    AZ->>AZ: Process with LLM
    AZ->>PG: Save conversation
    PG->>DB: INSERT message
    AZ->>PG: Query memories
    PG->>DB: SELECT with embeddings
    DB-->>PG: Related memories
    PG-->>AZ: Memory results
    AZ->>AZ: Generate response
    AZ->>PG: Save response
    PG->>DB: UPDATE conversation
    AZ->>WS: Stream response
    WS->>UI: Display response
    UI->>U: Show final message
```

### 2. Swarm Channel Message Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Channel App
    participant S as Swarm
    participant D as Docker
    participant AC as Agent Container
    participant DB as PostgreSQL

    U->>C: Send " @Andy task"
    C->>S: Webhook/Message
    S->>S: Check trigger word
    S->>D: Spawn container
    D->>AC: Start Agent Zero
    AC->>DB: Load group context
    DB-->>AC: Group memory
    AC->>AC: Execute task
    AC->>DB: Save results
    AC-->>S: Task completed
    S->>C: Send response
    C->>U: Display response
```

### 3. Scheduled Task Execution Flow

```mermaid
sequenceDiagram
    participant CR as Cron Scheduler
    participant S as Swarm
    participant D as Docker
    participant AC as Agent Container
    participant F as Deno Functions
    participant DB as PostgreSQL

    CR->>S: Trigger (time-based)
    S->>DB: Get scheduled tasks
    DB-->>S: Task list
    loop For each task
        S->>D: Spawn agent container
        D->>AC: Start with task
        AC->>F: Call edge function
        F-->>AC: Function result
        AC->>DB: Save execution log
        AC-->>S: Task result
        S->>DB: Update next_run time
    end
```

---

## 🏗️ Component Architecture

### InsForge Backend Architecture

```mermaid
graph TB
    subgraph "InsForge Backend"
        API[API Routes]
        SVC[Services]
        PRV[Providers]
        DB[(Database)]
    end
    
    subgraph "API Layer"
        API1[Auth Routes]
        API2[Storage Routes]
        API3[Functions Routes]
        API4[Database Routes]
    end
    
    subgraph "Service Layer"
        SVC1[Auth Service]
        SVC2[Storage Service]
        SVC3[Function Service]
        SVC4[Database Service]
    end
    
    subgraph "Provider Layer"
        PRV1[OAuth Providers]
        PRV2[S3 Provider]
        PRV3[Deno Provider]
        PRV4[PostgREST Proxy]
    end
    
    API1 --> SVC1
    API2 --> SVC2
    API3 --> SVC3
    API4 --> SVC4
    
    SVC1 --> PRV1
    SVC2 --> PRV2
    SVC3 --> PRV3
    SVC4 --> PRV4
    
    PRV4 --> DB
```

### Agent Zero Architecture

```mermaid
graph TB
    subgraph "Agent Zero Framework"
        CORE[Core Agent]
        TOOLS[Tools]
        MEM[Memory System]
        SKILLS[Skills]
        PROJ[Projects]
    end
    
    subgraph "Tool Layer"
        T1[Code Execution]
        T2[Browser Agent]
        T3[Document Query]
        T4[File Operations]
        T5[Memory Tools]
        T6[Scheduler]
    end
    
    subgraph "Memory Layer"
        M1[Vector Store]
        M2[Solutions Store]
        M3[Knowledge Base]
    end
    
    subgraph "Skill System"
        S1[SKILL.md Parser]
        S2[Skill Registry]
        S3[Skill Executor]
    end
    
    CORE --> TOOLS
    CORE --> MEM
    CORE --> SKILLS
    CORE --> PROJ
    
    TOOLS --> T1
    TOOLS --> T2
    TOOLS --> T3
    TOOLS --> T4
    TOOLS --> T5
    TOOLS --> T6
    
    MEM --> M1
    MEM --> M2
    MEM --> M3
    
    SKILLS --> S1
    SKILLS --> S2
    SKILLS --> S3
```

### Swarm Architecture

```mermaid
graph TB
    subgraph "Swarm Orchestrator"
        ORCH[Orchestrator]
        CHAN[Channels]
        SCHED[Scheduler]
        CONT[Container Runner]
        IPC[IPC Manager]
    end
    
    subgraph "Channel Layer"
        C1[WhatsApp]
        C2[Telegram]
        C3[Discord]
        C4[Slack]
        C5[Gmail]
    end
    
    subgraph "Container Layer"
        CTX[Container Context]
        CTR[Container Runtime]
        MNT[Mount Manager]
    end
    
    subgraph "IPC Layer"
        IPC1[Message Queue]
        IPC2[Task Queue]
        IPC3[Status Files]
    end
    
    ORCH --> CHAN
    ORCH --> SCHED
    ORCH --> CONT
    ORCH --> IPC
    
    CHAN --> C1
    CHAN --> C2
    CHAN --> C3
    CHAN --> C4
    CHAN --> C5
    
    CONT --> CTX
    CONT --> CTR
    CONT --> MNT
    
    IPC --> IPC1
    IPC --> IPC2
    IPC --> IPC3
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        NET[Network Security]
        AUTH[Authentication]
        CONT[Container Isolation]
        DATA[Data Encryption]
    end
    
    subgraph "Network Layer"
        N1[TLS/HTTPS]
        N2[Firewall Rules]
        N3[Network Segmentation]
    end
    
    subgraph "Auth Layer"
        A1[JWT Tokens]
        A2[OAuth Providers]
        A3[Role-Based Access]
    end
    
    subgraph "Container Layer"
        C1[Docker Isolation]
        C2[Filesystem Mounts]
        C3[Resource Limits]
    end
    
    subgraph "Data Layer"
        D1[Database Encryption]
        D2[S3 Encryption]
        D3[Secrets Management]
    end
    
    NET --> N1
    NET --> N2
    NET --> N3
    
    AUTH --> A1
    AUTH --> A2
    AUTH --> A3
    
    CONT --> C1
    CONT --> C2
    CONT --> C3
    
    DATA --> D1
    DATA --> D2
    DATA --> D3
```

---

## 📊 Data Storage Architecture

```mermaid
graph TB
    subgraph "Storage Systems"
        PG[(PostgreSQL)]
        S3[S3 Storage]
        FS[File System]
        VEC[Vector Store]
    end
    
    subgraph "PostgreSQL Data"
        PG1[Users & Auth]
        PG2[Agent Configs]
        PG3[Memories]
        PG4[Conversations]
        PG5[Swarm Groups]
        PG6[Scheduled Tasks]
    end
    
    subgraph "S3 Storage"
        S31[File Uploads]
        S32[Function Artifacts]
        S33[Backups]
    end
    
    subgraph "File System"
        FS1[Agent Workspaces]
        FS2[Group Directories]
        FS3[IPC Files]
    end
    
    subgraph "Vector Store"
        VEC1[pgvector Tables]
        VEC2[Embeddings]
        VEC3[Similarity Search]
    end
    
    PG --> PG1
    PG --> PG2
    PG --> PG3
    PG --> PG4
    PG --> PG5
    PG --> PG6
    
    S3 --> S31
    S3 --> S32
    S3 --> S33
    
    FS --> FS1
    FS --> FS2
    FS --> FS3
    
    VEC --> VEC1
    VEC --> VEC2
    VEC --> VEC3
```

---

## 🚀 Deployment Architecture

### Local Development

```mermaid
graph TB
    subgraph "Host Machine"
        DOCKER[Docker Engine]
    end
    
    subgraph "Docker Network"
        NET[praxis-network]
    end
    
    subgraph "Containers"
        PG[praxis-postgres]
        PST[praxis-postgrest]
        IFG[praxis-insforge]
        AZ[praxis-agent-carbon]
        SW[praxis-swarm]
        DN[praxis-deno]
        VC[praxis-vector]
    end
    
    DOCKER --> NET
    
    NET --> PG
    NET --> PST
    NET --> IFG
    NET --> AZ
    NET --> SW
    NET --> DN
    NET --> VC
```

### Production Deployment (Railway)

```mermaid
graph TB
    subgraph "Railway Platform"
        subgraph "Services"
            PG_R[(PostgreSQL)]
            IFG_R[InsForge]
            AZ_R[Agent Zero]
            SW_R[Swarm]
        end
        
        subgraph "External Services"
            S3_R[S3/MinIO]
            LLM[LLM Providers]
        end
    end
    
    subgraph "Internet"
        WEB[Web Users]
        CHAT[Chat Apps]
    end
    
    WEB --> IFG_R
    CHAT --> SW_R
    
    IFG_R --> PG_R
    AZ_R --> PG_R
    SW_R --> PG_R
    
    IFG_R --> S3_R
    AZ_R --> LLM
    SW_R --> LLM
```

---

## 🔄 State Management Architecture

```mermaid
graph LR
    subgraph "State Sources"
        UI[UI State]
        AG[Agent State]
        SW[Swarm State]
        DB[Database State]
    end
    
    subgraph "State Managers"
        UIM[UI Store]
        AGM[Agent Memory]
        SWM[Swarm IPC]
        DBM[PostgreSQL]
    end
    
    subgraph "State Sinks"
        VIEWS[Views]
        LOGS[Logs]
        CACHE[Cache]
        BACKUP[Backup]
    end
    
    UI --> UIM
    AG --> AGM
    SW --> SWM
    DB --> DBM
    
    UIM --> VIEWS
    AGM --> LOGS
    SWM --> CACHE
    DBM --> BACKUP
```

---

## 🧪 Testing Architecture

```mermaid
graph TB
    subgraph "Test Layers"
        UNIT[Unit Tests]
        INT[Integration Tests]
        E2E[End-to-End Tests]
        PERF[Performance Tests]
    end
    
    subgraph "Unit Tests"
        UT1[Agent Logic]
        UT2[Tool Functions]
        UT3[Helper Functions]
    end
    
    subgraph "Integration Tests"
        IT1[API Endpoints]
        IT2[Database Operations]
        IT3[Cross-System]
    end
    
    subgraph "E2E Tests"
        ET1[User Workflows]
        ET2[Agent Tasks]
        ET3[Channel Messages]
    end
    
    subgraph "Performance Tests"
        PT1[Load Testing]
        PT2[Stress Testing]
        PT3[Benchmarking]
    end
    
    UNIT --> UT1
    UNIT --> UT2
    UNIT --> UT3
    
    INT --> IT1
    INT --> IT2
    INT --> IT3
    
    E2E --> ET1
    E2E --> ET2
    E2E --> ET3
    
    PERF --> PT1
    PERF --> PT2
    PERF --> PT3
```

---

## 📈 Monitoring & Observability Architecture

```mermaid
graph TB
    subgraph "Monitoring Stack"
        LOGS[Log Collection]
        METRICS[Metrics Collection]
        TRACES[Trace Collection]
    end
    
    subgraph "Data Sources"
        DS1[Application Logs]
        DS2[Container Logs]
        DS3[Database Logs]
        DS4[System Metrics]
    end
    
    subgraph "Processing"
        VEC[Vector]
        PROM[Prometheus]
        JAEGER[Jaeger]
    end
    
    subgraph "Visualization"
        GRAF[Grafana]
        DASH[Custom Dashboards]
        ALERT[Alerting]
    end
    
    DS1 --> LOGS
    DS2 --> LOGS
    DS3 --> LOGS
    DS4 --> METRICS
    
    LOGS --> VEC
    METRICS --> PROM
    TRACES --> JAEGER
    
    VEC --> GRAF
    PROM --> GRAF
    JAEGER --> DASH
    
    GRAF --> ALERT
```

---

## 🎯 Component Interaction Matrix

| Component | InsForge | Agent Zero | Swarm | PostgreSQL | S3 |
|-----------|----------|------------|-------|------------|-----|
| **InsForge** | ✅ | API, Auth, DB | API, Auth, DB | Read/Write | Read/Write |
| **Agent Zero** | API, Auth | ✅ | Delegation | Read/Write | Read/Write |
| **Swarm** | API, Auth | Container Spawn | ✅ | Read/Write | Read/Write |
| **PostgreSQL** | Persistence | Persistence | Persistence | ✅ | N/A |
| **S3** | File Storage | File Storage | File Storage | N/A | ✅ |

---

## 🔄 Communication Protocols

```mermaid
graph TB
    subgraph "Protocols"
        HTTP[HTTP/REST]
        WS[WebSocket]
        IPC[IPC Files]
        SQL[SQL Queries]
    end
    
    subgraph "HTTP Usage"
        H1[PostgREST API]
        H2[InsForge API]
        H3[External APIs]
    end
    
    subgraph "WebSocket Usage"
        W1[Real-time Updates]
        W2[Agent Streaming]
        W3[Live Monitoring]
    end
    
    subgraph "IPC Usage"
        I1[Swarm Coordination]
        I2[Scheduled Tasks]
        I3[Status Updates]
    end
    
    subgraph "SQL Usage"
        S1[Data Persistence]
        S2[Vector Search]
        S3[Transactions]
    end
    
    HTTP --> H1
    HTTP --> H2
    HTTP --> H3
    
    WS --> W1
    WS --> W2
    WS --> W3
    
    IPC --> I1
    IPC --> I2
    IPC --> I3
    
    SQL --> S1
    SQL --> S2
    SQL --> S3
```

---

## 🎨 UI/UX Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web UI]
        MOBILE[Mobile Apps]
        CLI[CLI Interface]
    end
    
    subgraph "Web UI Components"
        DASH[Dashboard]
        CHAT[Chat Interface]
        SETTINGS[Settings]
        MONITOR[Monitoring]
    end
    
    subgraph "State Management"
        STORE[Redux Store]
        CACHE[Local Cache]
        SYNC[Real-time Sync]
    end
    
    subgraph "API Communication"
        REST[REST API]
        WS_C[WebSocket Client]
        GRAPH[GraphQL Optional]
    end
    
    WEB --> DASH
    WEB --> CHAT
    WEB --> SETTINGS
    WEB --> MONITOR
    
    DASH --> STORE
    CHAT --> STORE
    SETTINGS --> STORE
    MONITOR --> STORE
    
    STORE --> REST
    STORE --> WS_C
    STORE --> GRAPH
```

---

<div align="center">
  <p>Architecture is not just about components</p>
  <p>It's about how they work together to create something greater</p>
  <p><strong>The Praxis Agent Carbon Platform</strong></p>
</div>
