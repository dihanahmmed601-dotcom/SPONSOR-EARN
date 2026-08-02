import { DepositRepository } from '../repositories/DepositRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class DepositService {
  static async createRequest(userId: string, data: {
    method: string;
    amount: number;
    transactionId: string;
    userPhone: string;
    proofImage?: string;
  }) {
    if (data.amount <= 0) {
      throw ApiError.badRequest('Amount must be greater than zero');
    }
    const fee = data.amount * 0.01; // 1% processing fee
    const netAmount = data.amount - fee;

    const request = await DepositRepository.createRequest({
      userId,
      method: data.method,
      amount: data.amount,
      fee,
      netAmount,
      transactionId: data.transactionId,
      userPhone: data.userPhone,
      proofImage: data.proofImage
    });

    return request;
  }

  static async getHistory(userId: string, limit = 20, offset = 0) {
    return DepositRepository.getHistoryByUserId(userId, limit, offset);
  }

  static async getStatus(id: string) {
    const deposit = await DepositRepository.getById(id);
    if (!deposit) throw ApiError.notFound('Deposit request not found');
    return deposit;
  }
}
