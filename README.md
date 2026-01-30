# Religious Notifications API

A NestJS-based backend API for a multi-faith spiritual platform that provides subscription management, real-time group chat, content delivery (prayers, devotionals, courses, quizzes), and webhook-based user onboarding through third-party SMS gateway integrations.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Key Features](#key-features)
- [Architecture Highlights](#architecture-highlights)
- [User Onboarding Flow](#user-onboarding-flow)
- [Real-time Chat System](#real-time-chat-system)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Database Seeding](#database-seeding)

## 🎯 System Overview

The Religious Notifications API is a comprehensive backend system that manages subscription-based access to multi-faith spiritual content. The system is designed around an event-driven architecture that processes webhook notifications from two primary SMS gateway providers (ICell and SecureD) to handle user subscriptions, renewals, and cancellations.

## ✨ Key Features

### 1. **Webhook-Based User Onboarding**
- Automated user provisioning through SMS gateway webhooks
- Real-time subscription lifecycle management (activation, renewal, cancellation)
- Marketer attribution tracking and conversion postbacks
- Duplicate processing prevention with idempotency

### 2. **Real-time Group Chat**
- WebSocket-based group messaging with Socket.IO
- Redis-backed session management for horizontal scaling
- Typing indicators and presence awareness
- Message persistence with attachment support

### 3. **Multi-Religion Content Management**
- Daily prayers, scriptures, and devotionals
- E-learning courses with video content
- Music library with tracks and albums
- Daily quizzes with automated grading
- Mindfulness resources and journals

### 4. **Queue-Based Processing**
- Asynchronous job processing with BullMQ
- Retry mechanisms for failed operations
- Traffic monitoring and analytics

## 🏗️ Architecture Highlights

### Event-Driven Processing

The system uses a **queue-based architecture** to handle webhook notifications asynchronously:

```
Webhook → Controller → Queue → Processor → Service → Events → Orchestrator
```

#### Core Queues:
- **ICELL Queue**: Processes SMS and Datasync notifications
- **SECURE_D Queue**: Processes subscription notifications with marketer attribution
- **SECURE_D_RETRY Queue**: Handles delayed attribution matching
- **SUBSCRIPTION_SCHEDULED_JOBS**: Manages subscription expirations
- **QUIZ_JOBS**: Automated quiz grading and rewards

### Database Architecture

Built on **PostgreSQL with Prisma ORM**, featuring:
- Complex relationships between subscriptions, users, and content
- Audit trails for all subscription operations
- Efficient indexing for high-volume webhook processing
- Transaction-based updates for data consistency

### WebSocket Architecture

Real-time features powered by **Socket.IO with Redis Adapter**:
- Horizontal scaling across multiple server instances
- Room-based message broadcasting for group chats
- Redis-backed session storage for connection management
- Automatic reconnection handling

## 🚀 User Onboarding Flow

### ICell Webhook Processing

ICell serves as the **primary notification source** for subscription operations:

1. **Webhook Reception** (`POST /icell/datasync/notification`)
   - Receives datasync notifications with `sequenceNo`, `callingParty` (MSISDN), and `operationId`
   - Operations mapped to: SUBSCRIPTION (SN, ES), RENEWAL (YC, YR), UNSUBSCRIPTION (YU, ER, YD)

2. **Queue Processing**
   - Job added to ICELL queue for async processing
   - Prevents blocking the webhook response

3. **Datasync Handling**
   - Persists `IcellDatasync` record
   - Emits subscription events based on operation type
   - Checks for duplicate processing via `sequenceNo`

4. **Subscription Orchestration**
   - Creates/updates user subscription records
   - Manages subscription status and expiration dates
   - Triggers wallet transactions for payments
   - Creates audit records for tracking

5. **Audit Record Creation**
   - Links to IcellDatasync (required)
   - Links to SecureD data (optional, if available)
   - Links to Marketer (optional, for attribution)
   - Calculates business intelligence flags (acquired, converted, churned)

### SecureD Webhook Processing

SecureD provides **marketer attribution data** for conversion tracking:

1. **Webhook Reception** (`POST /secure-d/notification`)
   - Receives notifications with `trxId` (correlates with ICell `sequenceNo`)
   - Contains `msisdn`, `productId`, and conversion status

2. **Storage Only**
   - Creates `SecureDDataSync` record
   - No immediate processing (waits for ICell notification)

3. **Attribution Matching**
   - When ICell notification processed, system looks for matching SecureD data by `trxId`/`sequenceNo`
   - If found: immediate attribution linkage
   - If not found: SecureD retry job queued (5-second delay, 3 attempts)

4. **Retry Mechanism**
   - Handles out-of-order webhook arrivals
   - Updates audit records with marketer attribution when SecureD data arrives
   - Triggers conversion postbacks to marketer URLs

### Order-Independent Processing

The system handles **any arrival order** of webhooks:

**Scenario A: ICell arrives first**
```
ICell → Audit Record Created → SecureD Retry Queued → SecureD Arrives → Retry Updates Attribution
```

**Scenario B: SecureD arrives first**
```
SecureD → Stored → ICell Arrives → Audit Record Created with Full Attribution
```

## 💬 Real-time Chat System

### WebSocket Gateway

The `ChatGateway` manages all real-time interactions:

```typescript
@WebSocketGateway({
  cors: { origin: '*', credentials: true }
})
```

### Connection Management

- **Session Storage**: Redis-backed with 10-minute TTL
- **Authentication**: Sessions validated via middleware
- **Connection Events**: Connected/disconnected events emitted

### Group Chat Features

1. **Join Group** (`ClientEvents.JOIN_GROUP`)
   - Validates group membership
   - Joins Socket.IO room (format: `group:{groupId}`)
   - Broadcasts join notification to room

2. **Typing Indicators** (`ClientEvents.START_TYPING`)
   - Real-time typing status broadcast to group
   - No persistence (ephemeral events)

3. **Message Broadcasting** (`InternalEvents.MESSAGE.CREATED`)
   - Messages created via HTTP API trigger events
   - WebSocket broadcasts to all group members
   - Includes sender info and attachments

### Horizontal Scaling

Redis adapter enables **multi-instance deployment**:
- Messages broadcast across all server instances
- Shared session state via Redis
- Load balancing support

## 🛠️ Technical Stack

### Core Framework
- **NestJS** - Modular, scalable Node.js framework
- **TypeScript** - Type-safe development
- **Express** - HTTP server

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM with migrations
- **Redis** - Caching and session storage

### Real-time & Queuing
- **Socket.IO** - WebSocket server
- **BullMQ** - Redis-based queue management
- **@nestjs/event-emitter** - Internal event system

### Authentication & Security
- **Google OAuth** - Third-party authentication
- **bcrypt** - Password hashing
- **express-session** - Session management

### API & Documentation
- **Swagger/OpenAPI** - API documentation
- **class-validator** - DTO validation
- **class-transformer** - Data serialization

### Cloud Services
- **AWS S3** - File storage
- **Nodemailer** - Email delivery

## 📦 Installation

```bash
yarn install
```

## 🚀 Running the App

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Database Seeding

To properly seed the database, execute the following commands in the specified order to ensure foreign key relationships are maintained:

```bash
Note: Ensure migrations are applied first
$ yarn migrate:deploy
$ yarn schema:generate


# Run all seeders
$ yarn seed:all
```

When using Docker compose, you can run the seeders with the following command:

```bash
docker compose -f <filename.yml> run --rm nestjs-app yarn migrate:deploy

docker compose -f <filename.yml> run --rm nestjs-app yarn schema:generate

docker compose -f <filename.yml> run --rm nestjs-app yarn seed:all
```

### Expected result of seeding

![image](https://i.ibb.co/TB8bqfp/seed-result.png)

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

### Development with Docker Tip

**To Debug build logs, you can redirect the build logs to a file like so:**

```bash
docker compose build &> build.log
```

### Commit Message Format

We use husky and commitlint to enforce sensible commit message format.

```bash
git commit -m "feat(course): add new course"
```
