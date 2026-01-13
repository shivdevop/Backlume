# Technical Documentation

## Architecture Deep Dive

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                    (HTTP Requests/Responses)                │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware Stack:                                    │  │
│  │  - JSON Parser                                         │  │
│  │  - Input Validation (Zod)                              │  │
│  │  - Rate Limiting (Redis-backed)                        │  │
│  │  - Authentication (JWT)                                │  │
│  │  - Authorization (RBAC)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Route Handlers:                                       │  │
│  │  - /api/v1/auth/*                                      │  │
│  │  - /api/v1/user/*                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────────┬──────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────┐      ┌──────────────────────┐
    │   PostgreSQL       │      │      Redis            │
    │   (Primary DB)      │      │  - Cache              │
    │                    │      │  - Rate Limiting      │
    │  - Users           │      │  - Session Store      │
    │  - Sessions        │      └───────────┬───────────┘
    └───────────────────┘                  │
                                            ▼
                                ┌──────────────────────┐
                                │    BullMQ Queue      │
                                │  - email-events      │
                                │  - audit-events      │
                                └───────────┬──────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                                 │
                    ▼                                                 ▼
        ┌──────────────────┐                          ┌──────────────────┐
        │  Email Worker    │                          │  Audit Worker    │
        │  - Send emails    │                          │  - Log events    │
        │  - Retry logic    │                          │  - Store logs    │
        └──────────────────┘                          └──────────────────┘
```

## Component Details

### 1. Authentication Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /auth/signup
     ▼
┌─────────────────┐
│ Auth Controller │
└────┬────────────┘
     │ 2. Validate Schema
     ▼
┌─────────────────┐
│ Auth Service    │
└────┬────────────┘
     │ 3. Hash Password
     │ 4. Create User (DB)
     │ 5. Publish Event
     ▼
┌─────────────────┐
│ Response        │
└─────────────────┘
```

**Login Flow**:
```
Client → Controller → Service → DB Query → JWT Generation → Response
                                    │
                                    ▼
                            Publish Login Event → Queue → Workers
```

**Token Refresh Flow**:
```
Client → Controller → Verify Refresh Token → Generate New Access Token → Response
```

### 2. Rate Limiting Architecture

**Implementation**:
- Uses `express-rate-limit` with Redis store
- Rate limiters initialized after Redis connection
- Separate limiters for different endpoints

**Configuration**:
```javascript
// Login: 5 requests per 15 minutes
loginRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: RedisStore
}

// Refresh: 10 requests per 15 minutes
refreshRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: RedisStore
}
```

**Key Implementation Details**:
1. Rate limiters created at app initialization (not per request)
2. Redis store ensures limits persist across server restarts
3. Falls back to in-memory store if Redis unavailable

### 3. Background Job Processing

**Queue Architecture**:
```
Producer (API) → BullMQ Queue → Worker Process
```

**Job Flow**:
1. User signs up → `publishUserSignupEvent()` called
2. Job added to `email-events` and `audit-events` queues
3. Workers pick up jobs asynchronously
4. Retry logic with exponential backoff on failure

**Job Configuration**:
```javascript
{
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000
  }
}
```

**Worker Implementation**:
- Separate processes for email and audit
- Each worker connects to Redis independently
- Workers process jobs based on job name matching

### 4. Caching Strategy

**User Profile Caching**:
- Cache key format: `user:profile:v1:{userId}`
- TTL: 10 minutes (600 seconds)
- Cache-aside pattern:
  1. Check Redis cache
  2. If miss, query database
  3. Store result in cache
  4. Return data

**Cache Invalidation**:
- On user update: Delete cache key
- On logout: Delete cache key
- Manual invalidation via API

### 5. Database Connection Management

**Connection Pooling**:
- Uses `pg.Pool` for connection management
- Automatic connection pooling
- Connection reuse for better performance

**Query Pattern**:
```javascript
// All queries use parameterized statements
pool.query('SELECT * FROM users WHERE email = $1', [email])
```

**Transaction Support**:
- Can be extended for complex operations
- Currently using simple queries

## Security Implementation

### 1. Password Security
- **Hashing**: bcrypt with 6 salt rounds
- **Storage**: Only hashed passwords stored
- **Comparison**: bcrypt.compare() for login

### 2. JWT Security
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Secrets**: Separate secrets for access and refresh tokens
- **Validation**: Token signature and expiration checked

### 3. Input Validation
- **Schema Validation**: Zod schemas for all inputs
- **Sanitization**: Automatic by Zod
- **Type Safety**: Runtime type checking

### 4. Rate Limiting
- **Protection**: Against brute force attacks
- **Storage**: Redis-backed (persistent)
- **Headers**: Rate limit info in response headers

## Docker Networking

### Service Discovery

**How Docker DNS Works**:
```
Container → DNS Query: "redis" → Docker DNS → Redis Container IP
```

**Network Configuration**:
- All services on same Docker network
- Service names resolve to container IPs
- Port mapping for external access

**Environment Variable Override**:
```yaml
# docker-compose.yml
environment:
  REDIS_URL: redis://redis:6379  # Overrides .env
```

**Why This Works**:
1. `.env` loaded first: `REDIS_URL=redis://localhost:6379`
2. `environment` section overrides: `REDIS_URL=redis://redis:6379`
3. Docker DNS resolves `redis` to container IP
4. Connection succeeds

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Error Types
1. **Validation Errors**: 400 Bad Request
2. **Authentication Errors**: 401 Unauthorized
3. **Authorization Errors**: 403 Forbidden
4. **Not Found**: 404 Not Found
5. **Rate Limit**: 429 Too Many Requests
6. **Server Errors**: 500 Internal Server Error

### Error Logging
- Errors logged to console
- Can be extended with structured logging
- Stack traces in development mode only

## Performance Considerations

### 1. Database Optimization
- **Indexes**: Email column indexed for fast lookups
- **Connection Pooling**: Reuse connections
- **Query Optimization**: Parameterized queries prevent SQL injection

### 2. Caching
- **User Profiles**: Cached in Redis (10 min TTL)
- **Reduces DB Load**: Frequently accessed data cached
- **Cache Invalidation**: On data updates

### 3. Background Jobs
- **Async Processing**: Non-blocking job processing
- **Retry Logic**: Automatic retries on failure
- **Scalability**: Multiple workers can process jobs

### 4. Rate Limiting
- **Redis Storage**: Fast lookups
- **Distributed**: Works across multiple instances
- **Efficient**: Minimal overhead

## Scalability

### Horizontal Scaling
- **Stateless API**: Can run multiple instances
- **Shared Redis**: Rate limits work across instances
- **Shared Database**: Single source of truth
- **Load Balancer**: Can distribute traffic

### Worker Scaling
- **Multiple Workers**: Can run multiple worker instances
- **Queue Distribution**: BullMQ distributes jobs
- **No Conflicts**: Workers process jobs independently

## Monitoring & Observability

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: Service status
- **Use Case**: Load balancer health checks

### Logging
- **Console Logging**: Development
- **Structured Logging**: Can be extended
- **Worker Logs**: Separate log streams

### Metrics (Future Enhancement)
- Request count
- Response times
- Error rates
- Queue depth
- Worker processing time

## Testing Strategy

### Unit Tests
- **Location**: `tests/unit/`
- **Framework**: Jest
- **Coverage**: Service layer tests
- **Isolation**: Mock dependencies

### Integration Tests (Future)
- API endpoint tests
- Database integration
- Redis integration
- Worker tests

## Deployment Architecture

### Development
```
Local Machine
├── Node.js Process (API)
├── Node.js Process (Email Worker)
├── Node.js Process (Audit Worker)
├── PostgreSQL (Local/Docker)
└── Redis (Local/Docker)
```

### Production (Recommended)
```
Load Balancer
    │
    ├── API Instance 1
    ├── API Instance 2
    └── API Instance N
         │
         ├── PostgreSQL (Managed Service)
         ├── Redis (Managed Service)
         └── Worker Instances (Separate)
```

## Configuration Management

### Environment-Based Config
- **Development**: `.env` file
- **Production**: Environment variables or secret management
- **Docker**: Environment overrides in `docker-compose.yml`

### Sensitive Data
- **Secrets**: Never commit to repository
- **JWT Secrets**: Strong, random strings
- **Database Credentials**: Secure connection strings
- **API Keys**: External service keys

## Future Enhancements

### Planned Features
1. **Database Migrations**: Proper migration system
2. **Structured Logging**: Winston/Pino integration
3. **API Documentation**: OpenAPI/Swagger
4. **Monitoring**: Prometheus metrics
5. **Tracing**: Distributed tracing
6. **Email Templates**: Template engine
7. **File Upload**: S3 integration
8. **WebSockets**: Real-time features

### Performance Improvements
1. **Query Optimization**: Database query analysis
2. **Caching Strategy**: More aggressive caching
3. **CDN Integration**: Static asset serving
4. **Database Replication**: Read replicas

## Troubleshooting Guide

### Debug Mode
Enable detailed logging:
```javascript
// In development
console.log('Debug info:', data)
```

### Common Patterns
1. **Check Logs**: Always start with logs
2. **Verify Connections**: Redis, Database
3. **Test Endpoints**: Use curl/Postman
4. **Check Environment**: Verify env variables
5. **Docker Logs**: `docker compose logs`

## Best Practices

### Code Organization
- **Separation of Concerns**: Controllers, Services, Repositories
- **Single Responsibility**: Each module has one purpose
- **DRY Principle**: Don't repeat yourself
- **Error Handling**: Consistent error responses

### Security
- **Input Validation**: Always validate inputs
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Sanitize outputs
- **HTTPS**: Use in production

### Performance
- **Caching**: Cache frequently accessed data
- **Connection Pooling**: Reuse connections
- **Async Operations**: Don't block event loop
- **Error Handling**: Fail fast, fail gracefully

---

**Last Updated**: 2024-01-13
**Version**: 1.0.0

