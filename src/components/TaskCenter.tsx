import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import { SponsorTask, UserProfile, TaskCompletion } from '../types';
import {
  Video,
  Download,
  Clock,
  UserPlus,
  Play,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Zap,
  Timer,
  Search,
  History,
  Tag,
  Layers,
  Award,
  XCircle,
  FileText
} from 'lucide-react';

interface TaskCenterProps {
  tasks: SponsorTask[];
  user: UserProfile;
  onTaskCompleted: () => void;
}

export const TaskCenter: React.FC<TaskCenterProps> = ({
  tasks,
  user,
  onTaskCompleted
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [filter, setFilter] = useState<'all' | 'video' | 'install' | 'referral' | 'custom' | 'time_track'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeTask, setActiveTask] = useState<SponsorTask | null>(null);

  // Active Session Timer
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStartedVideo, setHasStartedVideo] = useState<boolean>(false);
  const [proofNote, setProofNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [myHistory, setMyHistory] = useState<TaskCompletion[]>([]);
  const [historySummary, setHistorySummary] = useState<any>(null);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'completed' | 'pending' | 'rejected' | 'expired'>('all');

  const fetchMyHistory = async () => {
    const res = await safeFetchJson('/api/tasks/my-history', {
      headers: { 'x-user-id': user.id }
    });
    if (res.ok && res.data) {
      setMyHistory(res.data.completions || []);
      setHistorySummary(res.data.summary || null);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyHistory();
    }
  }, [activeTab]);

  const startTask = (task: SponsorTask) => {
    setActiveTask(task);
    setSuccessMessage(null);
    setErrorMessage(null);
    setProofNote('');
    setTimerLeft(task.durationSeconds || 0);
    setIsPlaying(false);
    setHasStartedVideo(false);
  };

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft(prev => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timerLeft]);

  const handleClaimReward = async () => {
    if (!activeTask) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await safeFetchJson('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          taskId: activeTask.id,
          proofNote,
          durationWatched: activeTask.durationSeconds ? activeTask.durationSeconds - timerLeft : 0
        })
      });

      if (!res.ok) throw new Error(res.error || 'Failed to validate task completion');

      setSuccessMessage(res.data?.message || 'Task completed successfully');
      onTaskCompleted();
      fetchMyHistory();
      setTimeout(() => {
        setActiveTask(null);
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter available tasks by category and search query
  const filteredAvailableTasks = tasks.filter(t => {
    const matchesCategory = filter === 'all' ? true : t.category === filter;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.sponsorName.toLowerCase().includes(query) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)));

    return matchesCategory && matchesSearch;
  });

  // Filter history items by status
  const filteredHistory = myHistory.filter(h =>
    historyStatusFilter === 'all' ? true : h.status === historyStatusFilter
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Sponsor Reward Engine & Micro-Jobs</span>
            </div>
            <h2 className="text-2xl font-black text-white">Sponsor Tasks & Earned Wallet</h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete validated video watching, app downloads, and referral sprints to earn withdrawable rewards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Earned Wallet</span>
              <span className="text-xl font-extrabold text-amber-400">৳{user.wallets.earnedBalance.toLocaleString()} BDT</span>
            </div>
          </div>
        </div>

        {/* View Switcher: Available Tasks vs My History */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'available'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Tasks ({filteredAvailableTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Task History & Rewards</span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab === 'available' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, tag, sponsor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        {activeTab === 'available' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { id: 'all', label: 'All Tasks', icon: Layers },
              { id: 'video', label: 'Watch Video', icon: Video },
              { id: 'install', label: 'App Install', icon: Download },
              { id: 'referral', label: 'Referral Task', icon: UserPlus },
              { id: 'custom', label: 'Custom Task', icon: Sparkles },
              { id: 'time_track', label: 'Session Tracking', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-amber-400 border border-amber-400/50'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW 1: AVAILABLE TASKS GRID */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAvailableTasks.length === 0 ? (
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No active tasks match your search filters.</p>
              <p className="text-xs text-slate-500 mt-1">Check back soon or select a different task category above.</p>
            </div>
          ) : (
            filteredAvailableTasks.map(task => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  <img
                    src={task.imageUrl || task.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                    alt={task.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {task.sponsorName}
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        +৳{task.rewardAmount} BDT
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{task.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{task.description}</p>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tg, idx) => (
                          <span key={idx} className="text-[9px] font-medium text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-slate-500" />
                      {task.durationSeconds > 0 ? `${task.durationSeconds}s` : 'Instant'}
                    </span>
                    <span>• Daily Max: {task.maxDailyPerUser}</span>
                  </div>

                  <button
                    onClick={() => startTask(task)}
                    className="px-4 py-2 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Task</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: TASK HISTORY & REWARDS */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Completed Tasks & Reward Audit Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full ledger of your completed, pending, and rejected task claims with credited transaction IDs.
              </p>
            </div>

            {historySummary && (
              <div className="flex gap-2">
                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Total Completed</span>
                  <span className="text-sm font-extrabold text-emerald-400">{historySummary.totalCompleted}</span>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Total Rewards</span>
                  <span className="text-sm font-extrabold text-amber-400">৳{historySummary.totalRewardsEarned}</span>
                </div>
              </div>
            )}
          </div>

          {/* History Status Filters */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {['all', 'completed', 'pending', 'rejected', 'expired'].map(st => (
              <button
                key={st}
                onClick={() => setHistoryStatusFilter(st as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  historyStatusFilter === st
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Task Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Reward</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Completion Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                      No task completion history records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-white max-w-xs truncate">{item.taskTitle}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category || 'task'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">+৳{item.rewardEarned} BDT</td>
                      <td className="p-3 font-sans text-amber-400 uppercase text-[10px]">{item.walletType || 'earned'}</td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">{new Date(item.completedAt).toLocaleString()}</td>
                      <td className="p-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px]">{item.txId || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TASK EXECUTION MODAL / OVERLAY */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {activeTask.sponsorName}
                </span>
                <span className="text-xs font-bold text-emerald-400">+৳{activeTask.rewardAmount} BDT Reward</span>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">{activeTask.title}</h3>
            <p className="text-xs text-slate-300">{activeTask.description}</p>

            {/* VIDEO & TIME TRACK TASK PLAYER */}
            {(activeTask.category === 'video' || activeTask.category === 'time_track' || activeTask.videoUrl) && (() => {
              const videoSrc = activeTask.videoUrl?.trim() || activeTask.linkUrl?.trim() || '';

              const handleStartExternalVideo = () => {
                if (videoSrc) {
                  window.open(videoSrc, '_blank');
                }
                setHasStartedVideo(true);
                setIsPlaying(true);
              };

              const handleReopenVideo = () => {
                if (videoSrc) {
                  window.open(videoSrc, '_blank');
                }
              };

              return (
                <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                  {!hasStartedVideo ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center border border-slate-800 p-4">
                      <img
                        src={activeTask.imageUrl || activeTask.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                        alt={activeTask.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                      <div className="relative z-10 space-y-3 text-center max-w-sm mx-auto">
                        <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full inline-block">
                          Sponsor Video Task ({activeTask.durationSeconds || 30}s Watch)
                        </span>

                        <h4 className="text-sm font-bold text-white max-w-xs mx-auto line-clamp-1">{activeTask.title}</h4>

                        <button
                          onClick={handleStartExternalVideo}
                          className="px-6 py-3 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-950" />
                          <span>Watch Video & Start Timer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl text-center space-y-3">
                      <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/30">
                        <ExternalLink className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">External Video Session Active</h4>
                        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                          We opened the video link in your browser / app. Watch the required duration to unlock your reward.
                        </p>
                      </div>

                      <div className="flex items-center justify-center pt-1">
                        <button
                          onClick={handleReopenVideo}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Re-open Video URL</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timer & Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-slate-400">
                        {timerLeft === 0 ? '✅ Required Watch Time Completed' : 'Required Watch Timer'}
                      </span>
                      <span className="text-amber-400 text-sm">{timerLeft}s Remaining</span>
                    </div>
                    {activeTask.durationSeconds > 0 && (
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((activeTask.durationSeconds - timerLeft) / activeTask.durationSeconds) * 100))}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* APP INSTALL TASK VIEW */}
            {activeTask.category === 'install' && (
              <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                  <img
                    src={activeTask.appIcon || activeTask.thumbnail}
                    alt={activeTask.appName || activeTask.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{activeTask.appName || activeTask.title}</h4>
                    <span className="text-[10px] text-amber-400 font-semibold">Play Store Verified Sponsor App</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  1. Click below to install the sponsor application from Play Store.
                  <br />
                  2. Open the app and enter your registered phone number below as proof note.
                </p>

                {activeTask.linkUrl && (
                  <a
                    href={activeTask.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full text-xs font-bold text-amber-400 hover:underline bg-amber-500/10 py-2.5 rounded-xl border border-amber-500/20"
                  >
                    <span>Open Play Store App Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Proof Note (e.g. your registered phone number / account ID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +8801811111111"
                    value={proofNote}
                    onChange={e => setProofNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* REFERRAL TASK VIEW */}
            {activeTask.category === 'referral' && (
              <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Required Referral Count:</span>
                  <span className="text-amber-400">{activeTask.requiredReferralCount || 3} Friends</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Your Current Referrals:</span>
                  <span className="font-bold text-emerald-400">{user.referralCount} Verified Members</span>
                </div>

                {user.referralCount < (activeTask.requiredReferralCount || 3) ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                    You need { (activeTask.requiredReferralCount || 3) - user.referralCount } more verified referral(s) to unlock this reward. Share your referral link from Referral Center!
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Referral requirements satisfied! Click below to claim your reward.</span>
                  </div>
                )}
              </div>
            )}

            {/* CUSTOM TASK VIEW */}
            {activeTask.category === 'custom' && (
              <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-amber-400 block mb-1">Sponsor Instructions:</span>
                  {activeTask.instructions || 'Complete the sponsor task as described.'}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Proof Note / Activity Confirmation
                  </label>
                  <input
                    type="text"
                    placeholder="Enter completion details or confirmation note"
                    value={proofNote}
                    onChange={e => setProofNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Error / Success Banners */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Claim Action */}
            <button
              onClick={handleClaimReward}
              disabled={
                submitting ||
                ((activeTask.category === 'video' || activeTask.category === 'time_track') && activeTask.durationSeconds > 0 && timerLeft > 0)
              }
              className={`w-full py-3 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                (activeTask.category === 'video' || activeTask.category === 'time_track') && activeTask.durationSeconds > 0 && timerLeft > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-400/20 hover:scale-[1.02]'
              }`}
            >
              {submitting ? (
                'Validating Reward Engine...'
              ) : (activeTask.category === 'video' || activeTask.category === 'time_track') && activeTask.durationSeconds > 0 && timerLeft > 0 ? (
                `Complete ${timerLeft}s Session to Unlock Claim`
              ) : (
                `Claim ৳${activeTask.rewardAmount} BDT Reward`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
