import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REST API] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms - IP: ${ip}`);
  });

  next();
};
