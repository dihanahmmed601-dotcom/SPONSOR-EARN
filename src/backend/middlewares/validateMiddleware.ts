import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.ts';

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`, { missingFields: missing }));
    }

    next();
  };
};
