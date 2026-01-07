# API Specification - Dental Hospital Records System

## Base URL
```
https://api.dental-hospital.example.com/api
```

## Authentication

All endpoints (except `/api/auth/login` and `/api/auth/password-reset`) require JWT authentication.

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## Authentication Endpoints

### POST /api/auth/login
**Description**: User login with mobile number and password

**Request Body**:
```json
{
  "mobile_number": "9876543210",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "uuid",
      "mobile_number": "9876543210",
      "name": "Dr. John Doe",
      "roles": ["DOCTOR", "PATIENT"],
      "is_default_password": false
    },
    "linked_patients": [
      {
        "patient_id": "123",
        "name": "John Doe",
        "relationship_type": "SELF"
      }
    ]
  }
}
```

**Errors**:
- `401 UNAUTHORIZED`: Invalid credentials
- `403 BLOCKED`: User account is blocked
- `429 TOO_MANY_ATTEMPTS`: Too many login attempts

### POST /api/auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/password-reset/request
**Description**: Request password reset OTP

**Request Body**:
```json
{
  "mobile_number": "9876543210"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to mobile number"
  }
}
```

### POST /api/auth/password-reset/verify
**Description**: Verify OTP and reset password

**Request Body**:
```json
{
  "mobile_number": "9876543210",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Password reset successful"
  }
}
```

### PUT /api/auth/password
**Description**: Change password (authenticated user)

**Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

## User Management Endpoints

### GET /api/users/me
**Description**: Get current user profile

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "mobile_number": "9876543210",
    "name": "Dr. John Doe",
    "roles": ["DOCTOR"],
    "panel_id": "RGHS12345",
    "department": "DENTAL",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### POST /api/users
**Description**: Create new user (Doctor/Assistant/Admin only)

**Request Body**:
```json
{
  "mobile_number": "9876543211",
  "name": "Jane Doe",
  "panel_id": "RGHS12346",
  "department": "DENTAL",
  "roles": ["PATIENT"]
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "mobile_number": "9876543211",
    "name": "Jane Doe",
    "default_password": "9876543211",
    "login_count": 0,
    "is_default_password": true
  }
}
```

### GET /api/users
**Description**: List all users (Admin only)

**Query Parameters**:
- `role` (optional): Filter by role
- `panel_id` (optional): Filter by panel ID
- `limit` (optional): Page size (default: 50)
- `last_key` (optional): Pagination token

**Response** (200):
```json
{
  "success": true,
  "data": {
    "users": [...],
    "last_key": "pagination_token"
  }
}
```

### PUT /api/users/:user_id
**Description**: Update user (Admin only)

**Request Body**:
```json
{
  "name": "Updated Name",
  "roles": ["DOCTOR", "PATIENT"],
  "panel_id": "RGHS12345"
}
```

### PUT /api/users/:user_id/password
**Description**: Reset user password (Admin/Doctor/Assistant)

**Request Body**:
```json
{
  "new_password": "newpassword123"
}
```

### PUT /api/users/:user_id/block
**Description**: Block/unblock user (Admin only)

**Request Body**:
```json
{
  "is_blocked": true,
  "blocked_until": "2025-01-20T10:00:00Z"
}
```

### POST /api/users/:user_id/impersonate
**Description**: Impersonate user (Admin only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "impersonated_token",
    "user": { ... }
  }
}
```

## Patient Management Endpoints

### GET /api/patients
**Description**: List patients (with search/filter)

**Query Parameters**:
- `search` (optional): Search by name or mobile
- `limit` (optional): Page size (default: 50)
- `last_key` (optional): Pagination token

**Response** (200):
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "patient_id": "123",
        "name": "John Doe",
        "date_of_birth": "1990-05-15",
        "gender": "MALE",
        "aadhaar_last_4": "1234"
      }
    ],
    "last_key": "pagination_token"
  }
}
```

### GET /api/patients/:patient_id
**Description**: Get patient details

**Response** (200):
```json
{
  "success": true,
  "data": {
    "patient_id": "123",
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "gender": "MALE",
    "aadhaar_last_4": "1234",
    "emergency_contact": { ... },
    "medical_history": "...",
    "allergies": "...",
    "consent_given": true,
    "consent_version": 1
  }
}
```

### POST /api/patients
**Description**: Create patient (Doctor/Assistant/Admin)

**Request Body**:
```json
{
  "name": "John Doe",
  "date_of_birth": "1990-05-15",
  "gender": "MALE",
  "aadhaar_last_4": "1234",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "9876543211",
    "relationship": "WIFE"
  },
  "medical_history": "No known issues",
  "allergies": "None"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "patient_id": "123",
    "name": "John Doe",
    ...
  }
}
```

### PUT /api/patients/:patient_id
**Description**: Update patient (Doctor/Assistant/Admin)

### POST /api/patients/:patient_id/link
**Description**: Link patient to user (for family relationships)

**Request Body**:
```json
{
  "user_id": "uuid",
  "relationship_type": "SON"
}
```

### DELETE /api/patients/:patient_id/link
**Description**: Unlink patient from user (Admin only)

**Request Body**:
```json
{
  "user_id": "uuid"
}
```

## Procedure Management Endpoints

### GET /api/procedures
**Description**: List procedures (with filters)

**Query Parameters**:
- `patient_id` (optional): Filter by patient
- `status` (optional): Filter by status (DRAFT, IN_PROGRESS, CLOSED, CANCELLED)
- `procedure_type` (optional): Filter by type (RCT, SCALING, EXTRACTION)
- `assigned_by` (optional): Filter by assigned doctor
- `date_from` (optional): Filter by start date
- `date_to` (optional): Filter by end date
- `sort_by` (optional): Sort field (last_modified, created_date, patient_name, procedure_type)
- `sort_order` (optional): ASC or DESC (default: DESC)
- `limit` (optional): Page size (default: 50)
- `last_key` (optional): Pagination token

**Response** (200):
```json
{
  "success": true,
  "data": {
    "procedures": [
      {
        "procedure_id": "456",
        "patient_id": "123",
        "patient_name": "John Doe",
        "procedure_type": "RCT",
        "status": "IN_PROGRESS",
        "procedure_name": "Root Canal Treatment",
        "procedure_description": "RCT for tooth 11",
        "tooth_number": {
          "tooth": "11",
          "quadrant": "upper_right",
          "fdi_notation": "11"
        },
        "assigned_by": "doctor_uuid",
        "assigned_by_name": "Dr. John Doe",
        "start_date": "2025-01-15T10:00:00Z",
        "end_date": null,
        "is_backfilled": false,
        "created_at": "2025-01-15T10:00:00Z",
        "last_modified": "2025-01-15T14:30:00Z"
      }
    ],
    "last_key": "pagination_token"
  }
}
```

### GET /api/procedures/:procedure_id
**Description**: Get procedure details with steps

**Response** (200):
```json
{
  "success": true,
  "data": {
    "procedure_id": "456",
    "patient_id": "123",
    "procedure_type": "RCT",
    "status": "IN_PROGRESS",
    "procedure_name": "Root Canal Treatment",
    "procedure_description": "RCT for tooth 11",
    "tooth_number": { ... },
    "assigned_by": "doctor_uuid",
    "start_date": "2025-01-15T10:00:00Z",
    "end_date": null,
    "steps": [
      {
        "step_id": "789",
        "step_type": "CLINICAL_PHOTO_INITIAL",
        "step_name": "Clinical Photo Initial - Part 1",
        "is_mandatory": true,
        "is_completed": true,
        "is_skipped": false,
        "visit_date": "2025-01-15T10:00:00Z",
        "images": [...]
      }
    ],
    "mandatory_steps_completed": 5,
    "mandatory_steps_total": 8
  }
}
```

### POST /api/procedures
**Description**: Create/assign procedure (Doctor/Assistant)

**Request Body**:
```json
{
  "patient_id": "123",
  "procedure_type": "RCT",
  "procedure_name": "Root Canal Treatment",
  "procedure_description": "RCT for tooth 11",
  "tooth_number": {
    "tooth": "11",
    "quadrant": "upper_right",
    "fdi_notation": "11"
  },
  "diagnosis_notes": "Patient complains of pain in upper right quadrant"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "procedure_id": "456",
    "status": "DRAFT",
    "steps": [
      {
        "step_id": "789",
        "step_type": "PROCEDURE_NAME",
        "step_name": "Procedure Name & Information",
        "is_mandatory": true,
        "is_completed": false
      }
    ]
  }
}
```

### PUT /api/procedures/:procedure_id/confirm
**Description**: Confirm procedure (DRAFT → IN_PROGRESS) (Doctor only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "procedure_id": "456",
    "status": "IN_PROGRESS"
  }
}
```

### PUT /api/procedures/:procedure_id
**Description**: Update procedure details (Doctor/Assistant/Admin)

**Request Body**:
```json
{
  "procedure_name": "Updated Name",
  "procedure_description": "Updated description",
  "tooth_number": {
    "tooth": "12",
    "quadrant": "upper_right",
    "fdi_notation": "12"
  }
}
```

### PUT /api/procedures/:procedure_id/close
**Description**: Close procedure (Admin only, or auto-close when all mandatory steps done)

### PUT /api/procedures/:procedure_id/cancel
**Description**: Cancel procedure (Doctor/Admin)

**Request Body**:
```json
{
  "reason": "Patient cancelled appointment"
}
```

## Step Management Endpoints

### GET /api/procedures/:procedure_id/steps
**Description**: Get all steps for a procedure

### GET /api/procedures/:procedure_id/steps/:step_id
**Description**: Get step details with images

### PUT /api/procedures/:procedure_id/steps/:step_id
**Description**: Update step details (visit date, skip reason)

**Request Body**:
```json
{
  "visit_date": "2025-01-20T10:00:00Z",
  "is_skipped": false,
  "skip_reason": null
}
```

### POST /api/procedures/:procedure_id/steps/:step_id/skip
**Description**: Skip step (Doctor only, requires reason)

**Request Body**:
```json
{
  "skip_reason": "Step not applicable for this patient"
}
```

## Image Management Endpoints

### POST /api/procedures/:procedure_id/steps/:step_id/images
**Description**: Upload image(s) for a step

**Request**: Multipart form data
```
file: <image file>
file: <image file> (multiple files allowed)
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "image_id": "abc123",
        "step_id": "789",
        "version": 1,
        "filename": "xray_tooth_11.jpg",
        "file_size": 5242880,
        "mime_type": "image/jpeg",
        "dimensions": {
          "width": 2048,
          "height": 1536
        },
        "upload_timestamp": "2025-01-15T11:00:00Z",
        "s3_key_original": "images/123/456/789/abc123/original.jpg",
        "s3_key_thumbnail_200": "images/123/456/789/abc123/thumbnail_200.jpg",
        "s3_key_thumbnail_800": "images/123/456/789/abc123/thumbnail_800.jpg"
      }
    ]
  }
}
```

### GET /api/images/:image_id
**Description**: Get image details

**Response** (200):
```json
{
  "success": true,
  "data": {
    "image_id": "abc123",
    "step_id": "789",
    "procedure_id": "456",
    "patient_id": "123",
    "version": 1,
    "is_current": true,
    "filename": "xray_tooth_11.jpg",
    "file_size": 5242880,
    "mime_type": "image/jpeg",
    "dimensions": { ... },
    "uploaded_by": "doctor_uuid",
    "upload_timestamp": "2025-01-15T11:00:00Z",
    "has_annotation": true,
    "versions": [
      {
        "version": 1,
        "is_current": true,
        "upload_timestamp": "2025-01-15T11:00:00Z"
      }
    ]
  }
}
```

### GET /api/images/:image_id/versions
**Description**: Get all versions of an image (Doctor/Admin only)

### GET /api/images/:image_id/view
**Description**: Get image URL (with watermark for patients)

**Query Parameters**:
- `size` (optional): original, thumbnail_200, thumbnail_800 (default: original)
- `watermark` (optional): true/false (default: true for patients, false for others)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/images/...",
    "expires_at": "2025-01-15T12:00:00Z"
  }
}
```

### GET /api/images/:image_id/download
**Description**: Download image (RGHS Agent, Doctor, Assistant, Admin)

**Query Parameters**:
- `compressed` (optional): true/false (default: false, only for RGHS)

**Response**: Binary file download

### POST /api/images/:image_id/replace
**Description**: Replace image (creates new version) (Doctor/Assistant)

**Request**: Multipart form data
```
file: <image file>
```

### DELETE /api/images/:image_id
**Description**: Delete image (soft delete) (Doctor/Assistant/Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Image deleted successfully"
  }
}
```

### POST /api/images/:image_id/annotate
**Description**: Save annotation (Doctor only)

**Request Body**:
```json
{
  "annotation_data": {
    "shapes": [
      {
        "type": "circle",
        "x": 100,
        "y": 100,
        "radius": 50,
        "color": "#FF0000"
      }
    ],
    "text": [
      {
        "x": 200,
        "y": 200,
        "text": "Tooth 11",
        "fontSize": 16,
        "color": "#000000"
      }
    ]
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "annotation_saved": true,
    "s3_key_annotation": "images/123/456/789/abc123/annotation.json"
  }
}
```

### GET /api/images/:image_id/annotation
**Description**: Get annotation data (Doctor only)

## Consent Management Endpoints

### GET /api/patients/:patient_id/consent
**Description**: Get consent status for patient

**Response** (200):
```json
{
  "success": true,
  "data": {
    "consent_given": true,
    "consent_version": 1,
    "current_consent_version": 1,
    "needs_reconsent": false,
    "consented_at": "2025-01-15T10:00:00Z"
  }
}
```

### POST /api/patients/:patient_id/consent
**Description**: Give consent (Patient only)

**Request Body**:
```json
{
  "consent_version": 1
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "consent_id": "consent_uuid",
    "consent_given": true,
    "consent_version": 1
  }
}
```

## Archive Endpoints (Admin/Doctor only)

### GET /api/archive/procedures
**Description**: List archived procedures

**Query Parameters**: Same as `/api/procedures`

### GET /api/archive/procedures/:procedure_id
**Description**: Get archived procedure details

### GET /api/archive/procedures/:procedure_id/images/:image_id/download
**Description**: Download archived image

## Audit Log Endpoints (Admin only)

### GET /api/audit/logs
**Description**: Query audit logs

**Query Parameters**:
- `user_id` (optional): Filter by user
- `action_type` (optional): Filter by action
- `resource_type` (optional): Filter by resource type
- `resource_id` (optional): Filter by resource ID
- `date_from` (optional): Filter by date
- `date_to` (optional): Filter by date
- `limit` (optional): Page size (default: 50)
- `last_key` (optional): Pagination token

**Response** (200):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "audit_id": "audit_uuid",
        "user_id": "doctor_uuid",
        "action_type": "IMAGE_UPLOAD",
        "resource_type": "IMAGE",
        "resource_id": "abc123",
        "patient_id": "123",
        "procedure_id": "456",
        "ip_address": "192.168.1.1",
        "timestamp": "2025-01-15T11:00:00Z"
      }
    ],
    "last_key": "pagination_token"
  }
}
```

## Admin Endpoints

### GET /api/admin/stats
**Description**: Get system statistics (Admin only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_users": 2450,
    "total_patients": 2400,
    "total_procedures": 12000,
    "total_images": 240000,
    "active_procedures": 500,
    "archived_procedures": 11500
  }
}
```

### PUT /api/admin/procedures/:procedure_id/mandatory-steps
**Description**: Configure mandatory steps for procedure type (future feature)

## Error Codes

- `400 BAD_REQUEST`: Invalid request data
- `401 UNAUTHORIZED`: Authentication required
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `409 CONFLICT`: Duplicate resource
- `422 VALIDATION_ERROR`: Validation failed
- `429 TOO_MANY_REQUESTS`: Rate limit exceeded
- `500 INTERNAL_SERVER_ERROR`: Server error
- `503 SERVICE_UNAVAILABLE`: Service temporarily unavailable

