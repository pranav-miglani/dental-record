/**
 * Shared types and interfaces used across the application
 */

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ASSISTANT' | 'RGHS_AGENT' | 'HOSPITAL_ADMIN'

export type ProcedureType = 'RCT' | 'SCALING' | 'EXTRACTION'

export type ProcedureStatus = 'DRAFT' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'

export type RelationshipType = 'SELF' | 'SON' | 'DAUGHTER' | 'WIFE' | 'HUSBAND' | 'OTHER'

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type ActionType =
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'PATIENT_CREATE'
  | 'PATIENT_UPDATE'
  | 'PROCEDURE_CREATE'
  | 'PROCEDURE_UPDATE'
  | 'PROCEDURE_CLOSE'
  | 'PROCEDURE_CANCEL'
  | 'IMAGE_UPLOAD'
  | 'IMAGE_DELETE'
  | 'IMAGE_ANNOTATE'
  | 'CONSENT_GIVEN'
  | 'USER_IMPERSONATE'

export type ResourceType = 'USER' | 'PATIENT' | 'PROCEDURE' | 'STEP' | 'IMAGE' | 'CONSENT'

export interface ToothNumber {
  tooth: string
  quadrant: 'upper_right' | 'upper_left' | 'lower_left' | 'lower_right'
  fdi_notation: string
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface AnnotationData {
  shapes: Array<{
    type: 'circle' | 'rectangle' | 'arrow' | 'line'
    x: number
    y: number
    radius?: number
    width?: number
    height?: number
    color: string
  }>
  text: Array<{
    x: number
    y: number
    text: string
    fontSize: number
    color: string
  }>
}

export interface PaginationParams {
  limit?: number
  last_key?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  last_key?: string
  count: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  message?: string
}

export interface JwtPayload {
  user_id: string
  mobile_number: string
  roles: UserRole[]
  impersonated_by?: string
  iat?: number
  exp?: number
}

