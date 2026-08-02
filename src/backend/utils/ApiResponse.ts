import { Response } from 'express';

export interface MetaData {
  page?: number;
  limit?: number;
  totalRecords?: number;
  totalPages?: number;
  [key: string]: any;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    meta?: MetaData,
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
      meta,
      timestamp: new Date().toISOString()
    });
  }

  static created<T>(res: Response, message: string, data?: T) {
    return this.success(res, message, data, undefined, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ?? null,
      timestamp: new Date().toISOString()
    });
  }
}
