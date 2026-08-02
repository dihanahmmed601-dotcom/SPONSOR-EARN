import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.ts';
import { ApiError } from '../utils/ApiError.ts';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User identity not verified'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to perform this action`));
    }

    next();
  };
};
