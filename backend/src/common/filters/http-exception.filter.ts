import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorDetail {
  field: string;
  message: string;
}

interface ErrorBody {
  code: string;
  message: string;
  details: ErrorDetail[];
}

/** Shape thrown by the ValidationPipe's custom exceptionFactory (see main.ts). */
interface StructuredExceptionResponse {
  code: string;
  message: string;
  details?: ErrorDetail[];
}

function isStructuredExceptionResponse(value: unknown): value is StructuredExceptionResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof (value as Record<string, unknown>).code === 'string' &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

function extractMessage(body: unknown): string {
  if (typeof body === 'string') {
    return body;
  }
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as Record<string, unknown>).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(', ');
    }
  }
  return 'Unexpected error';
}

function codeForStatus(status: number): string {
  if (status === HttpStatus.NOT_FOUND) {
    return 'NOT_FOUND';
  }
  if (status === HttpStatus.BAD_REQUEST) {
    return 'VALIDATION_ERROR';
  }
  return 'INTERNAL_ERROR';
}

/**
 * Normalizes every thrown error — Nest's built-in HttpExceptions, our
 * structured validation errors, and anything unexpected — into one
 * response shape: { error: { code, message, details } }.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const errorBody: ErrorBody = isStructuredExceptionResponse(body)
        ? { code: body.code, message: body.message, details: body.details ?? [] }
        : { code: codeForStatus(status), message: extractMessage(body), details: [] };

      response.status(status).json({ error: errorBody });
      return;
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );
    const errorBody: ErrorBody = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: [],
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: errorBody });
  }
}
