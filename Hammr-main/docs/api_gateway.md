# API Gateway Specifications

## Technology
GCP API Gateway

## Responsibilities
1. **Authentication**: Validate JWT tokens via Firebase Auth / Identity Platform.
2. **Routing**: Route requests to appropriate Cloud Run services.
3. **Rate Limiting**: Protect services from abuse.
4. **Logging**: Centralized logging to Cloud Logging.

## Routes (High Level)

- `/users/*` -> User Service
- `/contractors/*` -> Contractor Service
- `/jobs/*` -> Job Service
- `/vetting/*` -> Vetting Service
- `/bids/*` -> Bidding Service
- `/notifications/*` -> Notification Service
- `/files/*` -> File Service
- `/payments/*` -> Payment Service
- `/reviews/*` -> Rating Service
