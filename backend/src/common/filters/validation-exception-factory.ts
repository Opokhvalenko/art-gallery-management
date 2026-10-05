import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/**
 * Turns class-validator's ValidationError[] into the unified error shape
 * (see http-exception.filter.ts) instead of Nest's default flat message
 * array — so the client gets a field-by-field breakdown.
 */
export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
  const details = errors.map((error) => ({
    field: error.property,
    message: Object.values(error.constraints ?? {}).join(', '),
  }));

  return new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details,
  });
}
