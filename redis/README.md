# 🚀 Redis & System Design Backend Architecture

A comprehensive hands-on implementation demonstrating key backend engineering patterns and performance optimizations using **Redis**, **Node.js (Express)**, **MongoDB (Mongoose)**, and **BullMQ**, containerized with **Docker**.

This repository explores critical system design concepts including **Caching Strategies & Cache Invalidation**, **Temporary State & OTP Management (with TTL)**, **Distributed Rate Limiting Middleware**, and **Asynchronous Message Queuing with Background Workers**.

---

## 🛠 Tech Stack & Tools

- **Runtime & Server Framework:** Node.js (ES Modules), Express.js (v5)
- **Database (Primary Persistence):** MongoDB (via Mongoose v9)
- **In-Memory Store & Cache:** Redis (via `ioredis` v5)
- **Asynchronous Task Queue:** BullMQ (v5)
- **Containerization:** Docker & Docker Compose
- **Development Tools:** Nodemon, Dotenv

---

## 📂 Repository Structure

```text
redis/
├── docker-compose.yml        # Service orchestration for containerized Redis instance
├── README.md                 # Project documentation & architectural breakdown
└── Backend-1/                # Core Node.js / Express backend workspace
    ├── .env                  # Environment variables (PORT, MONGO_URI, REDIS_URL)
    ├── package.json          # Dependency specifications and launch scripts
    ├── server.js             # Main Express server and route handlers
    ├── queue.js              # BullMQ queue configuration linked to Redis
    ├── worker.js             # Standalone background worker process for job execution
    ├── config/
    │   ├── db.js             # MongoDB connection configuration via Mongoose
    │   └── sendEmail.js      # Simulated email service with artificial latency (5s)
    ├── middleware/
    │   └── rateLimter.js     # Custom IP-based Redis rate-limiting middleware
    └── model/
        └── user.model.js     # Mongoose schema definition for User entities
```

---

## 💡 Key Architectural Concepts & Implementations

### 1. High-Performance Caching & Cache Invalidation Strategies
#### **Cache-Aside / Read-Through Pattern (`GET /redis-get`)**
- **Problem:** Directly querying MongoDB for user records (`GET /get`) takes **~67ms** execution time per request.
- **Solution:** A Redis caching layer is implemented under the key `user:all`.
- **Workflow:**
  1. Checks Redis cache using `redis.get("user:all")`.
  2. **Cache Hit (~8ms):** Parses and returns cached JSON immediately without touching MongoDB.
  3. **Cache Miss (~67ms):** Queries MongoDB, serializes result into string format (`JSON.stringify(user)`), stores in Redis, and responds.
- **Benchmark Result:** **~8x latency reduction** (decreased from ~67ms to ~8ms).

#### **Cache Invalidation (`POST /redis-create`)**
- **Problem:** Database mutations cause cached data to become stale.
- **Solution:** Deletes cached key `user:all` via `redis.del("user:all")` immediately upon creating a new user record in MongoDB, guaranteeing cache coherence on subsequent read requests.

---

### 2. Temporary State & Expiring Data (OTP System)
#### **OTP Generation with Expiry (`POST /redis-otp`)**
- Generates a random 6-digit numerical string (`100000` to `999999`).
- Stores the OTP in Redis using key `opt: <email>` with a **Time-To-Live (TTL)** set to 300 seconds (5 minutes) via `redis.set(key, otp, "EX", 300)`.

#### **OTP Verification (`POST /verify-otp`)**
- Queries Redis for key `opt: <email>`.
- If missing/expired, returns `"otp not found"`.
- If present, verifies match and returns `"correct otp"` or `"incorrect otp"`.

---

### 3. Custom Distributed Rate Limiting Middleware
- **File:** [`Backend-1/middleware/rateLimter.js`](file:///c:/Users/263237/Desktop/system-design/redis/Backend-1/middleware/rateLimter.js)
- **Algorithm:** Atomic Counter with TTL window.
- **Implementation:**
  1. Captures client IP (`req.ip`) and constructs Redis key `rateLimit: <ip>`.
  2. Atomically increments counter using `redis.incr(key)`.
  3. On initial request (`request === 1`), initializes a 60-second window using `redis.expire(key, 60)`.
  4. Checks remaining TTL using `redis.ttl(key)`.
  5. Enforces limit of **5 requests per minute**. If exceeded, rejects with **HTTP 429 (Too Many Requests)** and includes `retryIn` TTL in the JSON payload.

---

### 4. Asynchronous Task Queues & Workers (BullMQ)
- **Problem:** Executing synchronous operations like email sending (`POST /create` + [`sendEmail.js`](file:///c:/Users/263237/Desktop/system-design/redis/Backend-1/config/sendEmail.js)) blocks the main server thread for ~5 seconds.
- **Solution:** Decouple time-heavy processing using Redis queues and dedicated worker threads.

#### **Queue Configuration ([`Backend-1/queue.js`](file:///c:/Users/263237/Desktop/system-design/redis/Backend-1/queue.js))**
- Instantiates BullMQ `Queue` named `"emailQueue"` bound to Redis with `maxRetriesPerRequest: null`.

#### **Job Dispatcher (`POST /queue-create` in [`server.js`](file:///c:/Users/263237/Desktop/system-design/redis/Backend-1/server.js))**
- Creates user in MongoDB and pushes job payload `{ email }` to queue using `emailQueue.add("sendEmail", { email })`.
- Immediately responds to HTTP client without waiting for task completion.

#### **Job Consumer / Worker ([`Backend-1/worker.js`](file:///c:/Users/263237/Desktop/system-design/redis/Backend-1/worker.js))**
- Runs as an independent process listening on `"emailQueue"`.
- Picks up background jobs asynchronously and executes `sendEmail(job.data.email)`.

---

## 📡 API Endpoint Reference

| Method | Route | Description | Pattern / Feature Implemented |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check endpoint | Direct server response |
| `GET` | `/get` | Fetch all users directly from database | MongoDB query with IP Rate Limiter (5 req/min) |
| `GET` | `/redis-get` | Fetch all users with Redis caching | Cache-Aside strategy (~8ms latency) |
| `POST` | `/create` | Create user with synchronous email trigger | Direct DB insert + 5s blocking delay |
| `POST` | `/redis-create` | Create user & invalidate cached data | Cache Invalidation (`DEL user:all`) |
| `POST` | `/queue-create` | Create user & push job to queue | Non-blocking BullMQ async job dispatch |
| `POST` | `/redis-otp` | Generate & store 6-digit OTP | Redis TTL expiration (`EX 300` / 5 mins) |
| `POST` | `/verify-otp` | Verify user-submitted OTP | Temporary key-value lookup |

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Docker Desktop** installed and running
- **MongoDB** instance (Local or MongoDB Atlas cluster URI)

### 2. Spin Up Redis Container
From the root directory (`redis/`), start the Redis container via Docker Compose:
```bash
docker-compose up -d
```
*Redis will start running on `localhost:6379`.*

### 3. Environment Setup
Navigate to `Backend-1` directory and ensure your `.env` file is properly configured:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
```

### 4. Install Dependencies
```bash
cd Backend-1
npm install
```

### 5. Run Server & Worker

- **Option A: Start Main API Server**
  ```bash
  npm run dev
  ```
  *Runs the Express server on port 3000.*

- **Option B: Start Background Queue Worker**
  In a separate terminal window:
  ```bash
  node worker.js
  ```
  *Processes enqueued BullMQ email jobs in the background.*
