import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    console.error(exception);
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2000':
          status = HttpStatus.BAD_REQUEST;
          message = 'Input value too long';
          break;

        case 'P2001':
          status = HttpStatus.NOT_FOUND;
          message = 'Record does not exist';
          break;

        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint violation';
          break;

        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;

        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid relation';
          break;

        case 'P2024':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Database connection timeout';
          break;

        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
