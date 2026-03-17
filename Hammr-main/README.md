# HAMMR

HAMMR is a comprehensive platform connecting contractors with contractees in El Salvador and Central America. It features a cross-platform mobile app, a microservices-based backend, and AI-powered services for pricing and marketing.

## Architecture

The system is built using a microservices architecture:

- **Frontend**: React Native (iOS & Android)
- **Backend**: Go (Golang) Microservices
- **Admin Panel**: React
- **AI Services**: Python (TensorFlow/PyTorch)
- **Infrastructure**: Google Cloud Platform (GCP)

See [System Architecture](docs/architecture.md) for more details.

## Services

- **API Gateway**: Central entry point.
- **User Service**: User management and auth.
- **Contractor Service**: Contractor profiles and portfolios.
- **Job Service**: Job posting and management.
- **Vetting Service**: Contractor verification.
- **Bidding Service**: Job bidding system.
- **Notification Service**: Push, Email, SMS.
- **File Service**: Media upload and management.
- **Payment Service**: Escrow and payments.
- **Rating Service**: Ratings and reviews.

## AI Components

- **Pricing Engine**: AI-suggested fair market prices.
- **Marketing Assistant**: AI-driven ad copy and audience segmentation.

## Setup

Please refer to the documentation in the `docs/` directory for detailed setup instructions for each component.
