# 🚀 Advanced Backend System Design & Distributed Systems

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-black.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Redis](https://img.shields.io/badge/Redis-6.x+-red.svg)](https://redis.io/)
[![NGINX](https://img.shields.io/badge/NGINX-Load_Balancer-009639.svg)](https://nginx.org/)
[![LangChain](https://img.shields.io/badge/LangChain-LangGraph-darkblue.svg)](https://www.langchain.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg)](https://www.mongodb.com/)

A production-grade collection of system design patterns, distributed architecture implementations, microservices orchestration, high-performance Redis caching strategies, and stateful AI agent integrations built with Node.js, Docker, NGINX, BullMQ, and LangGraph.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Repository Architecture](#-repository-architecture)
- [Modules Breakdown](#-modules-breakdown)
  - [1. Systems & Distributed Architecture (`/systems`)](#1-systems--distributed-architecture-systems)
  - [2. Docker Containerization & Orchestration (`/docker`)](#2-docker-containerization--orchestration-docker)
  - [3. Redis Performance & Queue Systems (`/redis`)](#3-redis-performance--queue-systems-redis)
  - [4. AI & Stateful Agent Systems (`/ai-integration`)](#4-ai--stateful-agent-systems-ai-integration)
  - [5. RAG Module (`/rag`)](#5-rag-module-rag)
- [Port Mapping Reference](#-port-mapping-reference)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)

---

## 📌 Overview

This repository demonstrates practical implementations of modern backend engineering paradigms, progressing from basic containerized monoliths to horizontally scalable microservices with reverse proxies, asynchronous message queues, distributed caching, and agentic AI workflows.

### Key Highlights
- **High Availability & Load Balancing**: NGINX round-robin traffic distribution across multiple horizontally scaled application instances and API Gateways.
- **Microservices Architecture**: Decoupled service design with centralized API proxy routing (`Auth`, `Order`, `Product` services).
- **Asynchronous Task Processing**: Event-driven queue processing using **BullMQ** and **Redis** for heavy or non-blocking tasks like email notifications.
- **In-Memory Caching & Rate Limiting**: Latency reduction from 67ms to 8ms with Redis caching, TTL-backed OTP verification, and rate limiting middleware.
- **Stateful AI Agents**: Multi-step graph-based AI agent execution built with **LangGraph**, **Google Gemini**, **Groq**, and **Tavily Web Search**.

---

## 🏗️ Repository Architecture

```directory
system-design/
├── 📁 systems/                 # Scalable Distributed Architecture Projects
│   ├── 📁 phase1/              # Monolith Load Balancing & Async Queues (NGINX + Server Replicas + Redis + BullMQ)
│   ├── 📁 phase2/              # Microservices & Horizontally Scaled API Gateways (NGINX + Gateways + Services)
│   └── 📄 port.txt             # Service Port Mapping Cheat Sheet
│
├── 📁 docker/                  # Containerization Labs
│   ├── 📁 phase1/              # Single Container Dockerization (Node.js + Express + MongoDB)
│   └── 📁 phase2/              # Multi-Container Compose Setup (Backend + Frontend + Redis)
│
├── 📁 redis/                   # Caching & Queue Optimization
│   └── 📁 Backend-1/           # Caching (Cache invalidation), TTL OTPs, Rate Limiting, BullMQ Producer/Worker
│
├── 📁 ai-integration/          # AI & Autonomous Agents
│   ├── 📁 LLM calling/         # Multi-provider LLM integrations (Google Gemini, Groq/LLaMA)
│   └── 📁 langgraph/           # Stateful Agent Workflows (LangGraph StateGraph + Tavily Search + MemorySaver)
│
└── 📁 rag/                     # Vector Embeddings & RAG Framework (Reserved)
```

---

## 🔍 Modules Breakdown

### 1. Systems & Distributed Architecture (`/systems`)

#### 🔹 Phase 1: Load Balancing & Asynchronous Queue Processing
- **NGINX Reverse Proxy**: Listens on port `3000` (mapped to port 80) and distributes requests evenly across 3 server replicas (`server1:3000`, `server2:3000`, `server3:3000`).
- **Asynchronous Worker Pattern**: Uses `BullMQ` + `Redis` to queue background jobs (e.g. sending transactional emails) without blocking HTTP request threads.
- **Rate Limiting**: Integrated `express-rate-limit` backed by Redis to prevent abuse across load-balanced instances.

#### 🔹 Phase 2: Microservices & Gateway Horizontal Scaling
- **Microservices Layer**:
  - `Auth Service` (`:3000`)
  - `Order Service` (`:3001`)
  - `Product Service` (`:3002`)
- **API Gateway Layer**: Horizontally scaled API Gateways (`gateway1:8001`, `gateway2:8002`, `gateway3:8003`) powered by `express-http-proxy` routing client paths (`/auth`, `/order`, `/product`).
- **NGINX Frontend Load Balancer**: Listens on port `8000` (mapped to internal container port 80) balancing incoming traffic across all API Gateway replicas.

---

### 2. Docker Containerization & Orchestration (`/docker`)

- **Phase 1 (Single Container)**: Custom Dockerfile setup with `WORKDIR`, package management layer caching, environment file handling (`.env`), `.dockerignore`, and process entrypoints.
- **Phase 2 (Multi-Container Orchestration)**: Full stack multi-container infrastructure defined in `docker-compose.yml`:
  - **Backend**: Express service running on port `:3000`
  - **Frontend**: Vite + React single-page application exposed on port `:5173`
  - **Database/Cache**: Standalone Redis container on port `:6379`

---

### 3. Redis Performance & Queue Systems (`/redis`)

High-performance data management patterns implemented in `redis/Backend-1`:

- **In-Memory Caching**: Cache-aside strategy (`redis-get` & `redis-create`) with automatic cache invalidation (`redis.del("user:all")`).
  - **DB Query Latency**: `~67ms`
  - **Redis Cache Latency**: `~8ms` (~88% speedup)
- **Temporary Secret TTL Expiration**: `redis-otp` leveraging Redis TTL key expiration (`EX 300` seconds / 5 mins) for auto-expiring passcodes.
- **Rate Limiting**: Sliding/Fixed window request throttling (`rateLimter.js`).
- **Decoupled Job Queues**: `BullMQ` producer (`emailQueue.add`) sending tasks to background worker processes (`worker.js`).

---

### 4. AI & Stateful Agent Systems (`/ai-integration`)

#### 🔹 LLM Calling (`ai-integration/LLM calling`)
- Multi-model API integration supporting `@google/genai` (Gemini 3.5/3.6 Flash) and `@langchain/groq` for ultra-fast response generation.

#### 🔹 LangGraph Stateful AI Agents (`ai-integration/langgraph`)
- **Graph Architecture**: Built using `@langchain/langgraph` with custom `StateGraph` and standard `MessagesAnnotation`.
- **Tool Integration**: Autonomous tool-calling with `TavilySearch` for real-time web search.
- **Agentic Routing**: Dynamic conditional edges (`shouldContinue`) routing execution back to LLM nodes after tool responses.
- **Conversation State Persistence**: In-memory state checkpointing with `MemorySaver` supporting isolated user threads (`thread_id`).

---

### 5. RAG Module (`/rag`)
- Reserved workspace for Retrieval-Augmented Generation workflows (Vector databases, document chunking, embeddings, and context-retrieval pipelines).

---

## 🔌 Port Mapping Reference

Referenced from [`systems/port.txt`](file:///c:/Users/263237/Desktop/system-design/systems/port.txt):

| Component / Service | Internal Port | Host / Exposed Port | Description |
| :--- | :---: | :---: | :--- |
| **NGINX Load Balancer (Phase 1)** | `80` | `3000` | Round-robin load balancer for Phase 1 servers |
| **Server Replicas (Phase 1)** | `3000` | `3001`, `3002`, `3003` | Backend server replicas (`server1`, `server2`, `server3`) |
| **NGINX Load Balancer (Phase 2)** | `80` | `8000` | Gateway Load Balancer |
| **API Gateways (Phase 2)** | `8000` | `8001`, `8002`, `8003` | Horizontally scaled Gateway instances (`gateway1..3`) |
| **Auth Microservice** | `3000` | `3000` | Authentication & User identity service |
| **Order Microservice** | `3001` | `3001` | Order processing service |
| **Product Microservice** | `3002` | `3002` | Catalog & product management service |
| **Redis Server** | `6379` | `6379` | In-memory cache & BullMQ task broker |
| **Vite Frontend App** | `5173` | `5173` | React Client Application |

---

## 🛠️ Tech Stack

- **Languages & Runtimes**: Node.js (ES Modules), JavaScript (ES6+), React 18
- **Frameworks & Libraries**: Express.js, Vite, Mongoose, ioredis, express-http-proxy, express-rate-limit
- **Orchestration & DevOps**: Docker, Docker Compose, NGINX
- **Databases & Messaging**: MongoDB, Redis, BullMQ
- **AI & ML Integration**: LangChain, LangGraph, Google Gemini API, Groq, Tavily AI Search

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker & Docker Compose](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
- [Redis](https://redis.io/)

### Running Systems Phase 2 (Microservices + NGINX)
```bash
cd systems/phase2
docker-compose up --build
```
Access the entry point at `http://localhost:8000` (routed via NGINX -> API Gateways -> Microservices).

### Running Docker Phase 2 (Full Stack App)
```bash
cd docker/phase2
docker-compose up --build
```
Access the Frontend at `http://localhost:5173` and Backend at `http://localhost:3000`.

### Running LangGraph AI Agent
```bash
cd ai-integration/langgraph
npm install
# Set GEMINI_API_KEY and TAVILY_API_KEY in .env
npm start
```

---

*Maintained as part of the **advance-backend** system design series.*
