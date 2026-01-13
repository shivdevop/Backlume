# Backlume API

A modern, scalable Node.js backend API built with Express, featuring authentication, rate limiting, background job processing, and Redis caching.

##  Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Local Development](#local-development)
  - [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

##  Overview

Backlume is a RESTful API backend service that provides user authentication, authorization, and background job processing capabilities. It uses a microservices-oriented architecture with separate workers for email processing and audit logging.

## ✨ Features

- **Authentication & Authorization**
  - JWT-based authentication (access & refresh tokens)
  - Role-based access control (RBAC)
  - Secure password hashing with bcrypt
  - Token refresh mechanism

- **Rate Limiting**
  - Redis-backed rate limiting
  - Configurable limits for login and refresh endpoints
  - Prevents brute force attacks

- **Background Job Processing**
  - BullMQ for queue management
  - Separate workers for email and audit logging
  - Retry mechanisms with exponential backoff

- **Caching**
  - Redis caching for user profiles
  - Configurable TTL for cached data

- **Input Validation**
  - Zod schema validation
  - Request sanitization

- **Email Service**
  - SendGrid integration
  - Welcome emails on user signup

- **Database**
  - PostgreSQL with UUID primary keys
  - Automatic schema initialization

##  Tech Stack

### Core
- **Runtime**: Node.js 20
- **Framework**: Express.js 5
- **Language**: JavaScript (ES Modules)

### Database & Caching
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **ORM/Query**: pg (node-postgres)

### Authentication & Security
- **JWT**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Rate Limiting**: express-rate-limit with Redis store

### Background Jobs
- **Queue System**: BullMQ
- **Workers**: Separate processes for email and audit

### Validation
- **Schema Validation**: Zod

### Email
- **Provider**: SendGrid

### Testing
- **Framework**: Jest

##  Architecture

```
┌─────────────────┐
│   API Server    │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Redis  │ │Postgres│
│Cache  │ │Database│
└───┬───┘ └────────┘
    │
┌───▼──────────────┐
│   BullMQ Queue   │
└───┬──────────────┘
    │
┌───┴─────┬──────────┐
│        │          │
┌─▼──┐ ┌─▼──┐   ┌──▼──┐
│Email│ │Audit│   │... │
│Worker│ │Worker│   │    │
└─────┘ └─────┘   └─────┘
```

### Key Components

1. **API Server**: Main Express application handling HTTP requests
2. **Redis**: Used for caching and rate limiting storage
3. **PostgreSQL**: Primary database for persistent data
4. **BullMQ**: Message queue for asynchronous job processing
5. **Workers**: Separate processes handling email and audit jobs

##  Prerequisites

- **Node.js** >= 20.x
- **PostgreSQL** >= 16
- **Redis** >= 7
- **Docker & Docker Compose** (for containerized setup)
- **npm** or **yarn**

##  Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivdevop/Backlume.git
   cd Backlume
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker Compose (recommended)
   docker compose up -d postgres redis
   
   # Or start them manually
   # PostgreSQL: Ensure it's running on port 5432
   # Redis: Ensure it's running on port 6379
   ```

5. **Initialize the database**
   ```bash
   # The init.sql will run automatically if using Docker
   # Or manually run:
   psql -U postgres -d backlume -f src/db/init.sql
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Start workers (in separate terminals)**
   ```bash
   # Email worker
   node src/workers/email.worker.js
   
   # Audit worker
   node src/workers/audit.worker.js
   ```

The API will be available at `http://localhost:3000`

### Docker Setup

1. **Clone and navigate to the project**
   ```bash
   git clone https://github.com/shivdevop/Backlume.git
   cd Backlume
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start all services**
   ```bash
   docker compose up --build
   ```

   This will start:
   - API server on port 3000
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Email worker
   - Audit worker

4. **Run in detached mode**
   ```bash
   docker compose up -d
   ```

5. **View logs**
   ```bash
   docker compose logs -f api
   docker compose logs -f email-worker
   docker compose logs -f audit-worker
   ```

6. **Stop services**
   ```bash
   docker compose down
   ```

##  Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backlume

# Redis
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# SendGrid (Email Service)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Environment Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_SECRET` | Secret for access token signing | Yes | - |
| `JWT_EXPIRES_IN` | Access token expiration | No | 15m |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing | Yes | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No | 7d |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes | - |
| `SENDGRID_FROM_EMAIL` | Sender email address | Yes | - |

**Note**: In Docker, `REDIS_URL` and `DATABASE_URL` are automatically overridden to use service names (`redis`, `postgres`) instead of `localhost`.

##  API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### 1. Sign Up
Create a new user account.

**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `400`: Validation error or user already exists
- `500`: Server error

---

#### 2. Login
Authenticate and receive access & refresh tokens.

**Endpoint**: `POST /auth/login`

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "is_verified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**:
- `400`: Validation error
- `401`: Invalid credentials
- `429`: Too many requests (rate limited)

---

#### 3. Get Current User
Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "is_verified": false,
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `401`: Unauthorized (invalid/missing token)

---

#### 4. Refresh Session
Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**:
- `400`: Validation error
- `401`: Invalid refresh token
- `429`: Too many requests

---

#### 5. Logout
Invalidate refresh token and clear cache.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Endpoints

#### 1. Get Dashboard
Get user dashboard data (requires authentication).

**Endpoint**: `GET /user/dashboard`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Welcome to your dashboard"
  }
}
```

---

### Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok",
  "service": "backlume"
}
```

## 🗄 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  refresh_token TEXT,
  role TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `idx_users_email` on `email` column

##  Project Structure

```
Backlume/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection
│   │   ├── env.js             # Environment variables
│   │   ├── queueRedis.js      # BullMQ Redis configuration
│   │   └── redis.js           # Redis client
│   ├── controllers/
│   │   ├── auth.controller.js # Authentication handlers
│   │   └── user.controller.js # User handlers
│   ├── db/
│   │   ├── init.sql          # Database schema
│   │   └── user.queries.js   # User database queries
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── authorize.middleware.js # Role-based authorization
│   │   ├── inputValidator.js       # Request validation
│   │   └── rateLimiter.js         # Rate limiting
│   ├── modules/
│   │   └── auth/
│   │       └── auth.validator.js   # Zod schemas
│   ├── producers/
│   │   └── user.producer.js        # Event producers
│   ├── queues/
│   │   └── userSignup/
│   │       ├── audit.queue.js     # Audit queue
│   │       └── email.queue.js     # Email queue
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   └── v1/
│   │       ├── auth.route.js      # Auth routes
│   │       └── user.route.js      # User routes
│   ├── services/
│   │   ├── auth.service.js        # Authentication logic
│   │   └── email.service.js        # Email service
│   ├── utils/
│   │   ├── jwt.js                 # JWT utilities
│   │   └── response.js             # Response helpers
│   └── workers/
│       ├── audit.worker.js        # Audit log worker
│       └── email.worker.js        # Email worker
├── tests/
│   └── unit/
│       └── auth.service.test.js   # Unit tests
├── docker-compose.yml              # Docker services
├── Dockerfile                      # Docker image
├── package.json                    # Dependencies
└── README.md                       # This file
```

##  Development Guide

### Running in Development Mode

```bash
# Start API server with hot reload
npm run dev

# In separate terminals, start workers
node src/workers/email.worker.js
node src/workers/audit.worker.js
```

### Code Style

- Use ES Modules (`import/export`)
- Follow Express.js best practices
- Use async/await for asynchronous operations
- Validate all inputs using Zod schemas

### Adding New Features

1. **New Route**: Add to `src/routes/v1/`
2. **New Controller**: Add to `src/controllers/`
3. **New Service**: Add to `src/services/`
4. **New Middleware**: Add to `src/middlewares/`
5. **New Worker**: Add to `src/workers/` and update `docker-compose.yml`

### Database Migrations

Currently, schema is initialized via `src/db/init.sql`. For production, consider using a migration tool like:
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [db-migrate](https://db-migrate.readthedocs.io/)

##  Testing

### Run Tests

```bash
npm test
```

### Test Structure

Tests are located in `tests/unit/` directory. Example test:

```javascript
import { signupUser } from "../../src/services/auth.service.js"

describe("Auth Service", () => {
  it("creates a user with hashed password", async () => {
    const newUser = await signupUser({
      email: "test@example.com",
      password: "password123"
    })
    expect(newUser).toBeDefined()
    expect(newUser.email).toBe("test@example.com")
  })
})
```

##  Deployment

### Production Considerations

1. **Environment Variables**: Use secure secret management
2. **Database**: Use connection pooling and SSL
3. **Redis**: Enable persistence and authentication
4. **Rate Limiting**: Adjust limits for production traffic
5. **Logging**: Implement structured logging
6. **Monitoring**: Set up health checks and alerts
7. **HTTPS**: Use reverse proxy (nginx) with SSL certificates

### Docker Production Build

```bash
# Build production image
docker build -t backlume-api:latest .

# Run with production environment
docker run -d \
  --name backlume-api \
  -p 3000:3000 \
  --env-file .env.production \
  backlume-api:latest
```

### Docker Compose Production

Create `docker-compose.prod.yml` with:
- Production environment variables
- Resource limits
- Health checks
- Restart policies
- Logging configuration

##  Troubleshooting

### Common Issues

#### 1. Redis Connection Refused
**Error**: `ECONNREFUSED 127.0.0.1:6379`

**Solution**:
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`
- In Docker, ensure service name is `redis://redis:6379`

#### 2. Database Connection Failed
**Error**: `relation "users" does not exist`

**Solution**:
- Run `src/db/init.sql` manually
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running

#### 3. Workers Not Processing Jobs
**Error**: Workers start but don't process jobs

**Solution**:
- Check Redis connection in worker logs
- Verify queue names match between producer and worker
- Check job names match exactly

#### 4. Rate Limiter Resets on Restart
**Error**: Rate limits reset when server restarts

**Solution**:
- Ensure Redis is connected before initializing rate limiters
- Check `initializeRateLimiters()` is called after `connectRedis()`

### Debugging

**View API logs**:
```bash
docker compose logs -f api
```

**View worker logs**:
```bash
docker compose logs -f email-worker
docker compose logs -f audit-worker
```

**Test Redis connection**:
```bash
docker compose exec api node -e "
import('./src/config/redis.js').then(m => {
  m.connectRedis().then(() => console.log('Connected!'))
})
"
```

**Test database connection**:
```bash
docker compose exec postgres psql -U postgres -d backlume -c "SELECT COUNT(*) FROM users;"
```


##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/shivdevop/Backlume/issues)
- Check existing documentation
- Review logs for error messages

---


