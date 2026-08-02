import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile, TierConfig, TierLevel } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Wallet,
  AlertCircle,
  Sparkles,
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface TierVerificationProps {
  user: UserProfile;
  onVerificationSubmitted: () => void;
}

export const TierVerification: React.FC<TierVerificationProps> = ({
  user,
  onVerificationSubmitted
}) => {
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [selectedTier, setSelectedTier] = useState<TierLevel>('Bronze');
  const [nidOrPassport, setNidOrPassport] = useState<string>('');
  const [documentPhotoUrl, setDocumentPhotoUrl] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    safeFetchJson('/api/plans/all').then(res => {
      if (res.ok && res.data?.plans && res.data.plans.length > 0) {
        const activePlans = res.data.plans.filter((p: any) => p.status === 'Active' || p.status === 'Published');
        if (activePlans.length > 0) {
          const mapped = activePlans.map((p: any) => ({
            name: p.tierName || p.name,
            securityDeposit: p.refundableSecurityDeposit,
            maxSingleWithdrawal: p.maxSingleWithdrawal,
            benefits: p.benefits || []
          }));
          setTiers(mapped);
          if (mapped.length > 0) {
            setSelectedTier(mapped[0].name);
          }
          return;
        }
      }
      return safeFetchJson('/api/tiers').then(res2 => {
        if (res2.ok && res2.data?.tiers) {
          setTiers(res2.data.tiers);
          if (res2.data.tiers.length > 0) {
            setSelectedTier(res2.data.tiers[0].name);
          }
        }
      });
    }).catch(err => console.error(err));
  }, []);

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const activeTierName = selectedTier || (tiers.length > 0 ? tiers[0].name : 'Bronze');
    const config = tiers.find(t => t.name.toLowerCase() === activeTierName.toLowerCase()) || tiers[0];
    
    if (!config) {
      setError('Please select a valid verification tier.');
      return;
    }

    if (user.wallets.depositBalance < config.securityDeposit) {
      setError(
        `Insufficient Deposit Wallet balance. You need ৳${config.securityDeposit.toLocaleString()} BDT in your Deposit Wallet to apply for ${config.name} Tier verification. Please top up your Deposit Wallet first.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tiers/verify-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          targetTier: config.name,
          nidOrPassport,
          documentPhotoUrl
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit verification request');

      setMessage(data.message);
      onVerificationSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Identity & Tier Verification</span>
            </div>
            <h2 className="text-2xl font-black text-white">ID Verification & Refundable Security Deposit</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your desired earning tier. Security Deposits are 100% Refundable and locked safely in your Security Wallet during your verified session.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Current Status</span>
            <span className="text-sm font-extrabold text-amber-400">
              {user.verificationStatus} ({user.tierStatus === 'None' ? 'Unverified' : `${user.tierStatus} Tier`})
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Deposit Wallet Policy Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <h4 className="font-bold text-amber-300 uppercase tracking-wide">
            Deposit Wallet Rule for Tier Activation & Upgrade
          </h4>
          <p className="leading-relaxed">
            Tier Activation, Tier Upgrade, and Refundable Security Deposit requests <strong>must use ONLY the Deposit Wallet balance</strong>.
            Earned Wallet balance is strictly reserved for <strong>Withdrawals only</strong>. Bonus Wallet cannot be used for Tier requests.
          </p>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(t => {
          const isCurrentTier = user.tierStatus === t.name;
          const isSelected = selectedTier === t.name;

          return (
            <div
              key={t.name}
              onClick={() => setSelectedTier(t.name)}
              className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-amber-400 shadow-xl shadow-amber-400/10 bg-gradient-to-b from-slate-900 to-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-white">{t.name} Tier</h3>
                  {isCurrentTier && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-amber-400 mb-1">
                  ৳{t.securityDeposit} BDT
                  <span className="text-[10px] text-slate-400 font-normal block">
                    Refundable Deposit
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl text-xs font-mono text-emerald-400 my-3 border border-slate-800">
                  Max Withdrawal: ৳{t.maxSingleWithdrawal.toLocaleString()} BDT
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {t.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isSelected ? 'Selected for Verification' : 'Select Tier'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Verification Submission Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Apply for {selectedTier} Tier Verification</span>
        </h3>

        <form onSubmit={handleApplyVerification} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              National ID / Passport Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NID 8129301923"
              value={nidOrPassport}
              onChange={e => setNidOrPassport(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 mb-3"
            />

            <label className="block text-xs font-medium text-slate-300 mb-1">
              Document Photo / Front Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/nid_front.jpg"
              value={documentPhotoUrl}
              onChange={e => setDocumentPhotoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Deposit Wallet Available:</span>
              <span className="text-emerald-400 font-mono">৳{user.wallets.depositBalance.toLocaleString()} BDT</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Required Security Deposit for {selectedTier}:</span>
              <span className="text-amber-400 font-mono">
                ৳{(tiers.find(t => t.name === selectedTier)?.securityDeposit || 0).toLocaleString()} BDT
              </span>
            </div>
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
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-400/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Processing Lock...' : `Lock Security Deposit & Submit Verification`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
