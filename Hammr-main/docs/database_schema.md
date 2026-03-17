# Database Schema Design (Initial)

## Users
- `id`: UUID
- `email`: String
- `password_hash`: String
- `role`: Enum (Contractor, Contractee, Admin)
- `created_at`: Timestamp

## Contractor Profiles
- `user_id`: UUID (FK)
- `bio`: Text
- `skills`: JSONB
- `rating`: Float
- `is_verified`: Boolean

## Jobs
- `id`: UUID
- `contractee_id`: UUID (FK)
- `title`: String
- `description`: Text
- `status`: Enum (Open, InProgress, Completed, Cancelled)
- `location`: Geography (Point)
- `budget_min`: Decimal
- `budget_max`: Decimal

## Bids
- `id`: UUID
- `job_id`: UUID (FK)
- `contractor_id`: UUID (FK)
- `amount`: Decimal
- `status`: Enum (Pending, Accepted, Rejected)

## Ratings
- `id`: UUID
- `job_id`: UUID (FK)
- `reviewer_id`: UUID (FK)
- `reviewee_id`: UUID (FK)
- `score`: Integer (1-5)
- `comment`: Text
