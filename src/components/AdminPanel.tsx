import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import {
  UserProfile,
  DepositRequest,
  WithdrawalRequest,
  VerificationRequest,
  SponsorTask,
  TaskCategory,
  SponsorBrand,
  SponsorCampaign,
  ReferralSettings,
  ReferralRecord,
  SubscriptionPlan,
  PlanHistoryRecord,
  PlanStatus,
  SystemSettings,
  BroadcastNotification,
  BackupSnapshot,
  AdminRole,
  AntiFraudFlag,
  NoticeBanner
} from '../types';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  Users,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Trash2,
  Megaphone,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  UserPlus,
  Building2,
  Gift,
  DollarSign,
  Pin,
  Edit3,
  Eye,
  EyeOff,
  Briefcase,
  Play,
  Pause,
  Edit2,
  Crown,
  Award,
  Gem,
  Copy,
  Layers,
  BarChart3,
  Send,
  Download,
  Database,
  Key,
  Settings,
  Upload,
  Activity,
  FileSpreadsheet,
  Lock,
  Unlock,
  Server,
  RefreshCw,
  Globe,
  Radio,
  Smartphone,
  Search,
  ShieldAlert
} from 'lucide-react';

interface AdminPanelProps {
  adminUser: UserProfile;
  onNoticeUpdated?: () => void;
  onDataRefresh?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminUser, onNoticeUpdated, onDataRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'plans'
    | 'deposits'
    | 'withdrawals'
    | 'verifications'
    | 'tasks'
    | 'users'
    | 'gateways'
    | 'referrals'
    | 'sponsors'
    | 'notices'
    | 'broadcasts'
    | 'reports'
    | 'security'
    | 'roles'
    | 'settings'
    | 'backups'
    | 'audit'
  >('overview');

  const [overviewData, setOverviewData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<SponsorTask[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);

  // PART 9 States
  const [broadcastsList, setBroadcastsList] = useState<BroadcastNotification[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTargetGroup, setBroadcastTargetGroup] = useState<'all' | 'verified_only' | 'unverified_only' | 'tier_vip'>('all');

  const [reportType, setReportType] = useState<'user' | 'deposit' | 'withdrawal' | 'task' | 'plan' | 'audit'>('user');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [securityFlagsList, setSecurityFlagsList] = useState<AntiFraudFlag[]>([]);

  const [systemSettingsForm, setSystemSettingsForm] = useState<SystemSettings>({
    appName: 'SPONSOR EARN',
    appLogo: '/app-logo.png?v=2',
    themeColor: '#f59e0b',
    language: 'English',
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultSignupBonus: 100,
    supportWhatsApp: '+8801700000000',
    supportTelegram: '@AdVibeSupport',
    supportEmail: 'support@advibe.com',
    otpAuthEnabled: false,
    autoApproveWithdrawalLimit: 1000
  });

  const [backupsList, setBackupsList] = useState<BackupSnapshot[]>([]);
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupType, setNewBackupType] = useState<'database' | 'media' | 'settings' | 'full'>('full');

  const [activeAdminRole, setActiveAdminRole] = useState<AdminRole>('Super Admin');

  // Payment Gateway editing state
  const [selectedGwForEdit, setSelectedGwForEdit] = useState<any | null>(null);

  // Referral Settings & Sponsor Management States
  const [referralSettingsForm, setReferralSettingsForm] = useState<ReferralSettings>({
    isEnabled: true,
    rewardAmount: 50,
    campaignStatus: 'active',
    requireVerificationForReward: false,
    monthlyLeaderboardPrizePool: 5000
  });
  const [referralReports, setReferralReports] = useState<any>(null);

  const [sponsorsList, setSponsorsList] = useState<SponsorBrand[]>([]);
  const [campaignsList, setCampaignsList] = useState<SponsorCampaign[]>([]);

  const [editingSponsor, setEditingSponsor] = useState<Partial<SponsorBrand> | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Partial<SponsorCampaign> | null>(null);

  // Subscription Plan & Tier Management States (PART 8)
  const [plansList, setPlansList] = useState<SubscriptionPlan[]>([]);
  const [planHistoryList, setPlanHistoryList] = useState<PlanHistoryRecord[]>([]);
  const [planAnalytics, setPlanAnalytics] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [previewPlan, setPreviewPlan] = useState<SubscriptionPlan | null>(null);

  // Task Form state
  const [editingTask, setEditingTask] = useState<Partial<SponsorTask>>({
    title: '',
    category: 'video',
    rewardAmount: 20,
    durationSeconds: 30,
    sponsorName: 'Sponsor Brand'
  });

  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<UserProfile | null>(null);
  const [adjustWalletType, setAdjustWalletType] = useState<'bonus' | 'earned' | 'deposit' | 'security'>('earned');
  const [adjustOperation, setAdjustOperation] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Admin Management States & Handlers
  const [adminsList, setAdminsList] = useState<UserProfile[]>([]);
  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'Finance Admin',
    status: 'Active'
  });
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  const fetchAdminsList = async () => {
    try {
      const res = await fetch('/api/admin/admins/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminsList(data.admins || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminsList();
  }, []);

  const handleSaveAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/admins/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          id: editingAdminId || undefined,
          ...adminForm
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setEditingAdminId(null);
        setAdminForm({ name: '', email: '', password: '', role: 'Finance Admin', status: 'Active' });
        fetchAdminsList();
      } else {
        setActionMessage(data.error || 'Failed to save admin user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAdmin = async (targetAdminId: string) => {
    if (!window.confirm('Are you sure you want to remove admin privileges for this account?')) return;
    try {
      const res = await fetch('/api/admin/admins/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ targetAdminId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchAdminsList();
      } else {
        setActionMessage(data.error || 'Failed to remove admin');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPaymentGateways = async () => {
    try {
      const res = await fetch('/api/payment-gateways');
      const data = await res.json();
      if (res.ok) setPaymentGateways(data.gateways || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGwForEdit) return;

    try {
      const res = await fetch('/api/admin/payment-gateways/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(selectedGwForEdit)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setSelectedGwForEdit(null);
        fetchPaymentGateways();
      } else {
        setActionMessage(data.error || 'Failed to update payment gateway');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportReport = async () => {
    try {
      const res = await fetch('/api/admin/reports/export', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(data, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `financial_report_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setActionMessage('Financial audit report exported successfully.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) setAuditLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReferralData = async () => {
    try {
      const res1 = await fetch('/api/admin/referrals/settings', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data1 = await res1.json();
      if (res1.ok && data1.settings) setReferralSettingsForm(data1.settings);

      const res2 = await fetch('/api/admin/referrals/reports', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data2 = await res2.json();
      if (res2.ok) setReferralReports(data2.reports);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSponsorsAndCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/sponsors/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) {
        setSponsorsList(data.sponsors || []);
        setCampaignsList(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReferralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/referrals/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(referralSettingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchReferralData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor?.name || !editingSponsor?.description) return;

    try {
      const res = await fetch('/api/admin/sponsors/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(editingSponsor)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setEditingSponsor(null);
        fetchSponsorsAndCampaigns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign?.campaignName || !editingCampaign?.sponsorName) return;

    try {
      const res = await fetch('/api/admin/sponsor-campaigns/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(editingCampaign)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setEditingCampaign(null);
        fetchSponsorsAndCampaigns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCampaignStatusChange = async (campaignId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/sponsor-campaigns/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ campaignId, status })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchSponsorsAndCampaigns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;

    try {
      const res = await fetch('/api/admin/users/adjust-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          targetUserId: selectedUserForAdjust.id,
          walletType: adjustWalletType,
          operation: adjustOperation,
          amount: adjustAmount,
          reason: adjustReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setSelectedUserForAdjust(null);
        setAdjustReason('');
        fetchUsers();
        fetchOverview();
      } else {
        setActionMessage(data.error || 'Failed to adjust wallet');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Notice Form & Management State
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<'notice' | 'announcement' | 'banner'>('announcement');
  const [noticeAdminName, setNoticeAdminName] = useState('System Admin');
  const [noticeImageUrl, setNoticeImageUrl] = useState('');
  const [noticeIsPinned, setNoticeIsPinned] = useState(false);
  const [adminNoticesList, setAdminNoticesList] = useState<NoticeBanner[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) setOverviewData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) setAllUsers(data.users);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminNotices = async () => {
    try {
      const res = await fetch('/api/admin/content/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok && data.notices) {
        setAdminNoticesList(data.notices);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchTasks();
    fetchPaymentGateways();
    fetchAdminNotices();
  }, [adminUser.id]);

  // Handle Deposit Action
  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/deposits/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ depositId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Deposit ${action}d successfully`);
        fetchOverview();
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Withdrawal Action
  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/withdrawals/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ withdrawalId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Withdrawal ${action}d successfully`);
        fetchOverview();
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Verification Action
  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/verifications/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ verificationId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Verification ${action}d successfully`);
        fetchOverview();
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Task Media Upload Handlers
  const handleTaskImageUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'imageUrl' | 'thumbnail' | 'sponsorLogo' = 'imageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected file size exceeds maximum limit of 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEditingTask(prev => ({
        ...prev,
        [targetField]: dataUrl,
        ...(targetField === 'imageUrl' && !prev.thumbnail ? { thumbnail: dataUrl } : {})
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Selected video file exceeds maximum limit of 50MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEditingTask(prev => ({
        ...prev,
        videoUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tasks/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(editingTask)
      });
      if (res.ok) {
        setActionMessage('Task saved successfully');
        setEditingTask({
          title: '',
          category: 'video',
          rewardAmount: 20,
          durationSeconds: 30,
          sponsorName: 'Sponsor Brand'
        });
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': adminUser.id }
      });
      if (res.ok) {
        setActionMessage('Task deleted');
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Publish or Save Notice
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    try {
      const res = await fetch('/api/admin/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          id: editingNoticeId || undefined,
          title: noticeTitle,
          content: noticeContent,
          type: noticeType,
          adminName: noticeAdminName,
          imageUrl: noticeImageUrl,
          isPinned: noticeIsPinned,
          isActive: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(editingNoticeId ? 'Notice updated successfully!' : 'Notice published successfully!');
        resetNoticeForm();
        fetchAdminNotices();
        if (onNoticeUpdated) onNoticeUpdated();
        if (onDataRefresh) onDataRefresh();
      } else {
        setActionMessage(data.error || 'Failed to save notice.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetNoticeForm = () => {
    setEditingNoticeId(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeType('announcement');
    setNoticeAdminName('System Admin');
    setNoticeImageUrl('');
    setNoticeIsPinned(false);
  };

  const handleEditNotice = (notice: NoticeBanner) => {
    setEditingNoticeId(notice.id);
    setNoticeTitle(notice.title);
    setNoticeContent(notice.content);
    setNoticeType((notice.type as any) || 'notice');
    setNoticeAdminName(notice.adminName || 'System Admin');
    setNoticeImageUrl(notice.imageUrl || '');
    setNoticeIsPinned(Boolean(notice.isPinned));
  };

  const handleToggleNoticePin = async (noticeId: string, currentPin?: boolean) => {
    try {
      const res = await fetch('/api/admin/notices/toggle-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ noticeId, isPinned: !currentPin })
      });
      if (res.ok) {
        setActionMessage(`Notice ${!currentPin ? 'pinned' : 'unpinned'} successfully.`);
        fetchAdminNotices();
        if (onNoticeUpdated) onNoticeUpdated();
        if (onDataRefresh) onDataRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNoticeActive = async (noticeId: string, currentActive?: boolean) => {
    try {
      const res = await fetch('/api/admin/content/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ noticeId, isActive: !currentActive })
      });
      if (res.ok) {
        setActionMessage(`Notice ${!currentActive ? 'published' : 'hidden'} successfully.`);
        fetchAdminNotices();
        if (onNoticeUpdated) onNoticeUpdated();
        if (onDataRefresh) onDataRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this notice?')) return;
    
    // 1. Instant optimistic UI removal from Admin UI
    setAdminNoticesList(prev => prev.filter(n => n.id !== noticeId));
    if (editingNoticeId === noticeId) {
      resetNoticeForm();
    }

    try {
      const res = await fetch('/api/admin/notices/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ noticeId, id: noticeId })
      });
      
      const data = await res.json();

      if (res.ok && (data.success !== false)) {
        setActionMessage(data.message || 'Notice deleted successfully.');
        fetchAdminNotices();
        if (onNoticeUpdated) onNoticeUpdated();
        if (onDataRefresh) onDataRefresh();
      } else {
        const errorMsg = data.error || data.message || 'Failed to delete notice.';
        setActionMessage(`Error: ${errorMsg}`);
        alert(`Delete notice error: ${errorMsg}`);
        // Restore notice list in case of deletion failure
        fetchAdminNotices();
      }
    } catch (e: any) {
      console.error('Delete notice error:', e);
      const errText = e?.message || 'Network error occurred while deleting notice.';
      setActionMessage(`Error: ${errText}`);
      alert(`Delete notice network error: ${errText}`);
      fetchAdminNotices();
    }
  };

  const fetchPlansData = async () => {
    try {
      const res = await fetch('/api/admin/plans/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) {
        setPlansList(data.plans || []);
        setPlanHistoryList(data.history || []);
        setPlanAnalytics(data.analytics || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name || !editingPlan?.tierName) return;

    try {
      const res = await fetch('/api/admin/plans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify(editingPlan)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setEditingPlan(null);
        fetchPlansData();
      } else {
        setActionMessage(data.error || 'Failed to save plan');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlanStatus = async (planId: string, status: PlanStatus) => {
    try {
      const res = await fetch('/api/admin/plans/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ planId, status })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchPlansData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicatePlan = async (planId: string) => {
    try {
      const res = await fetch('/api/admin/plans/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchPlansData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete/archive this plan?')) return;
    try {
      const res = await fetch('/api/admin/plans/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchPlansData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // PART 9 FETCH & ACTION HANDLERS
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcast/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) setBroadcastsList(data.broadcasts || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      const res = await fetch('/api/admin/broadcast/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          targetGroup: broadcastTargetGroup
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setBroadcastTitle('');
        setBroadcastMessage('');
        fetchBroadcasts();
      } else {
        setActionMessage(data.error || 'Failed to send broadcast');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBroadcast = async (broadcastId: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast log?')) return;
    try {
      const res = await fetch('/api/admin/broadcast/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ broadcastId })
      });
      if (res.ok) {
        setActionMessage('Broadcast log deleted successfully.');
        fetchBroadcasts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/get', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok && data.settings) setSystemSettingsForm(data.settings);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ settings: systemSettingsForm })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setSystemSettingsForm(data.settings);
      } else {
        setActionMessage(data.error || 'Failed to update system settings');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/backup/all', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) setBackupsList(data.backups || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ name: newBackupName, type: newBackupType })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setNewBackupName('');
        fetchBackups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('RESTORE WARNING: Restoring this backup snapshot will replace current platform state with the snapshot data. Continue?')) return;

    try {
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ backupId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({ reportType, format: 'CSV' })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedReport(data);
        setActionMessage(`Generated ${data.reportTitle} with ${data.recordCount} records.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AppLogo size="lg" className="shrink-0" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Authority Control (sponsorearn00@gmail.com)</span>
              </div>
              <h2 className="text-2xl font-black text-white">Platform Governance Dashboard</h2>
              <p className="text-xs text-slate-300 mt-1">
                Approve deposits & withdrawals, verify tier applications, configure sponsor tasks, and manage platform security.
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'System Overview', icon: Sliders },
              { id: 'plans', label: 'Plan & Tier Control', icon: Crown },
              { id: 'deposits', label: 'Pending Deposits', icon: CreditCard },
              { id: 'withdrawals', label: 'Pending Withdrawals', icon: ArrowUpRight },
              { id: 'verifications', label: 'ID Verifications', icon: ShieldCheck },
              { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
              { id: 'referrals', label: 'Referral Control', icon: UserPlus },
              { id: 'sponsors', label: 'Sponsors & Campaigns', icon: Building2 },
              { id: 'tasks', label: 'Task Creator', icon: Sparkles },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'broadcasts', label: 'Push Broadcast', icon: Send },
              { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
              { id: 'security', label: 'Anti-Fraud & Security', icon: ShieldAlert },
              { id: 'roles', label: 'Admin Roles', icon: Key },
              { id: 'settings', label: 'System Settings', icon: Settings },
              { id: 'backups', label: 'Backup & Restore', icon: Database },
              { id: 'notices', label: 'Publish Notice', icon: Megaphone },
              { id: 'audit', label: 'Audit Logs', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setActionMessage(null);
                    if (tab.id === 'plans') fetchPlansData();
                    if (tab.id === 'audit') fetchAuditLogs();
                    if (tab.id === 'gateways') fetchPaymentGateways();
                    if (tab.id === 'referrals') fetchReferralData();
                    if (tab.id === 'sponsors') fetchSponsorsAndCampaigns();
                    if (tab.id === 'broadcasts') fetchBroadcasts();
                    if (tab.id === 'settings') fetchSystemSettings();
                    if (tab.id === 'backups') fetchBackups();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">×</button>
        </div>
      )}

      {/* Overview Tab */}
      {activeSubTab === 'overview' && overviewData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block font-medium">Total Registered Users</span>
              <span className="text-2xl font-black text-white">{overviewData.stats.totalUsers}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block font-medium">Verified Accounts</span>
              <span className="text-2xl font-black text-emerald-400">{overviewData.stats.totalVerified}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block font-medium">Pending Deposits</span>
              <span className="text-2xl font-black text-amber-400">{overviewData.stats.pendingDeposits}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block font-medium">Pending Withdrawals</span>
              <span className="text-2xl font-black text-blue-400">{overviewData.stats.pendingWithdrawals}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pending Deposits Tab */}
      {activeSubTab === 'deposits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Pending Deposit Approvals ({overviewData?.pendingDepositsList?.length || 0})
          </h3>

          {!overviewData?.pendingDepositsList || overviewData.pendingDepositsList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No pending deposit requests.</div>
          ) : (
            <div className="space-y-3">
              {overviewData.pendingDepositsList.map((dep: DepositRequest) => (
                <div key={dep.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{dep.userName} ({dep.userPhone})</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Method: <strong className="text-amber-400">{dep.method}</strong> • TxID: <strong className="text-white">{dep.transactionId}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-400">৳{dep.amount} BDT</span>
                    <button
                      onClick={() => handleDepositAction(dep.id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDepositAction(dep.id, 'reject')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Withdrawals Tab */}
      {activeSubTab === 'withdrawals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Pending Withdrawal Requests ({overviewData?.pendingWithdrawalsList?.length || 0})
          </h3>

          {!overviewData?.pendingWithdrawalsList || overviewData.pendingWithdrawalsList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No pending withdrawal requests.</div>
          ) : (
            <div className="space-y-3">
              {overviewData.pendingWithdrawalsList.map((w: WithdrawalRequest) => (
                <div key={w.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{w.userName} ({w.accountNumber})</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Tier: <strong className="text-amber-400">{w.userTier}</strong> • Method: {w.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-400">৳{w.amount} BDT</span>
                    <button
                      onClick={() => handleWithdrawalAction(w.id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Approve & Pay
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(w.id, 'reject')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                    >
                      Reject & Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Verifications Tab */}
      {activeSubTab === 'verifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Pending Tier Verifications ({overviewData?.pendingVerificationsList?.length || 0})
          </h3>

          {!overviewData?.pendingVerificationsList || overviewData.pendingVerificationsList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No pending verification requests.</div>
          ) : (
            <div className="space-y-3">
              {overviewData.pendingVerificationsList.map((v: VerificationRequest) => (
                <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{v.userName} ({v.userPhone})</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Target Tier: <strong className="text-amber-400">{v.targetTier}</strong> • Security Lock: ৳{v.requiredDeposit} BDT
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVerificationAction(v.id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Approve Tier
                    </button>
                    <button
                      onClick={() => handleVerificationAction(v.id, 'reject')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Gateways Subtab */}
      {activeSubTab === 'gateways' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Gateway Configuration</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage mobile money payment methods (bKash, Nagad, Rocket), account numbers, min/max limits, and status.
              </p>
            </div>
            <button
              onClick={fetchPaymentGateways}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
            >
              Refresh Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentGateways.map(gw => (
              <div
                key={gw.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">{gw.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        gw.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {gw.isEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                    <div><span className="text-slate-500 font-sans">Number:</span> {gw.accountNumber}</div>
                    <div><span className="text-slate-500 font-sans">Name:</span> {gw.accountName}</div>
                    <div><span className="text-slate-500 font-sans">Type:</span> {gw.accountType}</div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Deposit Limits: ৳{gw.minDeposit} - ৳{gw.maxDeposit} BDT</div>
                    <div>Withdrawal Limits: ৳{gw.minWithdrawal} - ৳{gw.maxWithdrawal} BDT</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGwForEdit({ ...gw })}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all mt-3"
                >
                  Configure Gateway
                </button>
              </div>
            ))}
          </div>

          {/* Edit Gateway Modal */}
          {selectedGwForEdit && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure {selectedGwForEdit.name}</h3>
                  <button onClick={() => setSelectedGwForEdit(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleUpdateGatewaySubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Gateway Name</label>
                      <input
                        type="text"
                        required
                        value={selectedGwForEdit.name}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Status</label>
                      <select
                        value={selectedGwForEdit.isEnabled ? 'true' : 'false'}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, isEnabled: e.target.value === 'true' })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Account Number (Agent / Personal)</label>
                    <input
                      type="text"
                      required
                      value={selectedGwForEdit.accountNumber}
                      onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Account Name</label>
                      <input
                        type="text"
                        required
                        value={selectedGwForEdit.accountName}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, accountName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Account Type</label>
                      <input
                        type="text"
                        required
                        value={selectedGwForEdit.accountType}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, accountType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Min Deposit (BDT)</label>
                      <input
                        type="number"
                        required
                        value={selectedGwForEdit.minDeposit}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, minDeposit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Max Deposit (BDT)</label>
                      <input
                        type="number"
                        required
                        value={selectedGwForEdit.maxDeposit}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, maxDeposit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Min Withdrawal (BDT)</label>
                      <input
                        type="number"
                        required
                        value={selectedGwForEdit.minWithdrawal}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, minWithdrawal: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Max Withdrawal (BDT)</label>
                      <input
                        type="number"
                        required
                        value={selectedGwForEdit.maxWithdrawal}
                        onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, maxWithdrawal: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Instructions for User</label>
                    <textarea
                      rows={2}
                      value={selectedGwForEdit.instructions || ''}
                      onChange={e => setSelectedGwForEdit({ ...selectedGwForEdit, instructions: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGwForEdit(null)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Referral Control Subtab (PART 7) */}
      {activeSubTab === 'referrals' && (
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <span>Referral System Configuration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set reward amounts, enable/disable referral program, and manage campaign status.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveReferralSettings} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Reward Amount per Referral (BDT)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={referralSettingsForm.rewardAmount}
                  onChange={e => setReferralSettingsForm({ ...referralSettingsForm, rewardAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Campaign Status</label>
                <select
                  value={referralSettingsForm.campaignStatus}
                  onChange={e => setReferralSettingsForm({ ...referralSettingsForm, campaignStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="active">Active (Rewards Live)</option>
                  <option value="paused">Paused (Rewards Suspended)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Monthly Prize Pool (BDT)</label>
                <input
                  type="number"
                  value={referralSettingsForm.monthlyLeaderboardPrizePool || 5000}
                  onChange={e => setReferralSettingsForm({ ...referralSettingsForm, monthlyLeaderboardPrizePool: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={referralSettingsForm.isEnabled}
                    onChange={e => setReferralSettingsForm({ ...referralSettingsForm, isEnabled: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <span>Referral Program Enabled</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Referral Settings
                </button>
              </div>
            </form>
          </div>

          {/* Referral Reports & Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Referral Reward Audit Logs</h3>
              <div className="text-xs font-mono text-slate-400">
                Total Validated Referrals: <strong className="text-purple-300">{referralReports?.totalReferralsCount || 0}</strong> • Total Distributed: <strong className="text-emerald-400">৳{referralReports?.totalRewardsDistributed || 0} BDT</strong>
              </div>
            </div>

            {!referralReports?.records || referralReports.records.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No referral records logged yet.</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {referralReports.records.map((r: ReferralRecord) => (
                  <div key={r.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Reward ID: {r.id}</span>
                        <span className="font-mono text-slate-400">TxID: {r.txId}</span>
                      </div>
                      <h4 className="font-bold text-white">Referrer: {r.referrerName} ➔ Referred: {r.referredUserName} ({r.referredUserPhone})</h4>
                      <span className="text-[10px] text-slate-500 block">Date: {new Date(r.rewardDate).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-400">+৳{r.rewardAmount} BDT</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sponsors & Campaigns Subtab (PART 7) */}
      {activeSubTab === 'sponsors' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Sponsor Brand & Campaign Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage sponsor profiles, create campaign budgets, and track campaign performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditingSponsor({ name: '', description: '', logoUrl: '', bannerUrl: '', websiteUrl: '', status: 'active' })}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sponsor Brand</span>
              </button>

              <button
                onClick={() => setEditingCampaign({ campaignName: '', sponsorName: sponsorsList[0]?.name || 'Sponsor', description: '', budgetAmount: 100000, status: 'active' })}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>

          {/* Sponsors List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Sponsor Brands ({sponsorsList.length})</h3>

            {sponsorsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No sponsor brands registered yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sponsorsList.map(s => (
                  <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={s.logoUrl} alt={s.name} className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900" />
                        <div>
                          <h4 className="text-sm font-bold text-white">{s.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{s.websiteUrl || 'No website link'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                        <button
                          onClick={() => setEditingSponsor(s)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaigns List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Sponsor Campaigns ({campaignsList.length})</h3>

            {campaignsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No sponsor campaigns created yet.</div>
            ) : (
              <div className="space-y-3">
                {campaignsList.map(c => (
                  <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400">{c.sponsorName}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-sm font-extrabold text-white">{c.campaignName}</span>
                      </div>
                      <p className="text-xs text-slate-400">{c.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Dates: {c.startDate} to {c.endDate} • Budget: <strong className="text-amber-400">৳{c.budgetAmount} BDT</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                        c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {c.status}
                      </span>

                      {c.status === 'active' ? (
                        <button
                          onClick={() => handleCampaignStatusChange(c.id, 'paused')}
                          className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCampaignStatusChange(c.id, 'active')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      )}

                      <button
                        onClick={() => setEditingCampaign(c)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Sponsor Modal */}
          {editingSponsor && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editingSponsor.id ? 'Edit Sponsor Brand' : 'New Sponsor Brand'}</h3>
                  <button onClick={() => setEditingSponsor(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveSponsor} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Brand Name</label>
                    <input
                      type="text"
                      required
                      value={editingSponsor.name || ''}
                      onChange={e => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={editingSponsor.description || ''}
                      onChange={e => setEditingSponsor({ ...editingSponsor, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Logo URL</label>
                      <input
                        type="text"
                        value={editingSponsor.logoUrl || ''}
                        onChange={e => setEditingSponsor({ ...editingSponsor, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Website URL</label>
                      <input
                        type="text"
                        value={editingSponsor.websiteUrl || ''}
                        onChange={e => setEditingSponsor({ ...editingSponsor, websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Status</label>
                    <select
                      value={editingSponsor.status || 'active'}
                      onChange={e => setEditingSponsor({ ...editingSponsor, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setEditingSponsor(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md">Save Sponsor</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Campaign Modal */}
          {editingCampaign && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editingCampaign.id ? 'Edit Campaign' : 'New Campaign'}</h3>
                  <button onClick={() => setEditingCampaign(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Sponsor Name</label>
                    <input
                      type="text"
                      required
                      value={editingCampaign.sponsorName || ''}
                      onChange={e => setEditingCampaign({ ...editingCampaign, sponsorName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={editingCampaign.campaignName || ''}
                      onChange={e => setEditingCampaign({ ...editingCampaign, campaignName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingCampaign.description || ''}
                      onChange={e => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Budget (BDT)</label>
                      <input
                        type="number"
                        value={editingCampaign.budgetAmount || 100000}
                        onChange={e => setEditingCampaign({ ...editingCampaign, budgetAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Status</label>
                      <select
                        value={editingCampaign.status || 'active'}
                        onChange={e => setEditingCampaign({ ...editingCampaign, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setEditingCampaign(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-md">Save Campaign</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Creator Tab */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingTask.id ? 'Edit Sponsor Task' : 'Create New Sponsor Task'}
              </h3>
              {editingTask.id && (
                <button
                  onClick={() => setEditingTask({
                    title: '',
                    category: 'video',
                    rewardAmount: 20,
                    durationSeconds: 30,
                    sponsorName: 'Sponsor Partner',
                    maxUsers: 5000,
                    maxDailyPerUser: 1,
                    status: 'active',
                    visibility: 'all',
                    priority: 'medium'
                  })}
                  className="text-xs text-amber-400 hover:underline"
                >
                  + New Task Form
                </button>
              )}
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watch Sponsor Product Launch Ad"
                  value={editingTask.title || ''}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task instructions and rules..."
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                ></textarea>
              </div>

              {/* Task Image Upload Section */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <label className="block text-slate-300 font-bold flex items-center justify-between">
                  <span>Task Image (JPG, PNG, WEBP - Max 5MB)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Displayed in task cards & modal</span>
                </label>

                {editingTask.imageUrl || editingTask.thumbnail ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <img
                      src={editingTask.imageUrl || editingTask.thumbnail}
                      alt="Task Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[11px] text-slate-300 font-mono truncate">Image Uploaded / Set</p>
                      <div className="flex gap-2">
                        <label className="px-2.5 py-1 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-amber-300 transition-all">
                          Replace Image
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={e => handleTaskImageUpload(e, 'imageUrl')}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, imageUrl: '', thumbnail: '' })}
                          className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] rounded-lg hover:bg-rose-500/30 transition-all"
                        >
                          Delete Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <label className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Upload Task Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={e => handleTaskImageUpload(e, 'imageUrl')}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={editingTask.imageUrl || ''}
                      onChange={e => setEditingTask({ ...editingTask, imageUrl: e.target.value, thumbnail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Sponsor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sponsor Brand"
                    value={editingTask.sponsorName || ''}
                    onChange={e => setEditingTask({ ...editingTask, sponsorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Sponsor Logo Upload / URL</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={editingTask.sponsorLogo || ''}
                      onChange={e => setEditingTask({ ...editingTask, sponsorLogo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <label className="px-2 py-2 bg-slate-800 border border-slate-700 text-amber-400 rounded-xl cursor-pointer hover:bg-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleTaskImageUpload(e, 'sponsorLogo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category *</label>
                  <select
                    value={editingTask.category || 'video'}
                    onChange={e => setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="video">Watch Video</option>
                    <option value="install">App Install</option>
                    <option value="referral">Referral Task</option>
                    <option value="custom">Custom Sponsor Task</option>
                    <option value="time_track">Time Tracking Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={editingTask.expiryDate ? editingTask.expiryDate.slice(0, 10) : '2026-12-31'}
                    onChange={e => setEditingTask({ ...editingTask, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Reward (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editingTask.rewardAmount || 20}
                    onChange={e => setEditingTask({ ...editingTask, rewardAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Duration (Sec)</label>
                  <input
                    type="number"
                    value={editingTask.durationSeconds || 0}
                    onChange={e => setEditingTask({ ...editingTask, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Priority</label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total Max Users</label>
                  <input
                    type="number"
                    value={editingTask.maxUsers || 5000}
                    onChange={e => setEditingTask({ ...editingTask, maxUsers: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Max Daily Per User</label>
                  <input
                    type="number"
                    value={editingTask.maxDailyPerUser || 1}
                    onChange={e => setEditingTask({ ...editingTask, maxDailyPerUser: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Visibility</label>
                  <select
                    value={editingTask.visibility || 'all'}
                    onChange={e => setEditingTask({ ...editingTask, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="all">All Users</option>
                    <option value="verified_only">Verified Only</option>
                    <option value="tier_specific">Tier Specific</option>
                    <option value="region_specific">Region Specific</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Task Status</label>
                  <select
                    value={editingTask.status || 'active'}
                    onChange={e => setEditingTask({ ...editingTask, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Category-Specific Inputs */}
              {editingTask.category === 'referral' && (
                <div>
                  <label className="block text-amber-300 mb-1 font-semibold">Required Referral Count</label>
                  <input
                    type="number"
                    value={editingTask.requiredReferralCount || 3}
                    onChange={e => setEditingTask({ ...editingTask, requiredReferralCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-white font-bold"
                  />
                </div>
              )}

              {editingTask.category === 'install' && (
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">App Store / Play Store Link</label>
                    <input
                      type="text"
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      value={editingTask.linkUrl || ''}
                      onChange={e => setEditingTask({ ...editingTask, linkUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">App Name</label>
                      <input
                        type="text"
                        placeholder="App Title"
                        value={editingTask.appName || ''}
                        onChange={e => setEditingTask({ ...editingTask, appName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">App Icon URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={editingTask.appIcon || ''}
                        onChange={e => setEditingTask({ ...editingTask, appIcon: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(editingTask.category === 'video' || editingTask.category === 'time_track') && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <label className="block text-slate-300 font-bold flex items-center justify-between">
                    <span>Video URL / Video Upload (YouTube, MP4, GCS)</span>
                    <span className="text-[10px] text-amber-400 font-normal">Supports watch, embed, shorts, mp4</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or https://storage.googleapis.com/..."
                      value={editingTask.videoUrl || ''}
                      onChange={e => setEditingTask({ ...editingTask, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                    <label className="w-full sm:w-auto px-3 py-2 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload MP4</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/m4v,video/quicktime"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editingTask.videoUrl && (
                    <div className="text-[11px] text-emerald-400 flex items-center justify-between font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="truncate max-w-[280px]">Active Video: {editingTask.videoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, videoUrl: '' })}
                        className="text-rose-400 font-bold hover:underline ml-2 text-[10px]"
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
              )}

              {editingTask.category === 'custom' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Custom Instructions for User</label>
                  <textarea
                    rows={2}
                    placeholder="Detailed steps for completing custom sponsor task..."
                    value={editingTask.instructions || ''}
                    onChange={e => setEditingTask({ ...editingTask, instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 cursor-pointer hover:scale-[1.01] transition-all"
              >
                {editingTask.id ? 'Update Sponsor Task' : 'Publish Sponsor Task'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Tasks Management</h3>
              <span className="text-xs text-slate-400">Total: {tasks.length}</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {tasks.map(t => (
                <div key={t.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {t.sponsorName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">
                          {t.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{t.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>
                    </div>

                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      +৳{t.rewardAmount} BDT
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Completions: <strong className="text-white">{t.completedUsersCount}</strong> / {t.maxUsers}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingTask({ ...t })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Directory Tab */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Users & Wallets</h3>
            <span className="text-xs text-slate-400">Click any user to perform Admin Wallet Balance Adjustment</span>
          </div>

          <div className="space-y-3">
            {allUsers.map(u => (
              <div key={u.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
                <div>
                  <h4 className="font-bold text-white text-sm">{u.name} ({u.email})</h4>
                  <span className="text-[11px] text-slate-400">
                    Phone: {u.phone} • Tier: <strong className="text-amber-400">{u.tierStatus}</strong> • Status: {u.verificationStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">B: ৳{u.wallets.bonusBalance}</span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">E: ৳{u.wallets.earnedBalance}</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">D: ৳{u.wallets.depositBalance}</span>
                    <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">S: ৳{u.wallets.securityBalance}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUserForAdjust(u)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Adjust Wallet
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Wallet Adjustment Modal */}
          {selectedUserForAdjust && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adjust Balance: {selectedUserForAdjust.name}</h3>
                  <button onClick={() => setSelectedUserForAdjust(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleAdjustWalletSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Target Wallet</label>
                    <select
                      value={adjustWalletType}
                      onChange={e => setAdjustWalletType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      <option value="earned">Earned Wallet (Current: ৳{selectedUserForAdjust.wallets.earnedBalance})</option>
                      <option value="deposit">Deposit Wallet (Current: ৳{selectedUserForAdjust.wallets.depositBalance})</option>
                      <option value="security">Security Wallet (Current: ৳{selectedUserForAdjust.wallets.securityBalance})</option>
                      <option value="bonus">Bonus Wallet (Current: ৳{selectedUserForAdjust.wallets.bonusBalance})</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Operation</label>
                      <select
                        value={adjustOperation}
                        onChange={e => setAdjustOperation(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="credit">Credit (Add Balance)</option>
                        <option value="debit">Debit (Deduct Balance)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Amount (BDT)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={adjustAmount}
                        onChange={e => setAdjustAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Reason / Note for Audit Log</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Refund for task error / Manual adjustment"
                      value={adjustReason}
                      onChange={e => setAdjustReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAdjust(null)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                    >
                      Confirm Adjustment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan & Tier System Control Tab (PART 8) */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          {/* Analytics Summary */}
          {planAnalytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Configured Plans</span>
                <div className="text-2xl font-black text-white">{planAnalytics.totalPlans}</div>
                <span className="text-[10px] text-emerald-400 font-medium block">Fully Configurable</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Public Plans</span>
                <div className="text-2xl font-black text-emerald-400">{planAnalytics.activePlans}</div>
                <span className="text-[10px] text-slate-400 font-medium block">Live on User Frontend</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Most Popular Plan</span>
                <div className="text-xl font-black text-amber-400">{planAnalytics.mostPopularPlan}</div>
                <span className="text-[10px] text-slate-400 font-medium block">Highest User Adoption</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Members Across Tiers</span>
                <div className="text-2xl font-black text-purple-400">{planAnalytics.totalUsersCount}</div>
                <span className="text-[10px] text-slate-400 font-medium block">Registered Earner Accounts</span>
              </div>
            </div>
          )}

          {/* Plan Header & Creator Button */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Enterprise Subscription & Tier Configurator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage Bronze, Silver, Gold, Diamond, VIP and custom earning plans. No source code changes required.
              </p>
            </div>
            <button
              onClick={() =>
                setEditingPlan({
                  id: `plan_${Date.now()}`,
                  name: 'New Custom Plan',
                  tierName: 'Custom',
                  refundableSecurityDeposit: 500,
                  dailyTaskLimit: 20,
                  dailyEarningLimit: 300,
                  maxSingleWithdrawal: 5000,
                  monthlyWithdrawalLimit: 50000,
                  benefits: ['20 Daily Tasks', '300 BDT Daily Earning Cap', '5,000 BDT Max Single Withdrawal', 'Priority Support'],
                  priority: 'medium',
                  displayOrder: plansList.length + 1,
                  status: 'Draft',
                  shortDescription: 'Custom subscription plan configured by system admin.',
                  detailedDescription: '### Custom Plan Details\n- **Security Deposit**: 500 BDT\n- **Daily Tasks**: 20 Tasks\n- **Max Withdrawal**: 5,000 BDT'
                })
              }
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </button>
          </div>

          {/* Configured Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansList.map(plan => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xl"
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">{plan.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Tier: {plan.tierName}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        plan.status === 'Active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : plan.status === 'Published'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : plan.status === 'Draft'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  {/* Security Deposit Banner */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-4">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Refundable Security Deposit</span>
                    <div className="text-xl font-black text-amber-400">৳{plan.refundableSecurityDeposit.toLocaleString()} BDT</div>
                  </div>

                  {/* Limits Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Daily Tasks</span>
                      <span className="font-bold text-white">{plan.dailyTaskLimit} Tasks</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Daily Earning Cap</span>
                      <span className="font-bold text-white">৳{plan.dailyEarningLimit} BDT</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Max Single Withdrawal</span>
                      <span className="font-bold text-emerald-400">৳{plan.maxSingleWithdrawal.toLocaleString()} BDT</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Monthly Limit</span>
                      <span className="font-bold text-purple-400">৳{plan.monthlyWithdrawalLimit.toLocaleString()} BDT</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{plan.shortDescription}</p>

                  {/* Benefits Checklist */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Benefits</span>
                    {plan.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Control Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPreviewPlan(plan)}
                      className="py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-blue-500/30 cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDuplicatePlan(plan.id)}
                      className="py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-purple-500/30 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={plan.status}
                      onChange={e => handlePlanStatus(plan.id, e.target.value as PlanStatus)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-lg border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan History & Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Plan History & Audit Trail</span>
            </h3>

            {planHistoryList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No plan updates recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {planHistoryList.map(item => (
                  <div key={item.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{item.planName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          {item.action}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.details}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 shrink-0">
                      <div>By: {item.performedBy}</div>
                      <div>{new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create / Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full my-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>{editingPlan.id ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}</span>
                  </h3>
                  <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Plan Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bronze Plan"
                        value={editingPlan.name || ''}
                        onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Tier Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bronze"
                        value={editingPlan.tierName || ''}
                        onChange={e => setEditingPlan({ ...editingPlan, tierName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Security Deposit (BDT) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editingPlan.refundableSecurityDeposit ?? 500}
                        onChange={e => setEditingPlan({ ...editingPlan, refundableSecurityDeposit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Daily Task Limit *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingPlan.dailyTaskLimit ?? 20}
                        onChange={e => setEditingPlan({ ...editingPlan, dailyTaskLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Daily Earning Cap (BDT) *</label>
                      <input
                        type="number"
                        min="10"
                        required
                        value={editingPlan.dailyEarningLimit ?? 300}
                        onChange={e => setEditingPlan({ ...editingPlan, dailyEarningLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Max Single Withdrawal (BDT) *</label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={editingPlan.maxSingleWithdrawal ?? 5000}
                        onChange={e => setEditingPlan({ ...editingPlan, maxSingleWithdrawal: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Monthly Withdrawal Limit (BDT) *</label>
                      <input
                        type="number"
                        min="1000"
                        required
                        value={editingPlan.monthlyWithdrawalLimit ?? 50000}
                        onChange={e => setEditingPlan({ ...editingPlan, monthlyWithdrawalLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Starter tier for daily video tasks and fast payouts"
                      value={editingPlan.shortDescription || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, shortDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Detailed Description (Markdown / Formatted Text)</label>
                    <textarea
                      rows={4}
                      placeholder="Use headings, bullet lists, bold text for full breakdown..."
                      value={editingPlan.detailedDescription || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, detailedDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Benefits (Comma-separated list)</label>
                    <input
                      type="text"
                      placeholder="e.g. 20 Daily Tasks, 300 BDT Earning Cap, Priority Support"
                      value={(editingPlan.benefits || []).join(', ')}
                      onChange={e =>
                        setEditingPlan({
                          ...editingPlan,
                          benefits: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Status</label>
                      <select
                        value={editingPlan.status || 'Active'}
                        onChange={e => setEditingPlan({ ...editingPlan, status: e.target.value as PlanStatus })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="Active">Active</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Priority</label>
                      <select
                        value={editingPlan.priority || 'medium'}
                        onChange={e => setEditingPlan({ ...editingPlan, priority: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Display Order</label>
                      <input
                        type="number"
                        min="1"
                        value={editingPlan.displayOrder ?? 1}
                        onChange={e => setEditingPlan({ ...editingPlan, displayOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-400/20"
                    >
                      Save & Apply Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Live Preview Modal */}
          {previewPlan && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-amber-400/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span>Frontend Preview: {previewPlan.name}</span>
                  </h3>
                  <button onClick={() => setPreviewPlan(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-white">{previewPlan.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {previewPlan.tierName} Tier
                    </span>
                  </div>

                  <div className="text-2xl font-black text-amber-400">
                    ৳{previewPlan.refundableSecurityDeposit} BDT
                    <span className="text-[10px] text-slate-400 font-normal block">Refundable Security Deposit</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800">
                    Single Withdrawal Limit: ৳{previewPlan.maxSingleWithdrawal.toLocaleString()} BDT
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{previewPlan.shortDescription}</p>

                  <div className="space-y-1 text-xs text-slate-300">
                    {previewPlan.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">{b}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20">
                    Upgrade to {previewPlan.name}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Broadcast Notifications Tab */}
      {activeSubTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                <span>Send Push Broadcast</span>
              </h3>
              <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🚀 Special 20% Deposit Bonus Today!"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Target User Segment</label>
                  <select
                    value={broadcastTargetGroup}
                    onChange={e => setBroadcastTargetGroup(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">🌐 All Registered Users</option>
                    <option value="verified_only">✅ Verified Users Only</option>
                    <option value="unverified_only">⏳ Unverified Users Only</option>
                    <option value="tier_vip">👑 VIP Tier Members Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type broadcast message details..."
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Push</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Delivered Broadcast History</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> FCM Server Connected
                </span>
              </div>

              {broadcastsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No push broadcasts sent yet.</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {broadcastsList.map(b => (
                    <div key={b.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-white text-sm">{b.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {b.recipientCount} Recipients ({b.targetGroup})
                          </span>
                          <button
                            onClick={() => handleDeleteBroadcast(b.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Broadcast Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{b.message}</p>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-2">
                        <span>Status: <strong className="text-emerald-400">{b.status.toUpperCase()}</strong></span>
                        <span>{new Date(b.sentAt || b.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports & Analytics Tab */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Enterprise Report & Data Export Generator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select report domain, filter parameters, and generate export datasets in CSV or JSON format.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold"
                >
                  <option value="user">👥 User Directory & Status Report</option>
                  <option value="deposit">💳 Deposit Transactions Report</option>
                  <option value="withdrawal">💸 Withdrawal Requests Report</option>
                  <option value="task">🎯 Sponsor Tasks & Completions Report</option>
                  <option value="plan">👑 Tier Subscription Plans Report</option>
                  <option value="audit">📜 System Audit Log Report</option>
                </select>

                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate Report Dataset</span>
                </button>
              </div>
            </div>

            {generatedReport && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">{generatedReport.reportTitle}</h4>
                    <span className="text-[10px] text-slate-400">Total Records: {generatedReport.recordCount} • Generated: {new Date(generatedReport.generatedAt).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      const jsonStr = JSON.stringify(generatedReport.data, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${generatedReport.reportTitle.replace(/\s+/g, '_')}.json`;
                      a.click();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        {generatedReport.data.length > 0 && Object.keys(generatedReport.data[0]).map(key => (
                          <th key={key} className="py-2.5 px-3 font-semibold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {generatedReport.data.slice(0, 20).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security & Anti-Fraud Tab */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Account Guard</span>
              <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Active & Monitoring</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device ID Ban Lock</span>
              <div className="text-xl font-black text-purple-400 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <span>0 Banned Devices</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Address Monitor</span>
              <div className="text-xl font-black text-indigo-400 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>100% Whitelisted</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto Fraud Rating</span>
              <div className="text-xl font-black text-amber-400 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>0 Critical Alerts</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Real-Time Security & Device Risk Control</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                The Security engine automatically inspects client device identifiers, browser fingerprints, and IP submission patterns to detect multi-account farming, proxy abuse, or suspicious balance manipulation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-purple-300">Device Fingerprint Guard</span>
                  <p className="text-[11px] text-slate-400">Strictly restricts user accounts to 1 device per withdrawal cycle.</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-emerald-300">Fraud Flag Threshold</span>
                  <p className="text-[11px] text-slate-400">Automatically freezes accounts attempting rapid spoofed task completions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Roles & Admin Accounts Management Tab */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          {/* Admin Accounts Management (Super Admin Feature) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Admin User Account Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add, update, activate/deactivate, or adjust roles for platform administrative staff.
                </p>
              </div>
            </div>

            {/* Add / Edit Admin Form */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                {editingAdminId ? 'Edit Admin Account' : '+ Add New Admin Account'}
              </h4>

              <form onSubmit={handleSaveAdminSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance Specialist"
                    value={adminForm.name}
                    onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gmail / Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@gmail.com"
                    value={adminForm.email}
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {editingAdminId ? 'New Password (Optional)' : 'Account Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingAdminId}
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Role</label>
                  <select
                    value={adminForm.role}
                    onChange={e => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Support Admin">Support Admin</option>
                    <option value="Content Admin">Content Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Account Status</label>
                  <select
                    value={adminForm.status}
                    onChange={e => setAdminForm({ ...adminForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    {editingAdminId ? 'Save Changes' : 'Create Admin'}
                  </button>
                  {editingAdminId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminId(null);
                        setAdminForm({ name: '', email: '', password: '', role: 'Finance Admin', status: 'Active' });
                      }}
                      className="px-3 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Admins List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Admin Accounts ({adminsList.length})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                      <th className="p-3">Admin Name</th>
                      <th className="p-3">Gmail / Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {adminsList.map(adm => {
                      const isSuperAdminAccount = adm.email.toLowerCase() === 'sponsorearn00@gmail.com';
                      return (
                        <tr key={adm.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span>{adm.name}</span>
                            {isSuperAdminAccount && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                                PERMANENT SUPER ADMIN
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-300">{adm.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                              {adm.adminRole || (isSuperAdminAccount ? 'Super Admin' : 'Admin')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              adm.status === 'Active' || adm.status === 'Verified'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {adm.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingAdminId(adm.id);
                                  setAdminForm({
                                    name: adm.name,
                                    email: adm.email,
                                    password: '',
                                    role: adm.adminRole || 'Finance Admin',
                                    status: adm.status || 'Active'
                                  });
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Edit Role
                              </button>
                              {!isSuperAdminAccount && (
                                <button
                                  onClick={() => handleDeleteAdmin(adm.id)}
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                                >
                                  Remove Admin
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <span>Enterprise Role-Based Access Control (RBAC) Permissions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure module granular permissions for Support, Finance, Content, and Super Admin roles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['Super Admin', 'Finance Admin', 'Support Admin', 'Content Admin'] as AdminRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveAdminRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeAdminRole === r
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Role Scope: {activeAdminRole}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { perm: 'User Management & Status Override', enabled: true },
                  { perm: 'Wallet Balance Adjustment & Freezing', enabled: activeAdminRole !== 'Content Admin' },
                  { perm: 'Deposit Approval & Rejection', enabled: activeAdminRole === 'Super Admin' || activeAdminRole === 'Finance Admin' },
                  { perm: 'Withdrawal Approval & Rejection', enabled: activeAdminRole === 'Super Admin' || activeAdminRole === 'Finance Admin' },
                  { perm: 'Sponsor Task Creation & Scheduling', enabled: activeAdminRole === 'Super Admin' || activeAdminRole === 'Content Admin' },
                  { perm: 'Tier Subscription Plan Management', enabled: activeAdminRole === 'Super Admin' },
                  { perm: 'Push Broadcast Notifications', enabled: activeAdminRole === 'Super Admin' || activeAdminRole === 'Support Admin' },
                  { perm: 'System Settings & Maintenance Mode', enabled: activeAdminRole === 'Super Admin' },
                  { perm: 'Database Backup & Snapshot Restore', enabled: activeAdminRole === 'Super Admin' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-medium">{item.perm}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.enabled ? 'GRANTED' : 'RESTRICTED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Enterprise Global System Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure branding, maintenance mode, and support contacts without code changes.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="space-y-4 text-xs">
            {/* Maintenance Mode Toggle Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              systemSettingsForm.maintenanceMode
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}>
              <div>
                <span className="font-bold text-sm block">System Maintenance Mode</span>
                <span className="text-[11px] opacity-80">
                  {systemSettingsForm.maintenanceMode ? '🚨 System is locked for public users.' : '✅ System is fully live and operational.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSystemSettingsForm({ ...systemSettingsForm, maintenanceMode: !systemSettingsForm.maintenanceMode })}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  systemSettingsForm.maintenanceMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                }`}
              >
                {systemSettingsForm.maintenanceMode ? 'TURN OFF MAINTENANCE' : 'ENABLE MAINTENANCE MODE'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Application Name</label>
                <input
                  type="text"
                  required
                  value={systemSettingsForm.appName}
                  onChange={e => setSystemSettingsForm({ ...systemSettingsForm, appName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Default Signup Bonus (BDT)</label>
                <input
                  type="number"
                  required
                  value={systemSettingsForm.defaultSignupBonus}
                  onChange={e => setSystemSettingsForm({ ...systemSettingsForm, defaultSignupBonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Support WhatsApp Number</label>
                <input
                  type="text"
                  value={systemSettingsForm.supportWhatsApp}
                  onChange={e => setSystemSettingsForm({ ...systemSettingsForm, supportWhatsApp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Support Telegram Channel</label>
                <input
                  type="text"
                  value={systemSettingsForm.supportTelegram}
                  onChange={e => setSystemSettingsForm({ ...systemSettingsForm, supportTelegram: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Support Email Address</label>
              <input
                type="email"
                value={systemSettingsForm.supportEmail}
                onChange={e => setSystemSettingsForm({ ...systemSettingsForm, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Save Global System Settings
            </button>
          </form>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeSubTab === 'backups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Create Database Backup</span>
              </h3>

              <form onSubmit={handleCreateBackup} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Snapshot Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily_Backup_July30"
                    value={newBackupName}
                    onChange={e => setNewBackupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Backup Scope</label>
                  <select
                    value={newBackupType}
                    onChange={e => setNewBackupType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="full">📦 Full Platform State (JSON)</option>
                    <option value="database">🗄️ Users & Financial Transactions</option>
                    <option value="settings">⚙️ System Configurations</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Server className="w-4 h-4" />
                  <span>Generate Snapshot Backup</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Backup Snapshots History & Restore</span>
              </h3>

              {backupsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No backup snapshots created yet.</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {backupsList.map(b => (
                    <div key={b.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-white text-xs block">{b.snapshotName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Scope: {b.type.toUpperCase()} • Size: {(b.sizeBytes / 1024).toFixed(1)} KB • {new Date(b.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRestoreBackup(b.id)}
                        className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Restore Snapshot
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner Tab */}
      {activeSubTab === 'notices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Publish / Edit Notice Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>{editingNoticeId ? 'Edit Notice' : 'Publish Notice'}</span>
                </h3>
                {editingNoticeId && (
                  <button
                    onClick={resetNoticeForm}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    + Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handlePublishNotice} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Notice Title (Bangla / English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. নতুন সিকিউরিটি ডিপোজিট ও পেমেন্ট রুলস"
                    value={noticeTitle}
                    onChange={e => setNoticeTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Notice Content / Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full details. Long formatted text is supported with scrolling in the modal view."
                    value={noticeContent}
                    onChange={e => setNoticeContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Notice Category</label>
                    <select
                      value={noticeType}
                      onChange={e => setNoticeType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="notice">General Notice</option>
                      <option value="banner">Promo Banner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Admin Author Name</label>
                    <input
                      type="text"
                      placeholder="e.g. System Admin"
                      value={noticeAdminName}
                      onChange={e => setNoticeAdminName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={noticeImageUrl}
                    onChange={e => setNoticeImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={noticeIsPinned}
                    onChange={e => setNoticeIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isPinned" className="text-slate-200 font-bold flex items-center gap-1 cursor-pointer">
                    <Pin className="w-3.5 h-3.5 text-amber-400" />
                    Pin to top of Home Dashboard
                  </label>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    {editingNoticeId ? 'Save Changes' : 'Publish Notice'}
                  </button>
                  {editingNoticeId && (
                    <button
                      type="button"
                      onClick={resetNoticeForm}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Published Notices List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Published Notices ({adminNoticesList.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Top pinned notices appear first on Earner Dashboard
                </span>
              </div>

              {adminNoticesList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No notices created yet.</div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {adminNoticesList.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        n.isPinned
                          ? 'bg-amber-500/5 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {n.isPinned && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                                <Pin className="w-3 h-3 fill-slate-950" />
                                PINNED TOP
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              {n.type || 'Notice'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              n.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {n.isActive ? 'Active' : 'Hidden'}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-auto">
                              {new Date(n.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug">
                            {n.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-2">
                            {n.content}
                          </p>

                          <div className="text-[11px] text-slate-500 pt-1">
                            Publisher: <strong className="text-slate-300">{n.adminName || 'System Admin'}</strong>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleNoticePin(n.id, n.isPinned)}
                            title={n.isPinned ? 'Unpin' : 'Pin to Top'}
                            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                              n.isPinned
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Pin className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleNoticeActive(n.id, n.isActive)}
                            title={n.isActive ? 'Hide Notice' : 'Publish Notice'}
                            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                              n.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 hover:text-white'
                            }`}
                          >
                            {n.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleEditNotice(n)}
                            title="Edit Notice"
                            className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteNotice(n.id)}
                            title="Delete Notice"
                            className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Audit Logs</h3>
          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No audit logs recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-purple-300">{log.action}</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-white font-medium">{log.details}</p>
                  <span className="text-[10px] text-slate-500 block">Actor ID: {log.actorId} • Target: {log.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
