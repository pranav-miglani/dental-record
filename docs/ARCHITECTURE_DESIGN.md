# Dental Hospital Records Management System - Architecture Design Document

## Project Overview

**Dental Hospital Records Management System** is a serverless application built with AWS serverless technologies and DynamoDB. The system manages patient records, dental procedures, medical images, and provides role-based access control for different user types.

**Data Hierarchy**: User → Patient → Procedure → Step → Image
- Users can have multiple Patients (family members)
- Patients can have multiple Procedures
- Procedures have multiple Steps
- Steps can have multiple Images
- Images support versioning and annotations (doctors only)

## System Scale & Requirements

- **Patients**: ~2,400 + 10% annual growth (~2,640 in year 2, ~2,904 in year 3)
- **Users**: ~2,400 patients + ~50 staff (doctors, assistants, admins, RGHS agents)
- **Procedures**: ~3-5 procedures per patient per year = ~12,000 procedures/year
- **Images**: ~10-30 images per procedure = ~120,000-360,000 images/year
- **Concurrent Users**: Low (< 50 concurrent users)
- **Data Retention**: 3 years active → S3 archive → permanent storage
- **Architecture**: 100% Serverless (Lambda, API Gateway, DynamoDB, S3, CloudFront, EventBridge)

## Cost Optimization Strategy

### Current Scale Analysis
- **Read Operations**: ~50 users × 200 requests/day = 10,000 reads/day = 300K/month
- **Write Operations**: ~1,000 procedures/month × 20 images = 20K image uploads/month + metadata writes = ~50K writes/month
- **Storage**: ~360K images/year × 5MB avg = ~1.8TB/year (with thumbnails and versions)

### Cost-Effective Design Decisions

1. **DynamoDB On-Demand Billing**: Pay-per-request (no capacity planning needed)
   - Free tier: 25GB storage, 25 RCU, 25 WCU permanently free
   - Estimated cost: ~$5-10/month (well within free tier for this scale)

2. **S3 Storage with Lifecycle Policies**:
   - 0-3 years: S3 Standard (frequent access)
   - 3-7 years: S3 Standard-IA (infrequent access, 50% cheaper)
   - 7+ years: S3 Glacier (deep archive, 80% cheaper)
   - Estimated cost: ~$50-100/month (storage + requests)

3. **Lambda**:
   - Free tier: 1M requests/month, 400K GB-seconds
   - Estimated cost: ~$5-10/month

4. **API Gateway**:
   - Free tier: 1M requests/month
   - Estimated cost: $0 (within free tier)

5. **CloudFront**:
   - Free tier: 1TB data transfer out
   - Estimated cost: ~$10-20/month (for image delivery)

6. **SNS (OTP SMS)**:
   - Estimated cost: ~$5-10/month (SMS charges)

7. **Frontend**: **Cloudflare Pages** (Recommended - FREE, unlimited bandwidth)
   - Alternative: Vercel ($20/month) or AWS S3+CloudFront (~$5/month)
   - **Recommendation**: Cloudflare Pages for zero cost

**Total Estimated Monthly Cost: $75-150/month** (scales with usage)

## User Roles & Permissions

### 1. Patient (PATIENT)
- **Login**: Mobile number + password
- **Access**: View only their own linked patients (family members)
- **View**: Only CLOSED procedures for selected patient
- **Images**: View online with watermark (patient name, date, tooth number), no download
- **Actions**: Add family members, update profile, change password

### 2. Doctor (DOCTOR)
- **Login**: Mobile number + password
- **Access**: All patients and all procedures in their department (Dental)
- **View**: All procedures (DRAFT, IN_PROGRESS, CLOSED, CANCELLED)
- **Images**: Upload, modify, delete, annotate (draw, text, shapes), view version history
- **Actions**: 
  - Create users (patients)
  - Assign procedures to patients
  - Confirm procedures (DRAFT → IN_PROGRESS)
  - Upload images for any step
  - Modify procedure details (text fields, images)
  - Backfill procedures (upload historical data)
  - View audit logs

### 3. Doctor Assistant (ASSISTANT)
- **Login**: Mobile number + password
- **Access**: Same as Doctor (all patients, all procedures)
- **View**: All procedures
- **Images**: Upload, modify, delete (no annotation, no version history view)
- **Actions**: 
  - Create users (patients)
  - Assign procedures to patients
  - Upload images for any step
  - Modify procedure details
  - Backfill procedures

### 4. RGHS Agent (RGHS_AGENT)
- **Login**: Mobile number + password
- **Access**: All patients and all procedures
- **View**: All procedures (read-only)
- **Images**: View and download (original or compressed 70% quality)
- **Actions**: 
  - Search patients
  - Download individual images or bulk ZIP
  - No edit permissions

### 5. Hospital Admin (HOSPITAL_ADMIN)
- **Login**: Mobile number + password
- **Access**: Full system access
- **View**: All users, patients, procedures, audit logs, archived data
- **Actions**: 
  - User management (create, assign roles, deactivate, change password)
  - Patient management (view, edit, link/unlink to users)
  - Procedure management (view, edit, close/cancel)
  - System configuration (mandatory steps per procedure, consent text)
  - View audit logs
  - Impersonate users (for support)
  - Access archived data

## Authentication & Authorization

### Authentication Flow
1. User enters mobile number + password
2. System validates credentials
3. JWT tokens issued:
   - **Access Token**: 15-30 minutes expiry
   - **Refresh Token**: 7-30 days expiry
4. For patients: Show list of linked patients, user selects one
5. Token stored in localStorage (mobile-friendly)

### Password Management
- **Default Password**: Mobile number (valid for first 5 logins)
- **Password Reset**: OTP via SMS (3 attempts max, then block - only Doctor/Admin can unblock)
- **Password Policy**: Minimum 10 characters
- **Password Change**: All users can change their password

### Role-Based Access Control (RBAC)
- Middleware layer checks user role before API access
- Each endpoint defines required roles
- Patient access filtered to their linked patients only
- Doctor/Assistant access filtered to their department (Dental)

## Data Model Overview

### Core Entities

1. **User**: System users (patients, doctors, assistants, admins, RGHS agents)
   - Mobile number (unique)
   - Password (hashed)
   - Roles (multiple roles allowed)
   - Panel ID (Rajasthan State Govt panel identification)

2. **Patient**: Dental patients
   - Patient ID (generated)
   - Name, DOB, Gender, Aadhaar (last 4)
   - Emergency contact, medical history, allergies (optional)
   - Consent (version, timestamp, IP, user agent)

3. **UserPatientMapping**: Links users to patients (family relationships)
   - User ID → Patient ID
   - Relationship type (SELF, SON, DAUGHTER, WIFE, HUSBAND, OTHER)

4. **Procedure**: Dental procedures (RCT, Scaling, Extraction)
   - Procedure ID (generated)
   - Patient ID
   - Procedure type (RCT, SCALING, EXTRACTION)
   - Status (DRAFT, IN_PROGRESS, CLOSED, CANCELLED)
   - Assigned by (doctor/assistant ID)
   - Start date, end date
   - Is backfilled flag

5. **ProcedureStep**: Steps within a procedure
   - Step ID (generated)
   - Procedure ID
   - Step type (from procedure definition)
   - Is mandatory flag
   - Visit date (editable by doctor/assistant)
   - Skip reason (if skipped)

6. **Image**: Medical images (X-rays, photos)
   - Image ID (generated)
   - Step ID
   - S3 key (original, thumbnails)
   - Metadata (filename, size, mime type, dimensions)
   - Uploaded by, upload timestamp
   - Version number (for history)
   - Is deleted flag (soft delete)
   - Annotation data (JSON - doctors only)

7. **Consent**: Patient consent records
   - Consent ID (generated)
   - Patient ID
   - Consent version
   - Timestamp, IP address, user agent
   - Is active flag

8. **AuditLog**: System audit trail
   - Audit ID (generated)
   - User ID, action type
   - Resource type, resource ID
   - Timestamp, IP address
   - Impersonation info (if applicable)

## Procedure Definitions

### RCT Process
1. Procedure Name & Information (text)
2. Tooth Number (text - FDI notation)
3. Clinical Photo Initial - Part 1 (First Day) (image)
   - Intra Oral PA - xray (image)
4. Clinical Photo - Follow Up (image)
   - IOPA - x ray (image)
   - PUS drainage (image)
5. Working Length (image)
   - IOPA - xray (image)
6. Master Cone (image)
   - IOPA - xray (image)
7. Before Filling (image)
   - IOPA - xray (image)
8. After Filling (image)
   - IOPA - xray (image)

**Mandatory Steps**: 1, 2, 3, 4, 5, 6, 7, 8

### Scaling
1. Before Scaling (image)
2. After Scaling (image)

**Mandatory Steps**: 1, 2

### Extraction
1. Tooth Number (text - FDI notation)
2. Before Clinical Photo (image)
   - IOPA - xray (image)
3. FLAP raised photo (image)
4. Alveoplasty (image)
5. Bone Augmentation (image)
6. After extraction Photo (image)
   - IOPA - xray (image)
7. Dressing of the wound (image)

**Mandatory Steps**: 1, 2, 3, 4, 5, 6, 7

## Image Management

### Image Storage Strategy
- **S3 Bucket Structure**:
  - Active: `images/{patient_id}/{procedure_id}/{step_id}/{image_id}/original.{ext}`
  - Thumbnails: `images/{patient_id}/{procedure_id}/{step_id}/{image_id}/thumbnail_{size}.{ext}`
  - Annotations: `images/{patient_id}/{procedure_id}/{step_id}/{image_id}/annotation.json`
  - Archived: `archived/{patient_id}/{procedure_id}/{year-month}/images/{image_id}/original.{ext}`

### Image Processing
- **Upload**: Max 10MB per image
- **Thumbnails**: Generated asynchronously (Lambda)
  - Sizes: 200x200px (thumbnail), 800x800px (medium), original
- **Formats**: JPEG, PNG (HEIC, DICOM support for future PACS integration)
- **Versioning**: Keep all versions in S3, track in DynamoDB
- **Watermarking**: Applied on-the-fly for patient view (name, date, tooth number)

### Image Annotation (Doctors Only)
- **Features**: Draw, text, shapes (circles, rectangles, arrows)
- **Storage**: JSON format stored in S3
- **Access**: Only doctors can view/edit annotations
- **Versioning**: Annotations versioned with image versions

## Data Retention & Archival

### Retention Policy
- **Active Data**: 3 years from procedure creation date
- **Archival Process**: 
  1. EventBridge scheduled rule (daily at 2 AM)
  2. Lambda function identifies procedures older than 3 years
  3. Copy images to S3 archive folder
  4. Delete from active S3 bucket
  5. Update DynamoDB: set `archived: true`, `archive_location: s3://...`
- **Archive Access**: Hospital Admin and Doctors can view archived data (read-only)
- **Purge Policy**: Never purge archived data (permanent storage for analytics/legal)

### S3 Lifecycle Policies
- **0-3 years**: S3 Standard (frequent access)
- **3-7 years**: S3 Standard-IA (infrequent access)
- **7+ years**: S3 Glacier (deep archive)

## Multi-Language Support

### Implementation
- **Scope**: UI only (buttons, labels, menus, error messages)
- **Languages**: English (default), Hindi, Rajasthani, Marwari, and other Indian languages
- **Storage**: Static JSON files in `frontend/locales/{language}/common.json`
- **Detection**: Auto-detect from browser/device, user can manually change
- **Persistence**: Browser localStorage
- **Fallback**: English if translation missing

## Consent Management

### Consent Flow
1. **First Login**: Show consent modal before viewing any data
2. **Consent Text**: Hardcoded in application (multi-language)
3. **Storage**: 
   - Consent version number
   - Timestamp, IP address, user agent
   - Per patient (each patient needs consent)
4. **Versioning**: Track consent version, re-capture on version update
5. **Revocation**: Block access immediately if consent revoked

## Serverless Architecture

### API Layer

**API Gateway REST API** with the following structure:
- `/api/auth/*` - Authentication (login, refresh, password reset)
- `/api/users/*` - User management (CRUD, role assignment)
- `/api/patients/*` - Patient management (CRUD, family linking)
- `/api/procedures/*` - Procedure management (CRUD, assignment, confirmation)
- `/api/steps/*` - Step management (upload images, update details)
- `/api/images/*` - Image management (upload, download, annotate)
- `/api/consent/*` - Consent management
- `/api/audit/*` - Audit log queries (Admin only)
- `/api/archive/*` - Archived data access (Admin/Doctor only)
- `/api/admin/*` - Admin functions (impersonation, system config)

**Lambda Functions** (Grouped by Domain):
- `auth-handler` - Authentication
- `users-handler` - User management
- `patients-handler` - Patient management
- `procedures-handler` - Procedure management
- `images-handler` - Image upload/download/annotation
- `consent-handler` - Consent management
- `audit-handler` - Audit log queries
- `admin-handler` - Admin functions

### Background Jobs (EventBridge)

**EventBridge Rules** for scheduled tasks:
- `archive-procedures` - Daily archival (2 AM)
- `generate-thumbnails` - Async thumbnail generation (S3 event trigger)
- `cleanup-expired-sessions` - Session cleanup (daily)

**Lambda Functions** for background jobs:
- `archive-procedures` - Move old procedures to S3 archive
- `generate-thumbnails` - Process uploaded images, generate thumbnails
- `cleanup-sessions` - Clean expired refresh tokens

### Lambda Configuration

- **Runtime**: Node.js 20.x
- **Memory**: 512 MB (API handlers), 1024 MB (image processing)
- **Timeout**: 30 seconds (API handlers), 5 minutes (image processing)
- **Layers**: Shared code layer (utilities, validators)

## Security Architecture

### Data Protection
- **Encryption at Rest**: 
  - DynamoDB: AES-256 (default)
  - S3: SSE-S3 (server-side encryption)
- **Encryption in Transit**: TLS 1.2+ (API Gateway, CloudFront)
- **PII Handling**: No PII in logs, encrypted storage

### Access Control
- **API Gateway Throttling**: 15 TPS per user/IP
- **DDoS Protection**: API Gateway built-in throttling (no WAF to save costs)
- **RBAC**: Middleware-based role checking
- **Impersonation**: Admin can impersonate users (logged in audit)

### Image Security
- **Access Control**: Pre-signed URLs (not signed URLs as per requirement - direct S3 access with IAM)
- **Watermarking**: Applied for patient view (prevents unauthorized sharing)
- **Download Restrictions**: Patients cannot download, RGHS can download

## Monitoring & Observability

1. **Logging**: CloudWatch Logs (structured JSON logging)
2. **Metrics**: CloudWatch Metrics (custom metrics for business KPIs)
3. **Tracing**: AWS X-Ray (optional, for debugging)
4. **Alarms**: CloudWatch Alarms for errors and high latency

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14+ (App Router) - Mobile-first, responsive
- **Styling**: TailwindCSS
- **Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion (smooth, refreshing UI)
- **Image Annotation**: Fabric.js or Konva.js (for doctor annotation feature)
- **Charts**: Recharts (for analytics if needed)
- **State**: React Context + Hooks
- **Internationalization**: next-i18next or react-i18next

### Deployment
- **Recommended**: **Cloudflare Pages** (FREE, unlimited bandwidth)
- **Alternative**: Vercel ($20/month) or AWS S3+CloudFront (~$5/month)

## Testing Strategy

### Test Pyramid
- **Unit Tests**: 80% (domain models, services, repositories)
- **Integration Tests**: 15% (DynamoDB operations, S3 operations)
- **E2E Tests**: 5% (Selenium - critical user flows)

### Test Coverage Target: >90%

### E2E Test Scenarios (Selenium)
- Patient login → view last procedure
- Doctor login → search patient → assign procedure → upload images
- Doctor → annotate image
- Assistant → upload images
- RGHS agent → search → download images
- Admin → impersonate user → view data

## Code Structure (SOLID Principles & Design Patterns)

**Design Patterns Applied**:
- **Repository Pattern**: Abstract data access
- **Service Layer Pattern**: Business logic encapsulation
- **Factory Pattern**: Image processor creation
- **Strategy Pattern**: Different image processors (JPEG, PNG, etc.)
- **Dependency Injection**: Constructor-based DI throughout
- **Builder Pattern**: Complex query construction

**SOLID Principles**:
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension (new procedures), closed for modification
- **Liskov Substitution**: All repositories are interchangeable
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

## Next Steps

1. ✅ Create project structure
2. ✅ Design architecture
3. ⏭️ Design DynamoDB schema
4. ⏭️ Implement domain models
5. ⏭️ Implement repositories and services
6. ⏭️ Create API handlers
7. ⏭️ Build frontend
8. ⏭️ Deploy and test

