import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile, WithdrawalRequest, PaymentMethod, PaymentGatewayConfig } from '../types';
import {
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  XCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface WithdrawalSectionProps {
  user: UserProfile;
  onWithdrawalSubmitted: () => void;
  onNavigateToVerification: () => void;
}

export const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({
  user,
  onWithdrawalSubmitted,
  onNavigateToVerification
}) => {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [amount, setAmount] = useState<number>(500);
  const [accountNumber, setAccountNumber] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = async () => {
    const res = await safeFetchJson('/api/payment-gateways');
    if (res.ok && res.data?.gateways && res.data.gateways.length > 0) {
      setGateways(res.data.gateways);
      const activeGw = res.data.gateways.find((g: any) => g.id === method) || res.data.gateways[0];
      if (activeGw) setMethod(activeGw.id as PaymentMethod);
    }
  };

  const fetchHistory = async () => {
    const res = await safeFetchJson('/api/withdrawals/my-withdrawals', {
      headers: { 'x-user-id': user.id }
    });
    if (res.ok && res.data?.withdrawals) {
      setHistory(res.data.withdrawals);
    }
  };

  useEffect(() => {
    fetchGateways();
    fetchHistory();
  }, [user.id]);

  const selectedGw = gateways.find(g => g.id === method || g.name === method);

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!accountNumber.trim()) {
      setError('Please enter your mobile payment account number.');
      return;
    }

    const min = selectedGw?.minWithdrawal || 100;
    if (amount < min) {
      setError(`Minimum withdrawal for ${method} is ৳${min} BDT.`);
      return;
    }

    setLoading(true);

    try {
      const res = await safeFetchJson('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method,
          accountNumber
        })
      });

      if (!res.ok) throw new Error(res.error || 'Failed to submit withdrawal request');

      setMessage(res.data?.message || 'Withdrawal requested');
      setAccountNumber('');
      fetchHistory();
      onWithdrawalSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Earned Wallet Payouts</span>
            </div>
            <h2 className="text-2xl font-black text-white">Withdraw Task & Referral Earnings</h2>
            <p className="text-xs text-slate-400 mt-1">
              Request express mobile wallet payouts via bKash, Nagad, or Rocket directly from your Earned Wallet.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Available Earned Wallet</span>
            <span className="text-xl font-extrabold text-amber-400">৳{user.wallets.earnedBalance.toLocaleString()} BDT</span>
          </div>
        </div>
      </div>

      {/* Active Tier & Withdrawal Limit Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active Account Tier:</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-bold text-xs uppercase">
                {user.tierStatus && user.tierStatus !== 'None' && user.tierStatus !== 'Unverified'
                  ? user.tierStatus
                  : user.verificationStatus === 'Verified'
                  ? 'Bronze'
                  : 'Free'} Tier
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {user.verificationStatus === 'Verified'
                ? 'Your ID verification is active. Tier limits are automatically synchronized.'
                : 'Complete Tier ID Verification to unlock withdraw functionality.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Max Single Withdrawal</span>
          <span className="text-base font-black text-emerald-400">
            ৳{(
              user.maxSingleWithdrawal && user.maxSingleWithdrawal > 0
                ? user.maxSingleWithdrawal
                : user.activeTierInfo?.maxSingleWithdrawal && user.activeTierInfo.maxSingleWithdrawal > 0
                ? user.activeTierInfo.maxSingleWithdrawal
                : user.verificationStatus === 'Verified'
                ? ({
                    'Bronze': 2000,
                    'Silver': 5000,
                    'Gold': 10000,
                    'Diamond': 15000,
                    'VIP': 25000
                  }[user.tierStatus || 'Bronze'] || 2000)
                : 0
            ).toLocaleString()} BDT
          </span>
        </div>
      </div>

      {/* Verification Check Warning Banner */}
      {user.verificationStatus !== 'Verified' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                ID Verification Required
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                According to platform business rules, withdrawals are unlocked after completing Tier Verification.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToVerification}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            Complete ID Verification
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Select Payout Gateway</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {(gateways.length > 0 ? gateways.map(g => g.name) : ['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map(pm => (
              <button
                key={pm}
                type="button"
                onClick={() => setMethod(pm as PaymentMethod)}
                className={`p-3 rounded-2xl border text-xs font-extrabold transition-all text-center cursor-pointer ${
                  method === pm
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          {selectedGw && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between">
              <span>{method} Payout Limits:</span>
              <span className="font-mono text-amber-400 font-bold">Min ৳{selectedGw.minWithdrawal} - Max ৳{selectedGw.maxWithdrawal}</span>
            </div>
          )}

          <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {method} Personal Mobile Number
              </label>
              <input
                type="text"
                required
                placeholder="01700000000"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Withdrawal Amount (BDT)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      amount === amt
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={100}
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || user.verificationStatus !== 'Verified'}
              className={`w-full py-3 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer ${
                user.verificationStatus !== 'Verified'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {loading ? 'Submitting Request...' : 'Request Payout'}
            </button>
          </form>
        </div>

        {/* Withdrawal History Sidebar */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Withdrawal Payout History</span>
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No withdrawal requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {history.map(w => (
                <div
                  key={w.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{w.method} ({w.accountNumber})</span>
                    <span className="text-xs font-black text-amber-400">৳{w.amount} BDT</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>TxID: {w.transactionId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : w.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {w.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {new Date(w.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
