import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Preserve existing HttpException status codes and response bodies exactly
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "object" && res !== null) {
        return response.status(status).json(res);
      }

      return response.status(status).json({
        statusCode: status,
        message: res,
      });
    }

    // 2. Convert unhandled PostgreSQL error code 23505 into HTTP 409 Conflict
    if (this.isPostgresUniqueViolation(exception)) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "A duplicate record already exists",
        error: "Conflict",
      });
    }

    // 3. Log unexpected errors server-side without logging sensitive query parameters
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.path}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // 4. Return safe generic HTTP 500 response without leaking internal error details
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }

  private isPostgresUniqueViolation(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const pgError = error as { code?: string; driverError?: { code?: string } };
    return pgError.code === "23505" || pgError.driverError?.code === "23505";
  }
}
