import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile, ReferralStat, ReferralRecord } from '../types';
import {
  UserPlus,
  Copy,
  Check,
  Trophy,
  Users,
  Gift,
  Share2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Award,
  List
} from 'lucide-react';

interface ReferralCenterProps {
  user: UserProfile;
}

export const ReferralCenter: React.FC<ReferralCenterProps> = ({ user }) => {
  const [stats, setStats] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'rewards' | 'leaderboard'>('team');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'alltime' | 'monthly'>('alltime');

  useEffect(() => {
    safeFetchJson('/api/referral/stats', {
      headers: { 'x-user-id': user.id }
    })
      .then(res => {
        if (res.ok && res.data) setStats(res.data);
      })
      .catch(err => console.error(err));
  }, [user.id]);

  const handleCopyCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const link = stats?.referralLink || `https://earningplatform.com?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mb-2 border border-purple-500/20">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sponsor Referral Network</span>
            </div>
            <h2 className="text-2xl font-black text-white">Referral Hub & Commission Center</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Share your unique referral link or code. Earn +৳{stats?.settings?.rewardAmount || 50} BDT for every verified member who joins through your network!
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Total Referral Reward</span>
            <span className="text-2xl font-black text-emerald-400">
              ৳{stats?.totalReferralReward || 0} BDT
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link & Unique Code Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Referral Code Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              Unique Referral Code
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Unique Verified</span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xl font-mono font-black text-amber-400 tracking-widest">
              {user.referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Share Link Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-purple-400" />
              Direct Referral Link
            </span>
            <span className="text-[10px] text-purple-400 font-mono">One-Click Auto-Fill</span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 gap-2">
            <span className="text-xs font-mono text-slate-400 truncate">
              {stats?.referralLink || `https://earningplatform.com?ref=${user.referralCode}`}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REFERRAL DASHBOARD KPI STATS (6-Card Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Total Referrals</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-xl font-black text-white">{stats?.totalReferred || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Active Referrals</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-black text-emerald-400">{stats?.activeReferred || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Inactive Referrals</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-xl font-black text-slate-400">{stats?.inactiveReferred || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Today's Referral</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-black text-amber-400">{stats?.todayReferred || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Monthly Referral</span>
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xl font-black text-blue-400">{stats?.monthlyReferred || 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Total Rewards</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-black text-emerald-400">৳{stats?.totalReferralReward || 0}</span>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'team'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Referral List ({stats?.teamMembers?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Reward History & Transactions</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Referral Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Referral List */}
      {activeTab === 'team' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Directly Referred Members</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Reward per referral: <strong className="text-emerald-400">৳{stats?.settings?.rewardAmount || 50} BDT</strong>
            </span>
          </div>

          {!stats?.teamMembers || stats.teamMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              You haven't referred any members yet. Share your unique code to start earning!
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {stats.teamMembers.map((m: any) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-purple-300 font-bold flex items-center justify-center text-sm border border-slate-700">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Phone: {m.phone}</span>
                        <span>•</span>
                        <span>Joined: {m.registrationDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {m.verificationStatus}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +৳{stats?.settings?.rewardAmount || 50} Credited
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Referral Reward History & Transactions */}
      {activeTab === 'rewards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Referral Reward Audit Logs & Transactions</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Validated & Credited Entries</span>
          </div>

          {!stats?.referralRecords || stats.referralRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No referral reward transaction entries recorded yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {stats.referralRecords.map((r: ReferralRecord) => (
                <div
                  key={r.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                        Reward ID: {r.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        TxID: {r.txId}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Referred User: {r.referredUserName} ({r.referredUserPhone})</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Date: {new Date(r.rewardDate).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-400">
                      +৳{r.rewardAmount} BDT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top Referrers Leaderboard</span>
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setLeaderboardFilter('alltime')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  leaderboardFilter === 'alltime' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                All-Time
              </button>
              <button
                onClick={() => setLeaderboardFilter('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  leaderboardFilter === 'monthly' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {(stats?.leaderboard || []).map((lb: ReferralStat) => (
              <div
                key={lb.userId}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      lb.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : lb.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : lb.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{lb.rank}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{lb.userName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Code: {lb.referralCode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-purple-400">
                    {lb.totalReferredCount} Referrals
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    +৳{lb.totalCommissionsEarned} BDT Earned
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

