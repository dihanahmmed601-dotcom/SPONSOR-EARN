import { WithdrawalRepository } from '../repositories/WithdrawalRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class WithdrawalService {
  static async createRequest(userId: string, data: {
    method: string;
    accountNumber: string;
    amount: number;
  }) {
    if (data.amount < 100) {
      throw ApiError.badRequest('Minimum withdrawal amount is $100');
    }

    const charge = data.amount * 0.02; // 2% charge
    const netAmount = data.amount - charge;

    const request = await WithdrawalRepository.createRequest({
      userId,
      method: data.method,
      accountNumber: data.accountNumber,
      amount: data.amount,
      charge,
      netAmount
    });

    return request;
  }

  static async getHistory(userId: string, limit = 20, offset = 0) {
    return WithdrawalRepository.getHistoryByUserId(userId, limit, offset);
  }

  static async getStatus(id: string) {
    const withdrawal = await WithdrawalRepository.getById(id);
    if (!withdrawal) throw ApiError.notFound('Withdrawal request not found');
    return withdrawal;
  }
}
