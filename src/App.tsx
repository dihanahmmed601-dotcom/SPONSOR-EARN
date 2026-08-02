import React, { useState, useEffect, useRef } from 'react';
import { safeFetchJson } from './utils/api';
import { UserProfile, NoticeBanner, SponsorTask, AppNotification } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { HomeDashboard } from './components/HomeDashboard';
import { TaskCenter } from './components/TaskCenter';
import { DepositSection } from './components/DepositSection';
import { TierVerification } from './components/TierVerification';
import { WithdrawalSection } from './components/WithdrawalSection';
import { ReferralCenter } from './components/ReferralCenter';
import { SupportChat } from './components/SupportChat';
import { AdminPanel } from './components/AdminPanel';
import { FlutterMobileApp } from './components/FlutterMobileApp';
import { QaTestingSuite } from './components/QaTestingSuite';
import { CloudDevOpsSuite } from './components/CloudDevOpsSuite';
import { PerformanceOptimizationSuite } from './components/PerformanceOptimizationSuite';
import {
  Home,
  Video,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  UserPlus,
  Bot,
  Wallet,
  Sliders,
  Sparkles,
  CheckCircle2,
  Lock,
  Bell
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [notices, setNotices] = useState<NoticeBanner[]>([]);
  const [tasks, setTasks] = useState<SponsorTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const prevNotificationsLength = useRef<number>(0);

  const isAdmin = user?.email?.trim().toLowerCase() === 'sponsorearn00@gmail.com' || user?.role === 'admin';

  // Strict RBAC Guard: If not Admin, automatically block developer/admin pages & redirect to User Dashboard
  useEffect(() => {
    const devTabs = ['qa_suite', 'devops', 'optimization'];
    if (!isAdmin) {
      if (isAdminView) {
        setIsAdminView(false);
      }
      if (devTabs.includes(activeTab)) {
        setActiveTab('home');
      }
    }
  }, [isAdminView, activeTab, isAdmin]);

  // Persistent Session Restoration on Mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUserId = localStorage.getItem('auth_user_id');

    if (savedToken && savedUserId) {
      setToken(savedToken);
      safeFetchJson('/api/auth/me', {
        headers: {
          'x-user-id': savedUserId,
          'authorization': `Bearer ${savedToken}`
        }
      }).then(res => {
        if (res.ok && res.data?.user) {
          const u = res.data.user;
          setUser(u);
          const isUserAdmin = u.email?.trim().toLowerCase() === 'sponsorearn00@gmail.com' || u.role === 'admin';
          if (isUserAdmin) {
            setIsAdminView(true);
          } else {
            setIsAdminView(false);
            setActiveTab('home');
          }
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user_id');
        }
      }).catch(err => {
        console.error('Session restoration error:', err);
      });
    }
  }, []);

  // Auto-open Notifications Modal if activeTab is 'notifications'
  useEffect(() => {
    if (activeTab === 'notifications') {
      setIsNotificationsOpen(true);
    }
  }, [activeTab]);

  // Auto-fetch data when user logged in
  const refreshUserData = async () => {
    if (!user) return;
    const res = await safeFetchJson('/api/auth/me', {
      headers: { 'x-user-id': user.id }
    });
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
    }
  };

  const fetchGlobalData = async () => {
    try {
      const [tasksRes, noticesRes, ntfRes] = await Promise.all([
        safeFetchJson('/api/tasks'),
        safeFetchJson('/api/notices'),
        user ? safeFetchJson('/api/notifications', { headers: { 'x-user-id': user.id } }) : Promise.resolve(null)
      ]);

      if (tasksRes.ok && tasksRes.data?.tasks) {
        setTasks(tasksRes.data.tasks);
      }

      if (noticesRes.ok && noticesRes.data?.notices) {
        setNotices(noticesRes.data.notices);
      }

      if (ntfRes && ntfRes.ok && ntfRes.data?.notifications) {
        const ntfData = ntfRes.data;
        setNotifications(ntfData.notifications);
        if (!noticesRes.data?.notices && ntfData.notices) setNotices(ntfData.notices);
        const unread = ntfData.notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);

        // Trigger Web Push Notification if new notification arrived
        if (
          prevNotificationsLength.current > 0 &&
          ntfData.notifications.length > prevNotificationsLength.current
        ) {
          const latest = ntfData.notifications[0];
          if (latest && !latest.isRead && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(latest.title, {
              body: latest.message,
              icon: '/favicon.ico'
            });
          }
        }
        prevNotificationsLength.current = ntfData.notifications.length;
      }
    } catch (e) {
      console.error('Global data fetch error:', e);
    }
  };

  useEffect(() => {
    fetchGlobalData();

    // Set up polling interval for instant notification bell count updates
    let interval: any = null;
    if (user?.id) {
      interval = setInterval(() => {
        fetchGlobalData();
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    setUser(null);
    setToken(null);
    setIsAdminView(false);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* View Routing */}
        {activeTab === 'flutter' ? (
          <FlutterMobileApp user={user} onRefreshUser={refreshUserData} />
        ) : activeTab === 'qa_suite' ? (
          <QaTestingSuite />
        ) : activeTab === 'devops' ? (
          <CloudDevOpsSuite />
        ) : activeTab === 'optimization' ? (
          <PerformanceOptimizationSuite />
        ) : isAdminView && isAdmin ? (
          <AdminPanel
            adminUser={user}
            onNoticeUpdated={refreshUserData}
            onDataRefresh={refreshUserData}
          />
        ) : (
          user && (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  user={user}
                  notices={notices}
                  tasks={tasks}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskCenter
                  tasks={tasks}
                  user={user}
                  onTaskCompleted={refreshUserData}
                />
              )}

              {activeTab === 'deposit' && (
                <DepositSection
                  user={user}
                  onDepositSubmitted={refreshUserData}
                />
              )}

              {activeTab === 'verification' && (
                <TierVerification
                  user={user}
                  onVerificationSubmitted={refreshUserData}
                />
              )}

              {activeTab === 'withdrawal' && (
                <WithdrawalSection
                  user={user}
                  onWithdrawalSubmitted={refreshUserData}
                  onNavigateToVerification={() => setActiveTab('verification')}
                />
              )}

              {activeTab === 'referral' && (
                <ReferralCenter user={user} />
              )}

              {activeTab === 'support' && (
                <SupportChat user={user} />
              )}

              {activeTab === 'wallets' && (
                <div className="space-y-6 pb-12">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Detailed Wallet Statement</h2>
                    <p className="text-xs text-slate-400">
                      Breakdown of transactions across Bonus, Earned, Deposit, and Security wallets.
                    </p>
                  </div>
                  <HomeDashboard
                    user={user}
                    notices={[]}
                    tasks={tasks}
                    onNavigate={setActiveTab}
                  />
                </div>
              )}
            </>
          )
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      {user && !isAdminView && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 flex justify-around text-[10px] font-bold">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'tasks', label: 'Tasks', icon: Video },
            { id: 'deposit', label: 'Deposit', icon: ArrowDownRight },
            { id: 'withdrawal', label: 'Withdraw', icon: ArrowUpRight },
            { id: 'verification', label: 'Tier ID', icon: ShieldCheck },
            { id: 'support', label: 'AI Help', icon: Bot }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
                  active ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u, t) => {
          setUser(u);
          setToken(t);
          localStorage.setItem('auth_token', t);
          localStorage.setItem('auth_user_id', u.id);
          const isUserAdmin = u.email?.trim().toLowerCase() === 'sponsorearn00@gmail.com' || u.role === 'admin';
          if (isUserAdmin) {
            setIsAdminView(true);
          } else {
            setIsAdminView(false);
            setActiveTab('home');
          }
        }}
      />

      {/* Notifications History Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          if (activeTab === 'notifications') setActiveTab('home');
        }}
        userId={user?.id || ''}
        notifications={notifications}
        unreadCount={unreadCount}
        onRefreshNotifications={fetchGlobalData}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsNotificationsOpen(false);
        }}
      />
    </div>
  );
}
