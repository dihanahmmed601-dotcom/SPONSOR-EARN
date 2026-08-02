import React, { useState } from 'react';
import { UserProfile, NoticeBanner, SponsorTask } from '../types';
import { NoticeModal } from './NoticeModal';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Gift,
  Award,
  Video,
  UserPlus,
  Zap,
  ChevronRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Megaphone,
  Lock,
  Pin,
  Layers
} from 'lucide-react';

interface HomeDashboardProps {
  user: UserProfile;
  notices: NoticeBanner[];
  tasks: SponsorTask[];
  onNavigate: (tab: string) => void;
  onOpenNotice?: (noticeId?: string, mode?: 'detail' | 'list') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  notices,
  tasks,
  onNavigate,
  onOpenNotice
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'list'>('detail');

  const handleNoticeClick = (noticeId?: string, mode: 'detail' | 'list' = 'detail') => {
    if (onOpenNotice) {
      onOpenNotice(noticeId, mode);
    } else {
      setSelectedNoticeId(noticeId || (notices.length > 0 ? notices[0].id : null));
      setModalMode(mode);
      setModalOpen(true);
    }
  };

  const topNotice = notices.length > 0 ? notices[0] : null;

  // Helper function to truncate notice text to 75 chars cleanly
  const getNoticeSnippet = (text: string, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Notice & Announcement Bar */}
      {topNotice && (
        <div 
          onClick={() => handleNoticeClick(topNotice.id, 'detail')}
          className="group bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-4 transition-all duration-300 shadow-lg shadow-amber-500/5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Megaphone className="w-4 h-4 animate-bounce" />
              </div>
              <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                {topNotice.isPinned && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5 fill-slate-950" />
                    PINNED
                  </span>
                )}
                {topNotice.type === 'announcement' ? 'Official Announcement' : 'Notice'}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNoticeClick(undefined, 'list');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              View All ({notices.length})
            </button>
          </div>

          <div className="pl-1">
            <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
              {topNotice.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {getNoticeSnippet(topNotice.content)}
              <span className="text-amber-400 font-bold ml-1 hover:underline inline-flex items-center gap-0.5">
                ...Read More <ChevronRight className="w-3 h-3" />
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Internal Notice Modal Fallback if parent doesn't handle */}
      {!onOpenNotice && (
        <NoticeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          notices={notices}
          initialNoticeId={selectedNoticeId}
          initialMode={modalMode}
        />
      )}

      {/* User Profile Card Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                {user.name.charAt(0)}
              </div>
              {user.verificationStatus === 'Verified' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
                <span className="text-xs font-mono text-slate-400">({user.referralCode})</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.phone} • {user.email}</p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    user.verificationStatus === 'Verified'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  Status: {user.verificationStatus}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Tier: {user.tierStatus === 'None' ? 'Unverified' : `${user.tierStatus} Tier`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to Verification */}
          {user.verificationStatus !== 'Verified' && (
            <button
              onClick={() => onNavigate('verification')}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify ID & Unlock Withdrawals</span>
            </button>
          )}
        </div>
      </div>

      {/* THE FOUR SEPARATE WALLETS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Four Wallet Accounts (Strictly Separated)</span>
          </h3>
          <button
            onClick={() => onNavigate('wallets')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Bonus Wallet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">1. Bonus Wallet</span>
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300">
              ৳{user.wallets.bonusBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              Signup welcome bonus. Non-withdrawable.
            </p>
          </div>

          {/* 2. Earned Wallet */}
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 hover:border-amber-500/50 transition-colors relative overflow-hidden shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
              <span className="font-bold">2. Earned Wallet</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              ৳{user.wallets.earnedBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-300 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              Task & referral earnings. Reserved ONLY for Withdrawals.
            </p>
          </div>

          {/* 3. Deposit Wallet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">3. Deposit Wallet</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ৳{user.wallets.depositBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              User-deposited funds. Used ONLY for Tier Activation & Upgrades.
            </p>
          </div>

          {/* 4. Security Wallet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">4. Security Wallet</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">
              ৳{user.wallets.securityBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Refundable Security Deposit held safely.
            </p>
          </div>
        </div>
      </div>

      {/* Income Summary & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Total Income</span>
          <span className="text-lg font-bold text-white">৳{user.totalEarnings.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Today's Income</span>
          <span className="text-lg font-bold text-amber-400">৳{user.todayEarnings.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Tasks Completed</span>
          <span className="text-lg font-bold text-white">{user.completedTasksCount}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Active Referrals</span>
          <span className="text-lg font-bold text-emerald-400">{user.referralCount} Users</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('tasks')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Sponsor Tasks</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Watch videos & earn</p>
        </button>

        <button
          onClick={() => onNavigate('deposit')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Deposit Wallet</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">bKash, Nagad, Rocket</p>
        </button>

        <button
          onClick={() => onNavigate('withdrawal')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Withdraw Earnings</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Fast mobile payout</p>
        </button>

        <button
          onClick={() => onNavigate('referral')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Refer & Earn</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">৳50 per active friend</p>
        </button>
      </div>

      {/* Featured Sponsor Tasks Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Top Available Sponsor Tasks</span>
          </h3>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tasks.slice(0, 2).map(task => (
            <div
              key={task.id}
              onClick={() => onNavigate('tasks')}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all group"
            >
              <img
                src={task.thumbnail}
                alt={task.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                      {task.sponsorName}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      +৳{task.rewardAmount} BDT
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1">{task.title}</h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {task.durationSeconds > 0 ? `${task.durationSeconds}s session` : 'Instant Task'}
                  </span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Start Task →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
