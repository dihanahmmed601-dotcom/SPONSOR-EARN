import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const offset = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, offset, search, sortBy, sortOrder };
};
