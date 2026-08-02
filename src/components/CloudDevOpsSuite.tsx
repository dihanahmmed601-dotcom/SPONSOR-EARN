import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Database,
  Lock,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Terminal,
  Smartphone,
  Globe,
  Zap,
  Layers,
  Activity,
  GitBranch,
  ShieldCheck,
  FileCode,
  Download,
  Play,
  Check,
  ChevronRight,
  Gauge,
  Sliders,
  Radio,
  Clock,
  RotateCcw
} from 'lucide-react';

interface EnvironmentConfig {
  name: 'development' | 'testing' | 'staging' | 'production';
  url: string;
  gcpRegion: string;
  dbHost: string;
  minInstances: number;
  maxInstances: number;
  secretsCount: number;
  status: 'Healthy' | 'Deploying' | 'Maintenance';
}

export const CloudDevOpsSuite: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<'development' | 'testing' | 'staging' | 'production'>('production');
  const [isRunningCiCd, setIsRunningCiCd] = useState(false);
  const [ciSteps, setCiSteps] = useState([
    { name: 'Run Linter & TypeScript Type Check', status: 'passed' },
    { name: 'Execute Flutter & Node.js Unit Tests', status: 'passed' },
    { name: 'Perform Security Vulnerability Audit (SAST/DAST)', status: 'passed' },
    { name: 'Build Multi-Stage Docker Image (Node 20 Alpine)', status: 'passed' },
    { name: 'Secret Manager Encryption Key Binding', status: 'passed' },
    { name: 'Deploy Revision to GCP Cloud Run (Traffic 100%)', status: 'passed' },
    { name: 'Execute Cloud SQL Schema Migration (Drizzle/ORM)', status: 'passed' }
  ]);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState('2026-07-31 18:30:00 UTC');

  const environments: Record<string, EnvironmentConfig> = {
    development: {
      name: 'development',
      url: 'https://dev-api.earningplatform.com',
      gcpRegion: 'asia-southeast1',
      dbHost: '10.45.0.12 (Cloud SQL Micro)',
      minInstances: 1,
      maxInstances: 2,
      secretsCount: 8,
      status: 'Healthy'
    },
    testing: {
      name: 'testing',
      url: 'https://test-api.earningplatform.com',
      gcpRegion: 'asia-southeast1',
      dbHost: '10.45.0.15 (Cloud SQL Standard)',
      minInstances: 1,
      maxInstances: 4,
      secretsCount: 10,
      status: 'Healthy'
    },
    staging: {
      name: 'staging',
      url: 'https://staging-api.earningplatform.com',
      gcpRegion: 'asia-southeast1',
      dbHost: '10.45.0.22 (Cloud SQL HA)',
      minInstances: 2,
      maxInstances: 10,
      secretsCount: 12,
      status: 'Healthy'
    },
    production: {
      name: 'production',
      url: 'https://api.earningplatform.com',
      gcpRegion: 'asia-southeast1 (Singapore)',
      dbHost: '10.45.0.100 (Cloud SQL Enterprise HA + PITR)',
      minInstances: 3,
      maxInstances: 100,
      secretsCount: 16,
      status: 'Healthy'
    }
  };

  const currentEnv = environments[activeEnv];

  const handleTriggerCiCd = () => {
    setIsRunningCiCd(true);
    setCiSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    let currentStep = 0;
    const interval = setInterval(() => {
      setCiSteps(prev =>
        prev.map((s, idx) => {
          if (idx === currentStep) return { ...s, status: 'running' };
          if (idx < currentStep) return { ...s, status: 'passed' };
          return s;
        })
      );
      currentStep++;
      if (currentStep > ciSteps.length) {
        clearInterval(interval);
        setCiSteps(prev => prev.map(s => ({ ...s, status: 'passed' })));
        setIsRunningCiCd(false);
      }
    }, 600);
  };

  const handleCreateBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      setIsBackupRunning(false);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setLastBackupTime(now);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cloud Architecture Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-2">
              <Cloud className="w-4 h-4 text-indigo-400" />
              <span>GCP Enterprise Cloud Infrastructure</span>
            </div>
            <h2 className="text-2xl font-black text-white">DevOps, Cloud Infrastructure & Production Deployment</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Cloud Run container autoscaling, Cloud SQL PostgreSQL high availability with PITR, Secret Manager security, Cloud Storage signed buckets, and multi-platform deployment releases (Android AAB, iOS IPA, Web).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleTriggerCiCd}
              disabled={isRunningCiCd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunningCiCd ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunningCiCd ? 'Running Pipeline...' : 'Trigger CI/CD Pipeline'}</span>
            </button>
            <button
              onClick={handleCreateBackup}
              disabled={isBackupRunning}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isBackupRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-emerald-400" />}
              <span>Snapshot DB</span>
            </button>
          </div>
        </div>

        {/* Environment Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Environment:</span>
          </span>
          {(['development', 'testing', 'staging', 'production'] as const).map(envKey => (
            <button
              key={envKey}
              onClick={() => setActiveEnv(envKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeEnv === envKey
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md border border-indigo-400/40'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Radio className={`w-3 h-3 ${activeEnv === envKey ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>{envKey}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Environment Detail Specs Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cloud Run Autoscaling</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-lg font-black text-white">{currentEnv.minInstances} - {currentEnv.maxInstances} Instances</div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 block truncate">
            {currentEnv.url}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud SQL (PostgreSQL)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">PgBouncer Active</span>
          </div>
          <div className="text-sm font-bold text-white truncate">{currentEnv.dbHost}</div>
          <span className="text-[11px] text-slate-400 block">Region: {currentEnv.gcpRegion}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Secret Manager</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">{currentEnv.secretsCount} Encrypted Keys</span>
          </div>
          <div className="text-sm font-bold text-white">AES-256 Key Rotation</div>
          <span className="text-[11px] text-slate-400 block">JWT, bKash API, Gemini, FCM</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>Cloud Storage (GCS)</span>
            </span>
            <span className="text-[10px] text-purple-300 font-bold">Bucket Signed URLs</span>
          </div>
          <div className="text-sm font-bold text-white">gs://earning-platform-assets</div>
          <span className="text-[11px] text-slate-400 block">KYC Docs, Payout Receipts, Avatars</span>
        </div>
      </div>

      {/* CI/CD & MULTI-PLATFORM RELEASES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CI/CD Automated Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>Continuous Integration & Deployment (CI/CD)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Pipeline Status: Success
            </span>
          </div>

          <div className="space-y-2.5">
            {ciSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-mono shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{step.name}</span>
                </div>

                {step.status === 'passed' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASSED</span>
                  </span>
                ) : step.status === 'running' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>BUILDING...</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-xl">
                    PENDING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Production Release Assets Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Multi-Platform Production Build Matrix</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold">Release v2.4.0</span>
          </div>

          <div className="space-y-3">
            {/* Android Release Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Android Application Bundle (.aab)</h4>
                  <p className="text-[11px] text-slate-400">Play Store Ready • Target SDK 34 • ProGuard Obfuscated</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>app-release.aab</span>
              </button>
            </div>

            {/* iOS Release Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">iOS App Archive (.ipa)</h4>
                  <p className="text-[11px] text-slate-400">App Store Connect Upload • TestFlight Ready</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Runner.ipa</span>
              </button>
            </div>

            {/* Web Server Release Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full-Stack Cloud Run Container</h4>
                  <p className="text-[11px] text-slate-400">Node 20 Express + Vite Bundled dist/server.cjs</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>gcr.io/release:v2.4</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DISASTER RECOVERY & BACKUP LOGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cloud SQL Backup & Disaster Recovery (DR)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated snapshot schedule with 30-day retention and Point-in-Time Recovery.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Last Snapshot: <strong className="text-white font-mono">{lastBackupTime}</strong></span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>Point-in-Time Recovery (PITR)</span>
            </div>
            <p className="text-xs text-slate-400">Restore database state to any exact transaction timestamp within the last 7 days.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>High Availability (HA) Failover</span>
            </div>
            <p className="text-xs text-slate-400">Automatic failover to standby Cloud SQL zone in asia-southeast1-b under 10 seconds.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Customer Managed Encryption Keys (CMEK)</span>
            </div>
            <p className="text-xs text-slate-400">Data at rest encrypted via Cloud Key Management Service (KMS) HSM module.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
