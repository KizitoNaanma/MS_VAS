# Religious Notifications API - Processing Flow Analysis

## Overview

This document provides a comprehensive analysis of the notification processing flows in the Religious Notifications API, specifically focusing on SecureD notifications and Icell Datasync notifications, their relationships with the Marketer model, and how processing handles different arrival orders.

---

## Model Relationships

### Core Models and Their Relationships

#### 1. **SubscriptionAuditRecord** (Central Hub)

The `SubscriptionAuditRecord` model serves as the central auditing and tracking mechanism that connects SecureD notifications, Icell datasync notifications, and marketer attribution.

**Key Relationships:**

```prisma
model SubscriptionAuditRecord {
  id String @id @default(uuid())

  // Links to Icell Datasync (REQUIRED - One-to-One)
  icellDataSync   IcellDatasync @relation(fields: [icellDataSyncId], references: [id])
  icellDataSyncId Int           @unique

  // Links to SecureD Data (OPTIONAL - Many-to-One)
  securedDataSync   SecureDDataSync? @relation(fields: [securedDataSyncId], references: [id])
  securedDataSyncId Int?

  // Links to Marketer (OPTIONAL - Many-to-One)
  marketer   Marketer? @relation(fields: [marketerId], references: [id])
  marketerId String?

  // Business Intelligence Flags
  acquired  Boolean @default(false)  // New customer acquisition via marketer
  churned   Boolean @default(false)  // Customer unsubscription
  converted Boolean @default(false)  // SecureD conversion success
}
```

#### 2. **IcellDatasync** (Primary Notification Source)

Stores all Icell datasync notifications and serves as the primary trigger for subscription processing.

**Key Properties:**

- **`sequenceNo`**: Unique identifier that correlates with SecureD `trxId`
- **`callingParty`**: Phone number (MSISDN)
- **`operationId`**: Maps to subscription operation types (SN, ES, YU, etc.)
- **`bearerId`**: Identifies the source channel (including "SecureD")
- **`processed`**: Flag to prevent duplicate processing

#### 3. **SecureDDataSync** (Marketing Attribution Source)

Stores SecureD notifications that provide marketer attribution data.

**Key Properties:**

- **`trxId`**: Correlates with Icell `sequenceNo`
- **`msisdn`**: Phone number matching Icell `callingParty`
- **`productId`**: Product identifier
- **`activation`**: Success indicator ("1" = success)
- **`description`**: Status description ("success" indicates conversion)

#### 4. **Marketer** (Attribution Entity)

Represents marketing partners and their attribution information.

**Key Properties:**

- **`prefix`**: Used for marketer identification from SecureD data
- **`postbackUrl`**: For conversion notifications
- **`isActive`**: Status flag

### Relationship Flow

```
IcellDatasync (1) ←→ (1) SubscriptionAuditRecord (1) ←→ (0..1) SecureDDataSync
                                     ↓ (0..1)
                                  Marketer
```

---

## SecureD Notification Processing Flow

### 1. **API Request Reception**

```typescript
// Controller: secure-d.controller.ts
@Post('notification')
async notification(@Body() request: SecureDNotificationRequestDto)
```

**Steps:**

1. **Traffic Tracking**: Records hit metrics in production
2. **Logging**: Logs notification details (non-dev environments)
3. **Queue Addition**: Adds job to `SECURE_D` queue

### 2. **Queue Processing**

```typescript
// Processor: secure-d.processor.ts
@Processor(QUEUES.SECURE_D)
async process(job: Job<{ payload: SecureDNotificationRequestDto }>)
```

**Steps:**

1. **Job Validation**: Validates job name and payload
2. **Service Delegation**: Calls `SecureDService.processNotification()`

### 3. **Data Persistence**

```typescript
// Service: secure-d.service.ts
async processNotification(request: SecureDNotificationRequestDto)
```

**Processing Logic:**

1. **Conversion Calculation**:

   ```typescript
   const converted =
     request.activation === '1' &&
     request.description.toLowerCase() === 'success';
   ```

2. **Data Storage**: Creates `SecureDDataSync` record
3. **Logging**: Records processing completion

**Important Note**: SecureD notifications are **stored only** - they do not trigger immediate subscription processing or audit record creation.

---

## Icell Datasync Notification Processing Flow

### 1. **API Request Reception**

```typescript
// Controller: icell.controller.ts
@Post('datasync/notification')
async datasyncNotification(@Body() request: IcellDatasyncRequestDto)
```

**Steps:**

1. **Traffic Tracking**: Records datasync hits in production
2. **Logging**: Logs notification details (non-dev environments)
3. **Queue Addition**: Adds job to `ICELL` queue

### 2. **Queue Processing**

```typescript
// Processor: icell.processor.ts
async process(job: Job<IcellProcessorJobData>)
```

**Routing Logic:**

- `PROCESS_DATASYNC_REQUEST` → `IcellService.processDatasyncNotification()`
- `PROCESS_SMS_REQUEST` → `IcellService.processSmsRequest()`

### 3. **Datasync Handler Processing**

```typescript
// Handler: icell-datasync.handler.ts
async processDatasyncNotification(request: IcellDatasyncRequestDto)
```

**Steps:**

1. **Data Persistence**: Creates `IcellDatasync` record
2. **Operation Type Determination**: Maps `operationId` to `OperationType`

   ```typescript
   // From ICELL_OPERATIONS constant
   SN, ES → SUBSCRIPTION
   YC, YR, RR, GR, SR → RENEWAL
   YU, ER, YD, PCI, ACI, etc. → UNSUBSCRIPTION
   ```

3. **Event Emission**: Emits appropriate subscription events

### 4. **Subscription Orchestration**

```typescript
// Orchestrator: subscription.orchestrator.ts
@OnEvent('subscription.process|renewal|unsubscription|audit')
```

**Event Handling:**

- **`subscription.process`**: New subscriptions
- **`subscription.renewal`**: Subscription renewals
- **`subscription.unsubscription`**: Cancellations
- **`subscription.audit`**: Unknown operation types

**Processing Sequence:**

1. **Business Logic Processing**: Creates/updates subscription records
2. **Audit Record Creation**: Creates `SubscriptionAuditRecord` with attribution

### 5. **Audit Record Processing**

```typescript
// Processor: subscription-audit.processor.ts
async processSubscriptionEvent(datasync, comment?)
```

**Transaction-Based Processing:**

1. **Context Building**: Determines marketer attribution and business flags
2. **Audit Record Creation**: Links Icell datasync with optional SecureD data
3. **SecureD Retry Queuing**: If SecureD data missing for SecureD requests
4. **Business Intelligence Calculation**: Determines acquisition/churn flags
5. **Postback Processing**: Sends conversion notifications to marketers

---

## Order-Dependent Processing Scenarios

### Scenario 1: Icell Datasync Arrives First (Normal Flow)

**Timeline:**

```
1. Icell Datasync → API → Queue → Processing
2. Audit Record Created (without SecureD attribution)
3. SecureD Retry Job Queued (if bearerId = "SecureD")
4. SecureD Notification → API → Storage
5. Retry Job Executes → Updates Audit Record with Attribution
```

**Detailed Flow:**

#### Step 1-4: Standard Icell Processing

- Icell datasync processed through normal flow
- `SubscriptionAuditRecord` created with:

  ```typescript
  {
    icellDataSyncId: datasyncRecord.id,
    securedDataSyncId: null,        // No SecureD data yet
    marketer: null,                 // No marketer attribution
    comment: "Processing SecureD attribution -"
  }
  ```

#### Step 5: SecureD Retry Mechanism

```typescript
// Queued with 5-second delay, 3 attempts
await this.secureDRetryQueue.add(
  SECURE_D_RETRY_JOBS.PROCESS_SECURE_D_RETRY,
  { payload: retryJobData },
  {
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
    delay: 5000,
  },
);
```

#### Step 6: Retry Processing Success

```typescript
// secure-d-retry.processor.ts
async processWithSecureDAttribution(auditRecordId, secureDData, operationType)
```

**Updates Applied:**

1. **Marketer Resolution**: Determines marketer from SecureD data
2. **Audit Record Update**: Links SecureD data and marketer
3. **Business Intelligence Update**: Recalculates acquisition/churn flags
4. **Postback Processing**: Triggers marketer notifications if converted

### Scenario 2: SecureD Notification Arrives First

**Timeline:**

```
1. SecureD Notification → API → Storage (SecureDDataSync created)
2. Icell Datasync → API → Queue → Processing
3. Audit Processing finds existing SecureD data
4. Audit Record Created with full attribution immediately
```

**Detailed Flow:**

#### Step 1: SecureD Storage

- SecureD notification stored in `SecureDDataSync` table
- No immediate processing or audit record creation

#### Step 2-4: Enhanced Icell Processing

- During audit record creation, system searches for matching SecureD data:

  ```typescript
  const secureDData = await this.findMatchingSecureDNotification(
    datasync.callingParty, // msisdn
    productId, // extracted from requestedPlan
    datasync.sequenceNo, // trxId
  );
  ```

- If SecureD data found, audit record created with full attribution:

  ```typescript
  {
    icellDataSyncId: datasyncRecord.id,
    securedDataSyncId: secureDData.id,    // Linked immediately
    marketer: resolvedMarketer,           // Attributed immediately
    converted: calculateConversion(secureDData),
    comment: "Subscription Processing Complete"
  }
  ```

### Scenario 3: SecureD Data Never Arrives

**Timeline:**

```
1. Icell Datasync → Processing → Audit Record + Retry Queue
2. Retry Attempt 1 (after 5s) → No SecureD data → Retry
3. Retry Attempt 2 (after 10s) → No SecureD data → Retry
4. Retry Attempt 3 (after 15s) → No SecureD data → Final Failure
5. Audit Record Updated with failure comment
```

**Final State:**

```typescript
{
  comment: "SecureD data missing after 3 retries, processing incomplete",
  marketer: null,
  securedDataSyncId: null,
  acquired: false,
  converted: false
}
```

---

## Key Technical Components

### 1. **Context Builder** (`subscription-context.builder.ts`)

**Purpose**: Builds processing context with marketer attribution and business logic

**Key Methods:**

- `buildContext()`: Full context with business intelligence
- `buildContextWithoutBusinessLogic()`: Context for audit record creation
- `findSecureDData()`: Correlates SecureD and Icell data
- `queueSecureDRetry()`: Manages retry job queuing

### 2. **Marketer Attribution Resolver** (`marketer-attribution.resolver.ts`)

**Purpose**: Resolves marketer identity from SecureD data

**Logic**: Uses product prefix or other SecureD fields to identify the responsible marketer

### 3. **Business Logic Processor** (`acquisition-churn.processor.ts`)

**Purpose**: Determines acquisition and churn flags for business intelligence

**Flags:**

- **`acquired`**: New customer acquisition (marketer-driven subscriptions)
- **`churned`**: Customer unsubscription events
- **`converted`**: Successful SecureD conversion events

### 4. **Postback Service** (`postback.service.ts`)

**Purpose**: Sends conversion notifications to marketer endpoints

**Triggered When**:

- SecureD conversion successful (`activation = "1"`, `description = "success"`)
- Marketer attribution resolved
- Postback URL configured

---

## Data Correlation Logic

### Primary Correlation Fields

```typescript
// SecureD ↔ Icell Correlation
secureDData.trxId === icellDatasync.sequenceNo &&
  secureDData.msisdn === icellDatasync.callingParty &&
  secureDData.productId === extractProductId(icellDatasync.requestedPlan);
```

### Product ID Extraction

```typescript
// Handle product IDs with underscores
const productId = datasync.requestedPlan.split('_')[0];
```

### Conversion Calculation

```typescript
const converted =
  secureDData.activation === '1' &&
  secureDData.description.toLowerCase() === 'success';
```

---

## Error Handling and Resilience

### 1. **Retry Mechanisms**

- **SecureD Retry Jobs**: 3 attempts with 5-second fixed backoff
- **Queue-based Processing**: BullMQ provides job persistence and retry
- **Transaction Safety**: Database transactions ensure data consistency

### 2. **Failure Scenarios**

- **SecureD Data Missing**: Graceful degradation with retry mechanism
- **Marketer Not Found**: Processing continues without attribution
- **Processing Errors**: Comprehensive logging and error propagation

### 3. **Data Consistency**

- **Unique Constraints**: Prevent duplicate audit records
- **Transaction Boundaries**: Ensure atomic operations
- **Processed Flags**: Prevent duplicate Icell datasync processing

---

## Business Intelligence and Analytics

### Audit Record Flags

| Flag        | Purpose                    | Calculation Logic                            |
| ----------- | -------------------------- | -------------------------------------------- |
| `acquired`  | New customer via marketer  | First subscription with marketer attribution |
| `churned`   | Customer unsubscription    | Any unsubscription operation                 |
| `converted` | SecureD conversion success | `activation="1"` AND `description="success"` |

### Attribution Chain

```
SecureD Data → Marketer Resolution → Business Logic → Audit Record → Postback
```

### Reporting Capabilities

- **Marketer Performance**: Acquisition and conversion rates
- **Churn Analysis**: Unsubscription patterns and reasons
- **Attribution Accuracy**: SecureD data availability and correlation success

---

## Summary

The Religious Notifications API implements a sophisticated dual-notification processing system that handles both immediate subscription processing (via Icell datasync) and delayed marketer attribution (via SecureD notifications). The system gracefully handles different arrival orders through:

1. **Immediate Processing**: When SecureD data is available during Icell processing
2. **Retry Mechanisms**: When Icell arrives first, with automatic SecureD retry jobs
3. **Graceful Degradation**: Processing continues even without SecureD attribution

The `SubscriptionAuditRecord` model serves as the central hub that connects all notification types, enabling comprehensive business intelligence and marketer attribution while maintaining data consistency and processing reliability.
