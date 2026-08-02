import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Megaphone,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  notifications: AppNotification[];
  unreadCount: number;
  onRefreshNotifications: () => void;
  onNavigate?: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  userId,
  notifications,
  unreadCount,
  onRefreshNotifications,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcement' | 'finance' | 'reward'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  if (!isOpen) return null;

  // Request Web Push Notification Permission
  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission === 'granted') {
          // Register token in backend
          await safeFetchJson('/api/notifications/register-fcm-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify({
              fcmToken: `web_push_token_${userId}_${Date.now()}`,
              token: `web_push_token_${userId}_${Date.now()}`
            })
          });

          // Trigger a sample web push notification
          new Notification('Push Notifications Active! 🚀', {
            body: 'You will now receive instant push updates for broadcasts, deposit approvals, and daily rewards.',
            icon: '/favicon.ico'
          });
        }
      } catch (e) {
        console.error('Push permission error:', e);
      }
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await safeFetchJson('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({ notificationId: notif.id })
        });
        onRefreshNotifications();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Click notification to view detail
  const handleOpenDetail = (notif: AppNotification) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      handleMarkAsRead(notif);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await safeFetchJson('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await safeFetchJson('/api/notifications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ notificationId: id })
      });
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'announcement') return n.type === 'announcement';
    if (filter === 'finance') return n.type === 'deposit' || n.type === 'withdrawal';
    if (filter === 'reward') return n.type === 'reward' || n.type === 'task';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'reward':
      case 'task':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      default:
        return <Info className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Announcement</span>;
      case 'deposit':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Deposit</span>;
      case 'withdrawal':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Withdrawal</span>;
      case 'reward':
      case 'task':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Reward</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">System</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Notification History</h2>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Push broadcasts, task updates, deposit approvals, and system notices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable Notification Sound' : 'Enable Notification Sound'}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Web Push Banner / Controls Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Web Push Alerts:</span>
            {pushPermission === 'granted' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Enabled
              </span>
            ) : (
              <button
                onClick={handleEnablePush}
                className="text-amber-400 hover:underline font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 transition-all cursor-pointer"
              >
                + Enable Push Notifications
              </button>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search notification title or message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'unread'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('announcement')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'announcement'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Broadcasts
            </button>
            <button
              onClick={() => setFilter('finance')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'finance'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Finance
            </button>
            <button
              onClick={() => setFilter('reward')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'reward'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Rewards & Tasks
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-slate-400">No notifications found</p>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {filter === 'unread'
                  ? 'You have read all your notifications!'
                  : 'New announcements and broadcast alerts will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleOpenDetail(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                  notif.isRead
                    ? 'bg-slate-950/60 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
                    : 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-500/70'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                )}

                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    notif.type === 'announcement' ? 'bg-amber-500/10 border border-amber-500/20' :
                    notif.type === 'deposit' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                    notif.type === 'withdrawal' ? 'bg-rose-500/10 border border-rose-500/20' :
                    'bg-purple-500/10 border border-purple-500/20'
                  }`}>
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(notif.type)}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 className={`text-sm leading-snug mb-1 ${notif.isRead ? 'font-medium text-slate-200' : 'font-bold text-white'}`}>
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-amber-400 hover:underline font-semibold flex items-center gap-1">
                    Click to read full message &rarr;
                  </span>

                  <button
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Full Message Detail View Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(selectedNotification.type)}
                      <span className="text-[10px] text-slate-500">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {selectedNotification.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Content Body */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedNotification.message}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {selectedNotification.link && onNavigate ? (
                  <button
                    onClick={() => {
                      onNavigate(selectedNotification.link!);
                      setSelectedNotification(null);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Related Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500">Official System Notification</div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteNotification(e, selectedNotification.id)}
                    className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
