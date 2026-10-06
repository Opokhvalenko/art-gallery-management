import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiProperty } from '@nestjs/swagger';

/**
 * Swagger schema for the unified error shape produced by AllExceptionsFilter
 * (common/filters/http-exception.filter.ts). Documentation only — the filter
 * builds the response; these classes describe it for API consumers.
 */
export class ErrorDetailDto {
  @ApiProperty({ example: 'price' })
  field!: string;

  @ApiProperty({ example: 'price must be a positive number' })
  message!: string;
}

export class ErrorBodyDto {
  @ApiProperty({
    enum: ['VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR'],
    example: 'VALIDATION_ERROR',
  })
  code!: string;

  @ApiProperty({ example: 'Request validation failed' })
  message!: string;

  @ApiProperty({
    type: [ErrorDetailDto],
    description: 'Field-level validation errors; empty for non-validation errors',
  })
  details!: ErrorDetailDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorBodyDto })
  error!: ErrorBodyDto;
}

const VALIDATION_ERROR_EXAMPLE = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: [{ field: 'price', message: 'price must be a positive number' }],
  },
};

const NOT_FOUND_EXAMPLE = {
  error: {
    code: 'NOT_FOUND',
    message: 'Artwork with id "cmuuyh1x00000rton7b580ubs" not found',
    details: [],
  },
};

/** 400 in the unified error shape, with a realistic validation example. */
export function ApiValidationErrorResponse(description: string): MethodDecorator {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description,
      example: VALIDATION_ERROR_EXAMPLE,
    }),
  );
}

/** 404 in the unified error shape, with a realistic not-found example. */
export function ApiArtworkNotFoundResponse(): MethodDecorator {
  return applyDecorators(
    ApiNotFoundResponse({
      type: ErrorResponseDto,
      description: 'No artwork with this id',
      example: NOT_FOUND_EXAMPLE,
    }),
  );
}
