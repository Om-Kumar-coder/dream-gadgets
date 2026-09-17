import { BadRequestException } from '@nestjs/common';

/**
 * GSTIN validation for GST-registered branches.
 *
 * A branch that is marked GST-registered must have a valid GSTIN stored.
 * If a branch is not GST-registered, GSTIN should be empty/undefined/null.
 */

export interface BranchGstinRule {
  /** If true, the branch is treated as GST-registered and must have a valid GSTIN. */
  isGstRegistered: boolean;
  gstin: string | null | undefined;
}

export const GSTIN_FORMAT = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/;

export function validateGstinForRegisteredBranch(input: BranchGstinRule): string | null {
  if (!input.isGstRegistered) {
    return null; // not registered → GSTIN not required
  }

  const value = (input.gstin ?? '').trim();

  if (!value) {
    return 'GSTIN is required for GST-registered branches';
  }

  if (!GSTIN_FORMAT.test(value)) {
    return 'GSTIN format is invalid';
  }

  return null;
}

/**
 * Throws a structured BadRequestException when a registered branch has an invalid/missing GSTIN.
 */
export function requireValidGstinForRegisteredBranch(input: BranchGstinRule): void {
  const error = validateGstinForRegisteredBranch(input);
  if (error) {
    throw new BadRequestException({
      code: 'BRANCH_GSTIN_INVALID',
      message: error,
    });
  }
}
