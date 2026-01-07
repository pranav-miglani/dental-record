/**
 * Procedure definitions
 * Hardcoded procedure types and their steps
 * Future: Can be moved to database for admin configuration
 */

import { ProcedureType } from '../../shared/types'
import { StepType } from './ProcedureStep'

export interface ProcedureStepDefinition {
  step_type: StepType
  step_name: string
  is_mandatory: boolean
  parent_step_type?: StepType // For nested steps (e.g., IOPA xray under Clinical Photo)
}

export interface ProcedureDefinition {
  procedure_type: ProcedureType
  procedure_name: string
  steps: ProcedureStepDefinition[]
}

/**
 * RCT (Root Canal Treatment) procedure definition
 */
export const RCT_PROCEDURE: ProcedureDefinition = {
  procedure_type: 'RCT',
  procedure_name: 'Root Canal Treatment',
  steps: [
    {
      step_type: 'PROCEDURE_NAME',
      step_name: 'Procedure Name & Information',
      is_mandatory: true,
    },
    {
      step_type: 'TOOTH_NUMBER',
      step_name: 'Tooth Number',
      is_mandatory: true,
    },
    {
      step_type: 'CLINICAL_PHOTO_INITIAL',
      step_name: 'Clinical Photo Initial - Part 1 (First Day)',
      is_mandatory: true,
    },
    {
      step_type: 'CLINICAL_PHOTO_INITIAL',
      step_name: 'Intra Oral PA - xray',
      is_mandatory: true,
      parent_step_type: 'CLINICAL_PHOTO_INITIAL',
    },
    {
      step_type: 'CLINICAL_PHOTO_FOLLOWUP',
      step_name: 'Clinical Photo - Follow Up',
      is_mandatory: true,
    },
    {
      step_type: 'CLINICAL_PHOTO_FOLLOWUP',
      step_name: 'IOPA - x ray',
      is_mandatory: true,
      parent_step_type: 'CLINICAL_PHOTO_FOLLOWUP',
    },
    {
      step_type: 'CLINICAL_PHOTO_FOLLOWUP',
      step_name: 'PUS drainage',
      is_mandatory: true,
      parent_step_type: 'CLINICAL_PHOTO_FOLLOWUP',
    },
    {
      step_type: 'WORKING_LENGTH',
      step_name: 'Working Length',
      is_mandatory: true,
    },
    {
      step_type: 'WORKING_LENGTH',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'WORKING_LENGTH',
    },
    {
      step_type: 'MASTER_CONE',
      step_name: 'Master Cone',
      is_mandatory: true,
    },
    {
      step_type: 'MASTER_CONE',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'MASTER_CONE',
    },
    {
      step_type: 'BEFORE_FILLING',
      step_name: 'Before Filling',
      is_mandatory: true,
    },
    {
      step_type: 'BEFORE_FILLING',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'BEFORE_FILLING',
    },
    {
      step_type: 'AFTER_FILLING',
      step_name: 'After Filling',
      is_mandatory: true,
    },
    {
      step_type: 'AFTER_FILLING',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'AFTER_FILLING',
    },
  ],
}

/**
 * Scaling procedure definition
 */
export const SCALING_PROCEDURE: ProcedureDefinition = {
  procedure_type: 'SCALING',
  procedure_name: 'Scaling',
  steps: [
    {
      step_type: 'BEFORE_SCALING',
      step_name: 'Before Scaling',
      is_mandatory: true,
    },
    {
      step_type: 'AFTER_SCALING',
      step_name: 'After Scaling',
      is_mandatory: true,
    },
  ],
}

/**
 * Extraction procedure definition
 */
export const EXTRACTION_PROCEDURE: ProcedureDefinition = {
  procedure_type: 'EXTRACTION',
  procedure_name: 'Extraction',
  steps: [
    {
      step_type: 'TOOTH_NUMBER',
      step_name: 'Tooth Number',
      is_mandatory: true,
    },
    {
      step_type: 'BEFORE_EXTRACTION',
      step_name: 'Before Clinical Photo',
      is_mandatory: true,
    },
    {
      step_type: 'BEFORE_EXTRACTION',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'BEFORE_EXTRACTION',
    },
    {
      step_type: 'FLAP_RAISED',
      step_name: 'FLAP raised photo',
      is_mandatory: true,
    },
    {
      step_type: 'ALVEOPLASTY',
      step_name: 'Alveoplasty',
      is_mandatory: true,
    },
    {
      step_type: 'BONE_AUGMENTATION',
      step_name: 'Bone Augmentation',
      is_mandatory: true,
    },
    {
      step_type: 'AFTER_EXTRACTION',
      step_name: 'After extraction Photo',
      is_mandatory: true,
    },
    {
      step_type: 'AFTER_EXTRACTION',
      step_name: 'IOPA - xray',
      is_mandatory: true,
      parent_step_type: 'AFTER_EXTRACTION',
    },
    {
      step_type: 'DRESSING',
      step_name: 'Dressing of the wound',
      is_mandatory: true,
    },
  ],
}

/**
 * All procedure definitions
 */
export const PROCEDURE_DEFINITIONS: Record<ProcedureType, ProcedureDefinition> = {
  RCT: RCT_PROCEDURE,
  SCALING: SCALING_PROCEDURE,
  EXTRACTION: EXTRACTION_PROCEDURE,
}

/**
 * Get procedure definition by type
 */
export function getProcedureDefinition(
  procedureType: ProcedureType
): ProcedureDefinition {
  const definition = PROCEDURE_DEFINITIONS[procedureType]
  if (!definition) {
    throw new Error(`Unknown procedure type: ${procedureType}`)
  }
  return definition
}

/**
 * Get mandatory steps for a procedure type
 */
export function getMandatorySteps(procedureType: ProcedureType): StepType[] {
  const definition = getProcedureDefinition(procedureType)
  return definition.steps
    .filter((step) => step.is_mandatory && !step.parent_step_type)
    .map((step) => step.step_type)
}

/**
 * Get all steps (including nested) for a procedure type
 */
export function getAllSteps(procedureType: ProcedureType): ProcedureStepDefinition[] {
  return getProcedureDefinition(procedureType).steps
}

