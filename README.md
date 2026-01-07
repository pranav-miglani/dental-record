# Dental Hospital Records Management System

A comprehensive serverless application for managing dental hospital records, built with AWS serverless technologies and following SOLID principles, TDD, and best practices.

## 🏥 Overview

This system digitizes dental department records, managing patient information, procedures, medical images, and providing role-based access control for different user types (Patients, Doctors, Assistants, RGHS Agents, Hospital Admins).

## ✨ Features

### Core Functionality
- **User Management**: Multi-role system (Patient, Doctor, Assistant, RGHS Agent, Hospital Admin)
- **Patient Management**: Patient records with family relationships
- **Procedure Management**: RCT, Scaling, Extraction procedures with step-by-step tracking
- **Image Management**: Medical image upload, versioning, annotation (doctors only), thumbnails
- **Consent Management**: Patient consent tracking with versioning
- **Audit Logging**: Comprehensive audit trail for compliance
- **Data Archival**: Automatic 3-year archival to S3 with lifecycle policies
- **Multi-language Support**: UI translations (Hindi, Rajasthani, Marwari, and more)

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password reset via OTP (SMS)
- Image watermarking for patient view
- Encryption at rest and in transit
- Audit logging for all critical actions

### Image Features
- Multiple image uploads per step
- Image versioning with history
- Thumbnail generation (async)
- Image annotation (doctors only - draw, text, shapes)
- Watermarking (patient name, date, tooth number)
- Download options (original/compressed for RGHS agents)

## 🏗️ Architecture

### Technology Stack
- **Backend**: TypeScript, Node.js 20.x
- **Database**: DynamoDB (on-demand billing)
- **Storage**: S3 with lifecycle policies (Standard → Standard-IA → Glacier)
- **Compute**: AWS Lambda (serverless)
- **API**: API Gateway REST API
- **CDN**: CloudFront
- **Events**: EventBridge (scheduled tasks)
- **Frontend**: Next.js 14+ (mobile-first, responsive)
- **Infrastructure**: Terraform (IaC)

### Architecture Pattern
- **Clean Architecture**: Domain, Application, Infrastructure, Interfaces layers
- **SOLID Principles**: Applied throughout
- **Design Patterns**: Repository, Service Layer, Factory, Strategy, Dependency Injection
- **TDD Approach**: Unit tests (80%), Integration tests (15%), E2E tests (5%)

## 📁 Project Structure

```
dental-hospital-system/
├── docs/                          # Documentation
│   ├── ARCHITECTURE_DESIGN.md    # System architecture
│   ├── DYNAMODB_SCHEMA_DESIGN.md # Database schema
│   ├── API_SPECIFICATION.md      # API endpoints
│   └── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── src/
│   ├── domain/                    # Domain models (entities, value objects)
│   │   ├── user/
│   │   ├── patient/
│   │   ├── procedure/
│   │   ├── image/
│   │   ├── consent/
│   │   └── audit/
│   ├── application/               # Application services (business logic)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── patient/
│   │   ├── procedure/
│   │   ├── image/
│   │   └── consent/
│   ├── infrastructure/           # Infrastructure layer
│   │   ├── dynamodb/             # DynamoDB repositories
│   │   ├── s3/                   # S3 operations
│   │   └── sns/                  # SMS/OTP
│   ├── interfaces/               # Interface adapters
│   │   ├── api/                  # API Gateway handlers
│   │   └── events/               # EventBridge handlers
│   └── shared/                   # Shared utilities
│       ├── errors/               # Custom error classes
│       ├── rbac/                 # RBAC utilities
│       └── types/                 # Shared types
├── infrastructure/               # Terraform IaC
│   ├── main.tf
│   ├── variables.tf
│   ├── dynamodb.tf
│   ├── lambda.tf
│   ├── api-gateway.tf
│   ├── s3.tf
│   └── eventbridge.tf
├── tests/                         # Test suite
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests (Selenium)
├── frontend/                     # Next.js frontend
└── scripts/                      # Deployment scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- AWS CLI configured
- Terraform >= 1.5.0
- Docker (for DynamoDB Local testing)

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/apple/repository/dental-hospital-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and configuration
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Build**
   ```bash
   npm run build
   ```

### Deployment

**👋 New to AWS and deployment?** Start with the [Beginner's Guide](./docs/DEPLOYMENT_GUIDE_BEGINNER.md)!

**Available Deployment Guides**:
- 📖 [Beginner's Guide](./docs/DEPLOYMENT_GUIDE_BEGINNER.md) - Complete step-by-step for beginners (assumes zero knowledge)
- ⚡ [Quick Start](./docs/DEPLOYMENT_QUICK_START.md) - For experienced developers
- 📘 [Standard Guide](./docs/DEPLOYMENT_GUIDE.md) - Standard deployment instructions
- 📋 [Interactive Checklist](./docs/deployment-checklist.html) - Track your deployment progress
- 📚 [Documentation Index](./docs/DEPLOYMENT_INDEX.md) - Choose the right guide for you

**Quick deployment** (for experienced users):
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

**For complete beginners**, see [DEPLOYMENT_GUIDE_BEGINNER.md](./docs/DEPLOYMENT_GUIDE_BEGINNER.md) for detailed instructions.

## 📚 Documentation

- [Architecture Design](./docs/ARCHITECTURE_DESIGN.md) - Complete system architecture
- [DynamoDB Schema](./docs/DYNAMODB_SCHEMA_DESIGN.md) - Database schema and access patterns
- [API Specification](./docs/API_SPECIFICATION.md) - All API endpoints
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Migrate to new AWS account (free tier strategy)

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
# Start DynamoDB Local
docker run -d -p 8000:8000 amazon/dynamodb-local

# Run integration tests
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

Target: >90% code coverage

## 🔐 Security

- **Authentication**: JWT tokens (access: 15-30 min, refresh: 7-30 days)
- **Authorization**: RBAC middleware
- **Encryption**: At rest (DynamoDB, S3) and in transit (TLS)
- **Rate Limiting**: 15 TPS per user/IP
- **Audit Logging**: All critical actions logged
- **Password Policy**: Minimum 10 characters, OTP-based reset

## 💰 Cost Optimization

- **DynamoDB**: On-demand billing (pay-per-request)
- **S3**: Lifecycle policies (Standard → Standard-IA → Glacier)
- **Lambda**: Right-sized memory allocation
- **CloudFront**: CDN for image delivery
- **Estimated Monthly Cost**: $75-150/month (scales with usage)

## 📊 Data Retention

- **Active Data**: 3 years from procedure creation
- **Archival**: Automatic move to S3 archive after 3 years
- **Archive Access**: Admin and Doctors can view archived data
- **Purge Policy**: Never purge (permanent storage for analytics/legal)

## 🌐 Multi-Language Support

Supported languages:
- English (default)
- Hindi
- Rajasthani
- Marwari
- Other Indian languages

UI translations stored in `frontend/locales/{language}/common.json`

## 👥 User Roles

1. **Patient**: View own records, only closed procedures, watermarked images
2. **Doctor**: Full access, can annotate images, view version history
3. **Assistant**: Same as doctor (no annotation, no version history)
4. **RGHS Agent**: View and download images (read-only)
5. **Hospital Admin**: Full system access, user management, impersonation

## 📝 Procedure Types

1. **RCT (Root Canal Treatment)**: 8 mandatory steps
2. **Scaling**: 2 mandatory steps
3. **Extraction**: 7 mandatory steps

## 🖼️ Image Features

- **Upload**: Multiple images per step, max 10MB per image
- **Thumbnails**: Auto-generated (200x200px, 800x800px)
- **Versioning**: Full version history (doctors/admin can view)
- **Annotation**: Draw, text, shapes (doctors only)
- **Watermarking**: Patient name, date, tooth number (patient view)
- **Download**: Original or compressed (70% quality for RGHS)

## 🔄 CI/CD

GitHub Actions workflow for:
- Automated testing
- Code quality checks
- Infrastructure deployment
- Lambda function deployment

## 🤝 Contributing

1. Follow SOLID principles
2. Write tests (TDD approach)
3. Follow code style (ESLint + Prettier)
4. Update documentation

## 📄 License

Private - Internal use only

## 🆘 Support

For issues or questions:
- Check documentation in `/docs` folder
- Review CloudWatch logs
- Contact development team
- Create GitHub issue

## 🎯 Roadmap

- [ ] PACS integration for X-ray systems
- [ ] Billing integration
- [ ] Lab reports integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Procedure definitions configurable by admin
- [ ] Denture visualization with tooth highlighting

---

**Built with ❤️ following best practices and SOLID principles**

