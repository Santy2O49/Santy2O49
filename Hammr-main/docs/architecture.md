# HAMMR System Architecture

## Overview
HAMMR uses a microservices architecture to ensure scalability, maintainability, and independent deployment of services.

## Components

### Frontend
- **Mobile App**: React Native (iOS & Android).
- **Admin Panel**: React Web App.

### Backend (Go Microservices)
- **API Gateway**: GCP API Gateway. Routes requests to services.
- **User Service**: Auth & User profiles.
- **Contractor Service**: Contractor-specific logic.
- **Job Service**: Job postings & geo-search.
- **Vetting Service**: Contractor verification workflow.
- **Bidding Service**: Bidding logic.
- **Notification Service**: Centralized notifications.
- **File Service**: Media management.
- **Payment Service**: Escrow & payments.
- **Rating Service**: Reviews & ratings.

### AI Services (Python)
- **Pricing Engine**: Price suggestions.
- **Marketing Assistant**: Ad copy generation.

### Data Storage
- **PostgreSQL**: Primary relational database.
- **PostGIS**: Geospatial data.
- **Cloud Storage**: File storage.

### Infrastructure
- **GCP Cloud Run / GKE**: Container orchestration.
- **GCP Pub/Sub**: Async messaging.
