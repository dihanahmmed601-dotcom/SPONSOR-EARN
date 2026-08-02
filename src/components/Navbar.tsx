import React from 'react';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';
import {
  Wallet,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Sliders,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Cloud,
  Zap,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  unreadCount,
  isAdminView,
  setIsAdminView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <AppLogo size="md" showText={true} />
            </button>

              {/* Admin & Developer Tools Switcher Toggle - Restricted to Admins */}
              {(user?.email?.trim().toLowerCase() === 'sponsorearn00@gmail.com' || user?.role === 'admin') && (
                <div className="hidden md:flex items-center ml-4 bg-slate-800/80 p-1 rounded-lg border border-slate-700 gap-1">
                  <button
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('home');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      !isAdminView && activeTab !== 'flutter' && !['qa_suite', 'devops', 'optimization'].includes(activeTab)
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Web Portal
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('flutter');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'flutter'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Flutter App</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('qa_suite');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'qa_suite'
                        ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>QA Suite</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('devops');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'devops'
                        ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Cloud & DevOps</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('optimization');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'optimization'
                        ? 'bg-teal-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-teal-300" />
                    <span>Optimization</span>
                  </button>
                  <button
                    onClick={() => setIsAdminView(true)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isAdminView
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              )}
          </div>

          {/* User Balance Bar & Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick 4 Wallets Chip */}
              <div
                onClick={() => setActiveTab('wallets')}
                className="hidden sm:flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>৳{user.wallets.earnedBalance.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Earned</span>
                </div>
                <div className="h-3 w-px bg-slate-700"></div>
                <div className="text-emerald-400 text-xs font-bold">
                  ৳{user.wallets.depositBalance.toLocaleString()}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">Dep</span>
                </div>
              </div>

              {/* Notification Icon */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Menu Badge */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{user.tierStatus === 'None' ? 'Unverified' : `${user.tierStatus} Tier`}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
