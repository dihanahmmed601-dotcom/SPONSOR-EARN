import { WalletRepository } from '../repositories/WalletRepository.ts';

export class WalletService {
  static async getSummary(userId: string) {
    const wallet = await WalletRepository.getWalletByUserId(userId);
    return wallet;
  }

  static async getTransactions(userId: string, limit = 20, offset = 0) {
    const transactions = await WalletRepository.getTransactionsByUserId(userId, limit, offset);
    return transactions;
  }
}
