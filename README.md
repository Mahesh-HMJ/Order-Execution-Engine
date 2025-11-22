# Order Execution Engine

A production-grade DEX order routing system that processes market orders with intelligent routing between Raydium and Meteora DEXs, featuring real-time WebSocket status updates and concurrent order processing.

---

## 🎯 Design Decisions

### Why Market Orders?

I chose **Market Orders** for this implementation because:

- **Immediate execution** guarantees deterministic behavior, making the system reliable and testable without complex price monitoring infrastructure
- **No price polling complexity** - orders execute at current market price, eliminating the need for background monitoring services or database-driven price watchers
- **Perfect for demonstrating core DEX routing logic** - focuses on the essential price comparison, best route selection, and execution flow without additional state management overhead

### Extension to Other Order Types

**Limit Orders:**
Add a background price monitoring service (using BullMQ scheduled jobs) that polls DEX prices every 5-10 seconds. When `currentMarketPrice <= userTargetPrice`, automatically trigger execution by adding the order to the existing queue system. Store pending limit orders in PostgreSQL with a `target_price` field and `status='waiting'`.

**Sniper Orders:**
Implement Solana WebSocket subscriptions using `@solana/web3.js` to listen for `accountSubscribe` events on Raydium/Meteora program accounts. When a new liquidity pool creation is detected (new token launch), automatically execute orders for users who have pre-configured sniper settings. The same queue-based execution engine handles the actual swap.

---

## 🏗️ System Architecture

┌─────────────┐

│ Client      │ (React + Tailwind)

└──────┬──────┘

       │ POST /api/orders/execute

       ↓

┌─────────────────────────────────┐

│ Fastify API Server              │

│ (HTTP + WebSocket)              │

└──────┬──────────────────────────┘

│

↓ Validate & Persist Order

┌─────────────────────────────────┐

│ PostgreSQL Database             │

│ (Order History & State)         │

└──────┬──────────────────────────┘

       │

       ↓ Enqueue for Processing

┌─────────────────────────────────┐

│ BullMQ + Redis                  │

│ (10 concurrent workers)         │

│ - Rate limiting: 100/min        │

│ - Retry: 3 attempts             │

└──────┬──────────────────────────┘

       │

       ↓ Worker Processes Order

┌───────────────────────────────────┐

│ DEX Router Service                │

│ 1. Fetch Raydium quote (parallel) │

│ 2. Fetch Meteora quote (parallel) │

│ 3. Compare net outputs            │

│ 4. Select best DEX                │

│ 5. Execute swap (mock)            │

└──────┬────────────────────────────┘

       │

       ↓ Broadcast Status Updates

┌─────────────────────────────────┐

│ WebSocket Manager               │

│ (Real-time status per order)    │

└──────┬──────────────────────────┘

       │

       ↓ Status Stream

┌─────────────┐

│ Client      │ (Timeline updates)

└─────────────┘


**Key Architectural Decisions:**

- **Fastify over Express** - 2x faster request handling, native TypeScript support, schema-based validation
- **BullMQ over direct Redis** - Reliable job processing with automatic retries, rate limiting, and concurrency control
- **PostgreSQL over MongoDB** - ACID compliance for financial transactions, relational data model for order history
- **Single-file frontend** - Easy deployment, no build complexity for demo purposes

---

## ✨ Key Features

✅ **Mock DEX Implementation** - Simulates Raydium & Meteora with realistic delays (150-250ms) and price variations (±2-5%)  
✅ **Intelligent Routing** - Automatically selects best DEX based on net output after fees (0.3% Raydium, 0.2% Meteora)  
✅ **Real-time Updates** - WebSocket streaming of complete order lifecycle (6 statuses)  
✅ **Concurrent Processing** - Handles 10 simultaneous orders via BullMQ worker pool  
✅ **Rate Limiting** - Processes maximum 100 orders/minute to prevent system overload  
✅ **Exponential Backoff Retry** - Up to 3 attempts with exponential delay (1s, 2s, 4s)  
✅ **Comprehensive Testing** - 20 unit/integration tests covering routing, queue, and WebSocket  
✅ **Production-Ready** - TypeScript, proper error handling, structured logging, CORS configured

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 20+ | Backend execution environment |
| **Language** | TypeScript | Type safety and developer experience |
| **Framework** | Fastify | High-performance HTTP + WebSocket server (2x faster than Express) |
| **Queue** | BullMQ + Redis | Reliable concurrent order processing with retry logic |
| **Database** | PostgreSQL | Persistent order history with ACID guarantees |
| **Cache** | Redis | Active order state & queue management |
| **Testing** | Vitest | Fast unit & integration test framework |
| **Frontend** | React + Vite | Modern reactive UI |
| **Styling** | Tailwind CSS | Utility-first responsive design |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

### Installation & Setup

1. Clone repository
git clone https://github.com/YOUR_USERNAME/order-execution-engine
cd order-execution-engine

2. Install backend dependencies
npm install

3. Setup environment variables
cp .env.example .env

Edit .env if needed (defaults work for local development)
4. Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

5. Verify containers are healthy
docker-compose ps

Both containers should show "Up" status
6. Start backend server
npm run dev

Server starts on http://localhost:3000
7. In a new terminal, setup frontend
cd frontend
npm install
npm run dev

Frontend starts on http://localhost:5173

### Environment Variables

Your `.env` file should contain:

Database Configuration
DATABASE_URL=postgresql://orderuser:orderpass123@localhost:5432/orders_db

Redis Configuration
REDIS_URL=redis://localhost:6379

Server Configuration
PORT=3000
NODE_ENV=development

Queue Configuration (optional - defaults work)
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100

---

## 📡 API Documentation

### 1. Submit Order

**Endpoint:** `POST /api/orders/execute`

**Request:**
{
"orderType": "market",
"tokenIn": "SOL",
"tokenOut": "USDC",
"amountIn": 1000
}

**Response (201 Created):**
{
"orderId": "51271000-0a4c-4dfb-bafb-24eac65d67b3",
"status": "pending",
"wsUrl": "/api/orders/ws/51271000-0a4c-4dfb-bafb-24eac65d67b3"
}


**Validation Rules:**
- `orderType`: Must be "market", "limit", or "sniper" (only "market" fully implemented)
- `tokenIn` / `tokenOut`: Non-empty strings, must be different
- `amountIn`: Positive number > 0

---

### 2. WebSocket Connection

**Connect to:** `ws://localhost:3000/api/orders/ws/{orderId}`

**Example (JavaScript):**
const ws = new WebSocket('ws://localhost:3000/api/orders/ws/51271000-0a4c-4dfb-bafb-24eac65d67b3');

ws.onmessage = (event) => {
const update = JSON.parse(event.data);
console.log('Order Update:', update);
};

// Example update messages:
// { "orderId": "...", "status": "routing", "timestamp": "2025-11-22T14:20:15.123Z" }
// { "orderId": "...", "status": "building", "selectedDex": "raydium", "expectedOutput": 99850 }
// { "orderId": "...", "status": "confirmed", "txHash": "0xabc...", "executedPrice": 98.96 }

---

### 3. Get Order Status

**Endpoint:** `GET /api/orders/:orderId`

**Response (200 OK):**
{
"id": "51271000-0a4c-4dfb-bafb-24eac65d67b3",
"orderType": "market",
"tokenIn": "SOL",
"tokenOut": "USDC",
"amountIn": "1000",
"status": "confirmed",
"selectedDex": "raydium",
"executedPrice": "99.87",
"txHash": "0x17f99dbfed3e06c246...",
"createdAt": "2025-11-22T14:20:10.000Z",
"updatedAt": "2025-11-22T14:20:18.000Z"
}

---

## 📊 Order Lifecycle

Orders progress through the following statuses:

| Status | Description | Typical Duration | WebSocket Update Fields |
|--------|-------------|------------------|------------------------|
| **pending** | Order received and queued | <100ms | `status`, `timestamp` |
| **routing** | Comparing Raydium vs Meteora prices | 150-250ms | `status`, `timestamp` |
| **building** | Transaction being constructed with best DEX | 50-100ms | `status`, `selectedDex`, `expectedOutput` |
| **submitted** | Transaction sent to blockchain (mock) | 2-3s | `status`, `timestamp` |
| **confirmed** | Order executed successfully (95% success rate) | - | `status`, `txHash`, `executedPrice` |
| **failed** | Execution failed (5% simulated failure) | - | `status`, `error` |

**Total processing time:** 2.5-3.5 seconds per order (mock simulation)

---

## 🧪 Testing

### Run Test Suite

Run all tests
npm test

Run with coverage report
npm run test:coverage

Run in watch mode (during development)
npm run test:watch

### Test Coverage

**20/20 tests passing** ✅ (100% pass rate)

| Test Suite | Tests | Description |
|------------|-------|-------------|
| **DEX Router** | 5 | Quote fetching, price comparison, route selection, swap execution, error handling |
| **WebSocket Manager** | 6 | Connection management, broadcasting, multi-client support, disconnection handling |
| **Order Model** | 4 | CRUD operations, status updates, data validation |
| **Queue Service** | 2 | Order enqueueing, complete lifecycle processing with retries |
| **API Integration** | 3 | Endpoint validation, error responses, CORS handling |

**Example Test Output:**
✓ tests/dex-router.test.ts (5 tests) 5995ms
✓ should execute swap successfully 2941ms
✓ should handle swap execution with realistic delay 2426ms
✓ tests/websocket.test.ts (6 tests) 6ms
✓ tests/order.model.test.ts (4 tests) 40ms
✓ tests/queue.test.ts (2 tests) 7024ms
✓ tests/api.test.ts (3 tests) 54ms

Test Files 5 passed (5)
Tests 20 passed (20)

---

## 🔧 Development

### Available Scripts

Backend (project root)
npm run dev # Start dev server with hot reload (tsx watch)
npm run build # Compile TypeScript to dist/
npm start # Start production server from dist/
npm test # Run test suite once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run docker:up # Start Docker containers
npm run docker:down # Stop Docker containers
npm run docker:logs # View container logs

Frontend (frontend/ directory)
cd frontend
npm run dev # Start Vite dev server (http://localhost:5173)
npm run build # Build for production
npm run preview # Preview production build

### Project Structure

order-execution-engine/

├── src/

│ ├── config/ # Configuration & connections

│ │ ├── database.ts # PostgreSQL pool setup

│ │ └── redis.ts # Redis client setup

│ ├── models/ # Data access layer

│ │ └── order.model.ts # Order CRUD operations

│ ├── services/ # Business logic

│ │ ├── dex-router.service.ts # Mock DEX routing

│ │ ├── order.service.ts # Order management

│ │ ├── queue.service.ts # BullMQ worker

│ │ └── websocket.service.ts # WebSocket manager

│ ├── routes/ # API endpoints

│ │ └── order.routes.ts # Order execution routes

│ ├── types/ # TypeScript interfaces

│ │ └── order.types.ts # Order & DEX types

│ ├── utils/ # Utilities

│ │ ├── logger.ts # Structured logging

│ │ └── validation.ts # Input validation

│ └── server.ts # Application entry point

├── tests/ # Test suite (20 tests)

│ ├── dex-router.test.ts

│ ├── order.model.test.ts

│ ├── queue.test.ts

│ ├── websocket.test.ts

│ └── api.test.ts

├── database/

│ └── initdb/

│ └── schema.sql # Database schema with indexes

├── frontend/ # React frontend

│ └── src/

│ ├── components/ # React components

│ ├── services/ # API client

│ └── App.jsx # Main application

├── docker-compose.yml # Infrastructure setup

├── package.json

├── tsconfig.json

├── .env # Environment variables (gitignored)

└── README.md

---

## 🎯 Core Requirements Met

✅ **Order Type:** Market orders with immediate execution  
✅ **DEX Router:** Raydium & Meteora quote comparison with dynamic pricing  
✅ **HTTP → WebSocket:** Single endpoint upgrades to WebSocket for live updates  
✅ **Concurrent Processing:** 10 concurrent orders via BullMQ worker pool  
✅ **Rate Limiting:** 100 orders/minute via BullMQ limiter  
✅ **Retry Logic:** Exponential backoff (≤3 attempts) for failed executions  
✅ **Mock Implementation:** Realistic delays (2-3s) and price variations (±2-5%)  
✅ **Testing:** 20+ unit/integration tests with 100% pass rate  
✅ **Documentation:** Comprehensive README with design decisions  
✅ **Setup Instructions:** Complete quick start guide  
✅ **Frontend:** React + Tailwind dashboard with real-time updates

---

## 🐛 Troubleshooting

### Backend won't start

Check if ports are available
lsof -i :3000 # Should be empty

Check Docker containers
docker-compose ps # Both should be "Up"

View logs
docker-compose logs postgres
docker-compose logs redis

Restart infrastructure
docker-compose down
docker-compose up -d

### Frontend can't connect

Verify backend is running
curl http://localhost:3000/health

Should return: {"status":"ok","timestamp":"..."}
Check CORS configuration in src/server.ts
Should allow origin: http://localhost:5173

### Tests failing

Ensure Docker is running
docker-compose ps

Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm test

### WebSocket not connecting

- Open browser DevTools → Network → WS filter
- Look for connection to `/api/orders/ws/{orderId}`
- Check for CORS or upgrade errors in console
- Verify backend logs show WebSocket connections

---

## 📝 License

MIT

---

## 👤 Author

GitHub: https://github.com/Mahesh-HMJ

Email: mahesh.ruppa.1233@gmail.com

---

## 🙏 Acknowledgments

Built as part of a backend engineering assessment demonstrating production-grade architecture, real-time communication patterns, and robust queue-based processing systems.

**Technologies:** Node.js, TypeScript, Fastify, PostgreSQL, Redis, BullMQ, React, Tailwind CSS, Vitest

---

**Last Updated:** November 22, 2025
