import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[API Error Handler]:', err);

  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Fallback for unhandled exceptions
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return ApiResponse.error(res, message, statusCode);
};
