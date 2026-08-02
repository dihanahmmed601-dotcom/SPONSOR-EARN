import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Database,
  RefreshCw,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Flame,
  Layers,
  FileText,
  Lock,
  Wifi,
  Radio,
  Clock,
  Gauge,
  Sparkles,
  Server,
  Cloud,
  BookOpen,
  Code2,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Download,
  Check
} from 'lucide-react';

interface CacheKey {
  keyPattern: string;
  ttlSeconds: number;
  hitRate: number;
  itemsCached: number;
  sizeKb: number;
}

export const PerformanceOptimizationSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cache' | 'maintenance' | 'docs'>('cache');
  
  // Redis Cache State
  const [redisConnected, setRedisConnected] = useState(true);
  const [cacheHitRate, setCacheHitRate] = useState(98.4);
  const [isWarmingCache, setIsWarmingCache] = useState(false);
  const [cacheKeys, setCacheKeys] = useState<CacheKey[]>([
    { keyPattern: 'user:profile:{userId}', ttlSeconds: 3600, hitRate: 99.2, itemsCached: 14200, sizeKb: 450 },
    { keyPattern: 'wallet:summary:{userId}', ttlSeconds: 300, hitRate: 98.6, itemsCached: 14200, sizeKb: 380 },
    { keyPattern: 'tasks:active:list', ttlSeconds: 1800, hitRate: 97.9, itemsCached: 85, sizeKb: 120 },
    { keyPattern: 'plans:vip:tiers', ttlSeconds: 86400, hitRate: 99.9, itemsCached: 8, sizeKb: 15 },
    { keyPattern: 'notifications:unread:{userId}', ttlSeconds: 60, hitRate: 95.4, itemsCached: 9800, sizeKb: 210 },
    { keyPattern: 'settings:global', ttlSeconds: 86400, hitRate: 99.9, itemsCached: 1, sizeKb: 4 }
  ]);

  // Maintenance Mode State
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'Scheduled server maintenance in progress. All user balances and active tasks are safe. Normal operations resume shortly.'
  );
  const [allowAdminBypass, setAllowAdminBypass] = useState(true);

  // Active Documentation Tab
  const [docCategory, setDocCategory] = useState<'architecture' | 'api' | 'db' | 'deployment'>('architecture');

  const handleWarmUpCache = () => {
    setIsWarmingCache(true);
    setTimeout(() => {
      setIsWarmingCache(false);
      setCacheHitRate(99.8);
      setCacheKeys(prev =>
        prev.map(k => ({ ...k, hitRate: Math.min(99.9, k.hitRate + 0.5) }))
      );
    }, 1200);
  };

  const handleFlushCache = () => {
    setIsWarmingCache(true);
    setTimeout(() => {
      setIsWarmingCache(false);
      setCacheHitRate(85.0);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Optimization Engine</span>
            </div>
            <h2 className="text-2xl font-black text-white">Performance Optimization & Production Readiness</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Redis memory caching layer, database query indexing & connection pooling, Flutter 120 FPS rendering & offline background sync, maintenance mode, and comprehensive developer documentation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleWarmUpCache}
              disabled={isWarmingCache}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isWarmingCache ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 fill-slate-950" />}
              <span>{isWarmingCache ? 'Pre-Warming...' : 'Pre-Warm Redis Cache'}</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700 max-w-lg mt-6">
          <button
            onClick={() => setActiveTab('cache')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cache' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Redis & Query Cache</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'maintenance' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Maintenance Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'docs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Developer Docs</span>
          </button>
        </div>
      </div>

      {/* 1. REDIS & QUERY CACHE TAB */}
      {activeTab === 'cache' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>Redis Hit Ratio</span>
              </span>
              <div className="text-2xl font-black text-emerald-400">{cacheHitRate.toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500 font-semibold">Sub-millisecond access (1.1 ms)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>PgBouncer Connection Pool</span>
              </span>
              <div className="text-2xl font-black text-white">14 / 100</div>
              <span className="text-[10px] text-emerald-400 font-semibold">86 Idle Connections Ready</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Flutter FPS Target</span>
              </span>
              <div className="text-2xl font-black text-amber-400">120 FPS</div>
              <span className="text-[10px] text-slate-500 font-semibold">Zero Frame Drops / Smooth Render</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-purple-400" />
                <span>Background Sync Engine</span>
              </span>
              <div className="text-2xl font-black text-purple-400">0 Queued</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Auto Retry & Offline Stashing</span>
            </div>
          </div>

          {/* Cache Keys Details Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Redis Cache Key Patterns & Invalidation Policies</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated TTL invalidation on database mutations.</p>
              </div>

              <button
                onClick={handleFlushCache}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Flush Stale Cache
              </button>
            </div>

            <div className="space-y-3">
              {cacheKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        {item.keyPattern}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">TTL: {item.ttlSeconds}s</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Cached Records: <strong className="text-slate-200 font-mono">{item.itemsCached.toLocaleString()}</strong> • Memory Usage: <strong className="text-slate-200 font-mono">{item.sizeKb} KB</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 block">Hit Rate</span>
                      <span className="text-sm font-black text-emerald-400">{item.hitRate}%</span>
                    </div>
                    <div className="w-20 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${item.hitRate}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAINTENANCE MODE TAB */}
      {activeTab === 'maintenance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>System Maintenance & Emergency Controls</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Control global platform lockouts while allowing admin account override.</p>
            </div>

            {/* Maintenance Mode Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-extrabold ${isMaintenanceMode ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                {isMaintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEM OPERATIONAL'}
              </span>
              <button
                onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                className={`w-14 h-8 rounded-full p-1 transition-all cursor-pointer ${
                  isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-slate-950 transition-all ${
                    isMaintenanceMode ? 'translate-x-6 bg-white' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Public Display Maintenance Banner</label>
              <textarea
                value={maintenanceMessage}
                onChange={e => setMaintenanceMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Allow Super Admin Access During Maintenance</h4>
                  <p className="text-[11px] text-slate-400">Admins with valid JWT role 'admin' can bypass lockout screen.</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={allowAdminBypass}
                onChange={e => setAllowAdminBypass(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. DEVELOPER DOCUMENTATION TAB */}
      {activeTab === 'docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Enterprise Architecture & API Documentation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive specs for backend, database, Flutter client & security guidelines.</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
              {(['architecture', 'api', 'db', 'deployment'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setDocCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    docCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Doc Content Render */}
          {docCategory === 'architecture' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Clean Architecture & SOLID Principles</span>
                </h4>
                <p>
                  The platform adheres strictly to Clean Architecture separated into 4 distinct layers:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">Presentation Layer:</strong> React Web Dashboard & Flutter Mobile Client (BLoC / Provider state management).</li>
                  <li><strong className="text-slate-200">Domain Layer:</strong> Business use cases, transaction rules, referral multi-tier calculation logic.</li>
                  <li><strong className="text-slate-200">Data Layer:</strong> Repositories, REST API data sources, Redis Cache strategy.</li>
                  <li><strong className="text-slate-200">Infrastructure Layer:</strong> GCP Cloud Run, Cloud SQL PostgreSQL, Firebase FCM, bKash / Nagad gateways.</li>
                </ul>
              </div>
            </div>
          )}

          {docCategory === 'api' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">POST</span>
                  <span className="text-white font-bold">/api/v1/auth/login</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Returns JWT Access Token (15m expiration) and HTTP-Only Refresh Cookie (7d).</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded">GET</span>
                  <span className="text-white font-bold">/api/v1/wallet/balance</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Returns 4-Wallet breakdown: Earned, Deposit, Bonus, and Security Deposit.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">POST</span>
                  <span className="text-white font-bold">/api/v1/deposits/bKash</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Initiates automated bKash Payment Gateway checkout or manual TxID validation.</p>
              </div>
            </div>
          )}

          {docCategory === 'db' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>PostgreSQL Schema & Indexes</span>
              </h4>
              <p className="text-slate-400">
                Optimized foreign keys and composite B-tree indexes for zero-latency queries at 1M user scale:
              </p>
              <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-purple-300 space-y-1">
                <div>CREATE INDEX idx_users_phone ON users(phone);</div>
                <div>CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);</div>
                <div>CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);</div>
              </div>
            </div>
          )}

          {docCategory === 'deployment' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-400" />
                <span>Cloud Deployment Blueprint</span>
              </h4>
              <p className="text-slate-400">
                To build and deploy the production container:
              </p>
              <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-indigo-300 space-y-1">
                <div>npm run build</div>
                <div>gcloud run deploy earning-platform --source . --region asia-southeast1</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
