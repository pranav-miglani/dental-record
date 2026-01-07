# DynamoDB Schema Design - Dental Hospital Records System

## Overview

This document defines the complete DynamoDB schema for the Dental Hospital Records Management System. The design follows DynamoDB best practices with proper partition keys, sort keys, and Global Secondary Indexes (GSIs) to support all access patterns efficiently.

## Table Design Strategy

**Total Tables**: 6
- `users` - User accounts and authentication
- `patients` - Patient records
- `procedures` - Dental procedures
- `images` - Medical images with versioning
- `consent` - Patient consent records
- `audit_logs` - System audit trail

## Table 1: `users` (User Accounts)

**Purpose**: Stores all system users (patients, doctors, assistants, admins, RGHS agents)

**Primary Key Structure**:
- **PK**: `USER#user_id` (STRING) - e.g., `USER#uuid`
- **SK**: `USER#user_id` (STRING) - Same as PK for direct lookup

**Global Secondary Indexes (GSIs)**:

#### GSI1: `mobile-index` (Login by Mobile Number)
- **GSI1PK**: `MOBILE#mobile_number` (STRING) - e.g., `MOBILE#9876543210`
- **GSI1SK**: `USER#user_id` (STRING)
- **Purpose**: Fast login lookup (most common query)
- **Query Pattern**: `GSI1PK = MOBILE#9876543210`

#### GSI2: `role-index` (Query by Role)
- **GSI2PK**: `ROLE#role_name` (STRING) - e.g., `ROLE#DOCTOR`
- **GSI2SK**: `USER#user_id` (STRING)
- **Purpose**: Query all users with a specific role
- **Query Pattern**: `GSI2PK = ROLE#DOCTOR`

#### GSI3: `panel-index` (Query by Panel ID)
- **GSI3PK**: `PANEL#panel_id` (STRING) - e.g., `PANEL#RGHS12345`
- **GSI3SK**: `USER#user_id` (STRING)
- **Purpose**: Query users by Rajasthan State Govt panel ID
- **Query Pattern**: `GSI3PK = PANEL#RGHS12345`

**Item Example**:
```json
{
  "PK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "SK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "GSI1PK": "MOBILE#9876543210",
  "GSI1SK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "GSI2PK": "ROLE#DOCTOR",
  "GSI2SK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "user_id": "d816d896-b60b-4e24-884c-785926d6c2c0",
  "mobile_number": "9876543210",
  "name": "Dr. John Doe",
  "password_hash": "$2b$10$...",
  "roles": ["DOCTOR", "PATIENT"],
  "panel_id": "RGHS12345",
  "department": "DENTAL",
  "login_count": 0,
  "is_default_password": true,
  "is_blocked": false,
  "blocked_until": null,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

**Note**: For users with multiple roles, we create multiple items in GSI2 (one per role) or use a sparse index pattern.

## Table 2: `patients` (Patient Records)

**Purpose**: Stores patient information and demographics

**Primary Key Structure**:
- **PK**: `PATIENT#patient_id` (STRING) - e.g., `PATIENT#123`
- **SK**: `PATIENT#patient_id` (STRING) - Same as PK

**Global Secondary Indexes (GSIs)**:

#### GSI1: `dob-index` (Query by DOB for Linking)
- **GSI1PK**: `DOB#YYYY-MM-DD` (STRING) - e.g., `DOB#1990-05-15`
- **GSI1SK**: `PATIENT#patient_id` (STRING)
- **Purpose**: Find patients by DOB for auto-linking
- **Query Pattern**: `GSI1PK = DOB#1990-05-15`

#### GSI2: `name-index` (Search by Name)
- **GSI2PK**: `NAME#first_letter` (STRING) - e.g., `NAME#J` (first letter of name)
- **GSI2SK**: `PATIENT#patient_id#name` (STRING) - e.g., `PATIENT#123#John Doe`
- **Purpose**: Fuzzy search by patient name
- **Query Pattern**: `GSI2PK = NAME#J AND begins_with(GSI2SK, 'PATIENT#')`

**Item Example**:
```json
{
  "PK": "PATIENT#123",
  "SK": "PATIENT#123",
  "GSI1PK": "DOB#1990-05-15",
  "GSI1SK": "PATIENT#123",
  "GSI2PK": "NAME#J",
  "GSI2SK": "PATIENT#123#John Doe",
  "patient_id": "123",
  "name": "John Doe",
  "date_of_birth": "1990-05-15",
  "gender": "MALE",
  "aadhaar_last_4": "1234",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "9876543211",
    "relationship": "WIFE"
  },
  "medical_history": "No known allergies",
  "allergies": "None",
  "consent_given": true,
  "consent_version": 1,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

## Table 3: `user_patient_mappings` (User-Patient Relationships)

**Purpose**: Links users to patients (family relationships)

**Primary Key Structure**:
- **PK**: `USER#user_id` (STRING) - e.g., `USER#uuid`
- **SK**: `PATIENT#patient_id` (STRING) - e.g., `PATIENT#123`

**Global Secondary Indexes (GSIs)**:

#### GSI1: `patient-user-index` (Reverse Lookup)
- **GSI1PK**: `PATIENT#patient_id` (STRING)
- **GSI1SK**: `USER#user_id` (STRING)
- **Purpose**: Find all users linked to a patient
- **Query Pattern**: `GSI1PK = PATIENT#123`

**Item Example**:
```json
{
  "PK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "SK": "PATIENT#123",
  "GSI1PK": "PATIENT#123",
  "GSI1SK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "user_id": "d816d896-b60b-4e24-884c-785926d6c2c0",
  "patient_id": "123",
  "relationship_type": "SELF",
  "created_at": "2025-01-15T10:00:00Z"
}
```

## Table 4: `procedures` (Dental Procedures)

**Purpose**: Stores procedure instances (RCT, Scaling, Extraction)

**Primary Key Structure**:
- **PK**: `PROCEDURE#procedure_id` (STRING) - e.g., `PROCEDURE#456`
- **SK**: `PROCEDURE#procedure_id` (STRING) - Same as PK

**Global Secondary Indexes (GSIs)**:

#### GSI1: `patient-index` (Query by Patient)
- **GSI1PK**: `PATIENT#patient_id` (STRING) - e.g., `PATIENT#123`
- **GSI1SK**: `PROCEDURE#procedure_id#timestamp` (STRING) - e.g., `PROCEDURE#456#2025-01-15T10:00:00Z`
- **Purpose**: Get all procedures for a patient, sorted by timestamp
- **Query Pattern**: `GSI1PK = PATIENT#123` with `ScanIndexForward: false`

#### GSI2: `status-index` (Query by Status)
- **GSI2PK**: `STATUS#status` (STRING) - e.g., `STATUS#IN_PROGRESS`
- **GSI2SK**: `PROCEDURE#procedure_id#last_modified` (STRING)
- **Purpose**: Query procedures by status (for filtering)
- **Query Pattern**: `GSI2PK = STATUS#IN_PROGRESS`

#### GSI3: `type-index` (Query by Procedure Type)
- **GSI3PK**: `TYPE#procedure_type` (STRING) - e.g., `TYPE#RCT`
- **GSI3SK**: `PROCEDURE#procedure_id#last_modified` (STRING)
- **Purpose**: Query procedures by type (RCT, Scaling, Extraction)
- **Query Pattern**: `GSI3PK = TYPE#RCT`

#### GSI4: `assigned-by-index` (Query by Assigned Doctor)
- **GSI4PK**: `DOCTOR#doctor_id` (STRING) - e.g., `DOCTOR#uuid`
- **GSI4SK**: `PROCEDURE#procedure_id#assigned_date` (STRING)
- **Purpose**: Query procedures assigned by a specific doctor
- **Query Pattern**: `GSI4PK = DOCTOR#uuid`

#### GSI5: `archive-index` (Query Archived Procedures)
- **GSI5PK**: `ARCHIVED#true` (STRING) - e.g., `ARCHIVED#true`
- **GSI5SK**: `PROCEDURE#procedure_id#archive_date` (STRING)
- **Purpose**: Query archived procedures (Admin/Doctor access)
- **Query Pattern**: `GSI5PK = ARCHIVED#true`

**Item Example**:
```json
{
  "PK": "PROCEDURE#456",
  "SK": "PROCEDURE#456",
  "GSI1PK": "PATIENT#123",
  "GSI1SK": "PROCEDURE#456#2025-01-15T10:00:00Z",
  "GSI2PK": "STATUS#IN_PROGRESS",
  "GSI2SK": "PROCEDURE#456#2025-01-15T14:30:00Z",
  "GSI3PK": "TYPE#RCT",
  "GSI3SK": "PROCEDURE#456#2025-01-15T14:30:00Z",
  "GSI4PK": "DOCTOR#d816d896-b60b-4e24-884c-785926d6c2c0",
  "GSI4SK": "PROCEDURE#456#2025-01-15T10:00:00Z",
  "procedure_id": "456",
  "patient_id": "123",
  "procedure_type": "RCT",
  "status": "IN_PROGRESS",
  "procedure_name": "Root Canal Treatment",
  "procedure_description": "RCT for tooth 11",
  "tooth_number": {
    "tooth": "11",
    "quadrant": "upper_right",
    "fdi_notation": "11"
  },
  "assigned_by": "d816d896-b60b-4e24-884c-785926d6c2c0",
  "assigned_date": "2025-01-15T10:00:00Z",
  "start_date": "2025-01-15T10:00:00Z",
  "end_date": null,
  "is_backfilled": false,
  "archived": false,
  "archive_location": null,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T14:30:00Z",
  "last_modified": "2025-01-15T14:30:00Z"
}
```

## Table 5: `procedure_steps` (Procedure Steps)

**Purpose**: Stores steps within procedures

**Primary Key Structure**:
- **PK**: `PROCEDURE#procedure_id` (STRING) - e.g., `PROCEDURE#456`
- **SK**: `STEP#step_id` (STRING) - e.g., `STEP#789`

**Global Secondary Indexes (GSIs)**:

#### GSI1: `step-status-index` (Query Steps by Completion)
- **GSI1PK**: `PROCEDURE#procedure_id#STATUS#status` (STRING) - e.g., `PROCEDURE#456#STATUS#COMPLETED`
- **GSI1SK**: `STEP#step_id` (STRING)
- **Purpose**: Query completed/pending steps for a procedure
- **Query Pattern**: `GSI1PK = PROCEDURE#456#STATUS#COMPLETED`

**Item Example**:
```json
{
  "PK": "PROCEDURE#456",
  "SK": "STEP#789",
  "GSI1PK": "PROCEDURE#456#STATUS#COMPLETED",
  "GSI1SK": "STEP#789",
  "step_id": "789",
  "procedure_id": "456",
  "step_type": "CLINICAL_PHOTO_INITIAL",
  "step_name": "Clinical Photo Initial - Part 1 (First Day)",
  "is_mandatory": true,
  "is_completed": true,
  "is_skipped": false,
  "skip_reason": null,
  "visit_date": "2025-01-15T10:00:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

## Table 6: `images` (Medical Images)

**Purpose**: Stores image metadata and versioning information

**Primary Key Structure**:
- **PK**: `STEP#step_id` (STRING) - e.g., `STEP#789`
- **SK**: `IMAGE#image_id#VERSION#version` (STRING) - e.g., `IMAGE#abc123#VERSION#1`

**Global Secondary Indexes (GSIs)**:

#### GSI1: `image-id-index` (Query by Image ID)
- **GSI1PK**: `IMAGE#image_id` (STRING) - e.g., `IMAGE#abc123`
- **GSI1SK**: `VERSION#version` (STRING) - e.g., `VERSION#1`
- **Purpose**: Get all versions of an image
- **Query Pattern**: `GSI1PK = IMAGE#abc123` with `ScanIndexForward: false` (latest first)

#### GSI2: `procedure-images-index` (Query All Images for Procedure)
- **GSI2PK**: `PROCEDURE#procedure_id` (STRING) - e.g., `PROCEDURE#456`
- **GSI2SK**: `STEP#step_id#IMAGE#image_id#VERSION#version` (STRING)
- **Purpose**: Get all images for a procedure (for download, archival)
- **Query Pattern**: `GSI2PK = PROCEDURE#456`

#### GSI3: `uploaded-by-index` (Query by Uploader)
- **GSI3PK**: `USER#user_id` (STRING) - e.g., `USER#uuid`
- **GSI3SK**: `IMAGE#image_id#VERSION#version#timestamp` (STRING)
- **Purpose**: Query images uploaded by a specific user (for audit)
- **Query Pattern**: `GSI3PK = USER#uuid`

**Item Example**:
```json
{
  "PK": "STEP#789",
  "SK": "IMAGE#abc123#VERSION#1",
  "GSI1PK": "IMAGE#abc123",
  "GSI1SK": "VERSION#1",
  "GSI2PK": "PROCEDURE#456",
  "GSI2SK": "STEP#789#IMAGE#abc123#VERSION#1",
  "GSI3PK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "GSI3SK": "IMAGE#abc123#VERSION#1#2025-01-15T11:00:00Z",
  "image_id": "abc123",
  "step_id": "789",
  "procedure_id": "456",
  "version": 1,
  "is_current": true,
  "s3_key_original": "images/123/456/789/abc123/original.jpg",
  "s3_key_thumbnail_200": "images/123/456/789/abc123/thumbnail_200.jpg",
  "s3_key_thumbnail_800": "images/123/456/789/abc123/thumbnail_800.jpg",
  "s3_key_annotation": "images/123/456/789/abc123/annotation.json",
  "filename": "xray_tooth_11.jpg",
  "file_size": 5242880,
  "mime_type": "image/jpeg",
  "dimensions": {
    "width": 2048,
    "height": 1536
  },
  "uploaded_by": "d816d896-b60b-4e24-884c-785926d6c2c0",
  "upload_timestamp": "2025-01-15T11:00:00Z",
  "has_annotation": true,
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

## Table 7: `consent` (Patient Consent Records)

**Purpose**: Stores patient consent records with versioning

**Primary Key Structure**:
- **PK**: `PATIENT#patient_id` (STRING) - e.g., `PATIENT#123`
- **SK**: `CONSENT#consent_id` (STRING) - e.g., `CONSENT#consent_uuid`

**Global Secondary Indexes (GSIs)**:

#### GSI1: `consent-version-index` (Query by Version)
- **GSI1PK**: `VERSION#version` (STRING) - e.g., `VERSION#1`
- **GSI1SK**: `PATIENT#patient_id#CONSENT#consent_id` (STRING)
- **Purpose**: Query all patients who consented to a specific version
- **Query Pattern**: `GSI1PK = VERSION#1`

**Item Example**:
```json
{
  "PK": "PATIENT#123",
  "SK": "CONSENT#consent_uuid",
  "GSI1PK": "VERSION#1",
  "GSI1SK": "PATIENT#123#CONSENT#consent_uuid",
  "consent_id": "consent_uuid",
  "patient_id": "123",
  "consent_version": 1,
  "is_active": true,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "consented_at": "2025-01-15T10:00:00Z",
  "created_at": "2025-01-15T10:00:00Z"
}
```

## Table 8: `audit_logs` (System Audit Trail)

**Purpose**: Stores audit logs for compliance and security

**Primary Key Structure**:
- **PK**: `AUDIT#audit_id` (STRING) - e.g., `AUDIT#audit_uuid`
- **SK**: `TIMESTAMP#timestamp` (STRING) - e.g., `TIMESTAMP#2025-01-15T11:00:00Z`

**Global Secondary Indexes (GSIs)**:

#### GSI1: `user-audit-index` (Query by User)
- **GSI1PK**: `USER#user_id` (STRING) - e.g., `USER#uuid`
- **GSI1SK**: `TIMESTAMP#timestamp#AUDIT#audit_id` (STRING)
- **Purpose**: Query audit logs for a specific user
- **Query Pattern**: `GSI1PK = USER#uuid` with `ScanIndexForward: false`

#### GSI2: `action-type-index` (Query by Action Type)
- **GSI2PK**: `ACTION#action_type` (STRING) - e.g., `ACTION#IMAGE_UPLOAD`
- **GSI2SK**: `TIMESTAMP#timestamp#AUDIT#audit_id` (STRING)
- **Purpose**: Query audit logs by action type
- **Query Pattern**: `GSI2PK = ACTION#IMAGE_UPLOAD`

#### GSI3: `resource-index` (Query by Resource)
- **GSI3PK**: `RESOURCE#resource_type#RESOURCE_ID#resource_id` (STRING) - e.g., `RESOURCE#IMAGE#RESOURCE_ID#abc123`
- **GSI3SK**: `TIMESTAMP#timestamp#AUDIT#audit_id` (STRING)
- **Purpose**: Query audit logs for a specific resource
- **Query Pattern**: `GSI3PK = RESOURCE#IMAGE#RESOURCE_ID#abc123`

**Item Example**:
```json
{
  "PK": "AUDIT#audit_uuid",
  "SK": "TIMESTAMP#2025-01-15T11:00:00Z",
  "GSI1PK": "USER#d816d896-b60b-4e24-884c-785926d6c2c0",
  "GSI1SK": "TIMESTAMP#2025-01-15T11:00:00Z#AUDIT#audit_uuid",
  "GSI2PK": "ACTION#IMAGE_UPLOAD",
  "GSI2SK": "TIMESTAMP#2025-01-15T11:00:00Z#AUDIT#audit_uuid",
  "GSI3PK": "RESOURCE#IMAGE#RESOURCE_ID#abc123",
  "GSI3SK": "TIMESTAMP#2025-01-15T11:00:00Z#AUDIT#audit_uuid",
  "audit_id": "audit_uuid",
  "user_id": "d816d896-b60b-4e24-884c-785926d6c2c0",
  "action_type": "IMAGE_UPLOAD",
  "resource_type": "IMAGE",
  "resource_id": "abc123",
  "patient_id": "123",
  "procedure_id": "456",
  "step_id": "789",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "impersonated_user_id": null,
  "metadata": {
    "filename": "xray_tooth_11.jpg",
    "file_size": 5242880
  },
  "timestamp": "2025-01-15T11:00:00Z",
  "created_at": "2025-01-15T11:00:00Z"
}
```

## Access Patterns Summary

### User Management
1. **Login**: Query `mobile-index` by mobile number → Get user → Validate password
2. **Get User by ID**: GetItem on `users` table with `USER#user_id`
3. **Get Users by Role**: Query `role-index` by role name
4. **Get Users by Panel ID**: Query `panel-index` by panel ID

### Patient Management
1. **Get Patient by ID**: GetItem on `patients` table
2. **Search Patients by Name**: Query `name-index` with fuzzy search
3. **Link Patient by DOB**: Query `dob-index` by DOB for auto-linking
4. **Get Patients for User**: Query `user_patient_mappings` by user_id

### Procedure Management
1. **Get Procedures for Patient**: Query `patient-index` by patient_id (sorted by timestamp DESC)
2. **Get Procedures by Status**: Query `status-index` by status
3. **Get Procedures by Type**: Query `type-index` by procedure type
4. **Get Procedures by Doctor**: Query `assigned-by-index` by doctor_id
5. **Get Archived Procedures**: Query `archive-index` for archived procedures

### Image Management
1. **Get Images for Step**: Query `images` table by step_id (PK)
2. **Get Image Versions**: Query `image-id-index` by image_id (all versions)
3. **Get All Images for Procedure**: Query `procedure-images-index` by procedure_id
4. **Get Images by Uploader**: Query `uploaded-by-index` by user_id

### Consent Management
1. **Get Consent for Patient**: Query `consent` table by patient_id (PK)
2. **Get Patients by Consent Version**: Query `consent-version-index` by version

### Audit Logs
1. **Get Audit Logs for User**: Query `user-audit-index` by user_id
2. **Get Audit Logs by Action**: Query `action-type-index` by action_type
3. **Get Audit Logs for Resource**: Query `resource-index` by resource_type and resource_id

## Cost Optimization

- **On-Demand Billing**: All tables use on-demand billing (pay-per-request)
- **GSI Count**: 17 GSIs total (within DynamoDB limit of 20 per table)
- **Item Size**: Average item size ~2-5KB (well within 400KB limit)
- **Query Efficiency**: All queries use GSIs (no table scans)

## Data Retention

- **Active Data**: 3 years from procedure creation
- **Archived Data**: Moved to S3, marked `archived: true` in DynamoDB
- **Audit Logs**: 3 years retention (same as medical data)
- **TTL**: Not used (manual archival process for better control)

