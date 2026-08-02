import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile, DepositRequest, PaymentMethod, PaymentGatewayConfig } from '../types';
import {
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface DepositSectionProps {
  user: UserProfile;
  onDepositSubmitted: () => void;
}

export const DepositSection: React.FC<DepositSectionProps> = ({ user, onDepositSubmitted }) => {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [amount, setAmount] = useState<number>(500);
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<DepositRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = async () => {
    const res = await safeFetchJson('/api/payment-gateways');
    if (res.ok && res.data?.gateways && res.data.gateways.length > 0) {
      setGateways(res.data.gateways);
      const activeMethod = res.data.gateways.find((g: any) => g.id === method) || res.data.gateways[0];
      if (activeMethod) setMethod(activeMethod.id as PaymentMethod);
    }
  };

  const fetchHistory = async () => {
    const res = await safeFetchJson('/api/deposits/my-deposits', {
      headers: { 'x-user-id': user.id }
    });
    if (res.ok && res.data?.deposits) {
      setHistory(res.data.deposits);
    }
  };

  useEffect(() => {
    fetchGateways();
    fetchHistory();
  }, [user.id]);

  const selectedGateway = gateways.find(g => g.id === method || g.name === method);

  const handleCopyNumber = () => {
    if (!selectedGateway) return;
    navigator.clipboard.writeText(selectedGateway.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const min = selectedGateway?.minDeposit || 100;
    if (!amount || amount < min) {
      setError(`Minimum deposit amount for ${method} is ৳${min} BDT.`);
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter your payment Transaction ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await safeFetchJson('/api/deposits/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method,
          transactionId,
          screenshotUrl,
          proofNote
        })
      });

      if (!res.ok) throw new Error(res.error || 'Failed to submit deposit');

      setMessage(res.data?.message || 'Deposit submitted');
      setTransactionId('');
      setScreenshotUrl('');
      setProofNote('');
      fetchHistory();
      onDepositSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Deposit Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Deposit Wallet Top-Up</span>
            </div>
            <h2 className="text-2xl font-black text-white">Deposit Funds into Deposit Wallet</h2>
            <p className="text-xs text-slate-400 mt-1">
              Deposit funds using bKash, Nagad, or Rocket. Deposit Wallet funds are strictly used for Tier Activation, Tier Upgrades, and Refundable Security Deposit.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Deposit Wallet Balance</span>
            <span className="text-xl font-extrabold text-emerald-400">৳{user.wallets.depositBalance.toLocaleString()} BDT</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deposit Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Select Payment Gateway</span>
          </h3>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-3">
            {(gateways.length > 0 ? gateways.map(g => g.name) : ['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map(pm => (
              <button
                key={pm}
                type="button"
                onClick={() => setMethod(pm as PaymentMethod)}
                className={`p-3 rounded-2xl border text-xs font-extrabold transition-all text-center cursor-pointer ${
                  method === pm
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          {/* Agent Payment Instructions Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{method} {selectedGateway?.accountType || 'Personal'} Number:</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold uppercase px-2 py-0.5 rounded-md">Official Channel</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-sm font-mono font-bold text-white block">{selectedGateway?.accountNumber || '01700000000'}</span>
                <span className="text-[10px] text-slate-400">{selectedGateway?.accountName || 'Official Payment Account'}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {selectedGateway?.qrCodeUrl && (
              <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <img src={selectedGateway.qrCodeUrl} alt="QR Code" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                <div className="text-[11px] text-slate-400">
                  <span className="font-bold text-white block mb-0.5">Scan QR Code</span>
                  <span>Scan with your {method} app to complete payment instantly.</span>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line bg-slate-900/40 p-2.5 rounded-xl">
              {selectedGateway?.instructions || `Send money to the number above using ${method}. Copy the Transaction ID (TxID) and submit below.`}
            </div>
          </div>

          <form onSubmit={handleSubmitDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Deposit Amount (BDT)
                {selectedGateway && <span className="text-[10px] text-slate-500 ml-2">(Min: ৳{selectedGateway.minDeposit} - Max: ৳{selectedGateway.maxDeposit})</span>}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[200, 500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                min={selectedGateway?.minDeposit || 100}
                max={selectedGateway?.maxDeposit || 50000}
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Transaction ID (TxID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9J82K391"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Screenshot / Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/screenshot.jpg"
                value={screenshotUrl}
                onChange={e => setScreenshotUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
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
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {loading ? 'Submitting Deposit...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>

        {/* Deposit History Sidebar */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Deposit History</span>
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No deposit records found yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {history.map(dep => (
                <div
                  key={dep.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dep.method} Deposit</span>
                    <span className="text-xs font-black text-emerald-400">৳{dep.amount} BDT</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>TxID: {dep.transactionId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dep.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : dep.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {dep.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {new Date(dep.createdAt).toLocaleString()}
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
