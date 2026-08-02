import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, TokenPayload } from '../utils/crypto.ts';
import { ApiError } from '../utils/ApiError.ts';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Bearer token'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyJwtToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired authentication token'));
  }
};
