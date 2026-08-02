import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phone, fullName } = req.body;
      const result = await AuthService.register(email, phone, fullName);
      return ApiResponse.created(res, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.login(email);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, 'Logout successful', null);
    } catch (error) {
      next(error);
    }
  }
}
