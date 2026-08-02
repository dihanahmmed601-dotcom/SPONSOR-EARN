export type WalletType = 'bonus' | 'earned' | 'deposit' | 'security';

export type TierLevel = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'VIP' | 'Basic' | 'Standard' | 'Premium' | string;

export type UserStatus = 'Pending' | 'Active' | 'Verified' | 'Suspended' | 'Blocked' | 'Inactive';

export type UserRole = 'user' | 'admin';

export interface UserWallet {
  bonusBalance: number;     // Signup bonus, non-withdrawable
  earnedBalance: number;    // Task & referral rewards, withdrawable after verification
  depositBalance: number;   // User deposited money, 100% user owned
  securityBalance: number;  // Refundable security deposit for tier verification
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  adminRole?: AdminRole;
  passwordHash?: string;
  country: string;
  profilePhoto?: string;
  registrationDate: string;
  status: UserStatus;
  verificationStatus: 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
  tierStatus: TierLevel;
  referralCode: string;
  sponsorId?: string;
  wallets: UserWallet;
  totalEarnings: number;
  todayEarnings: number;
  monthlyEarnings: number;
  totalWithdraw: number;
  totalDeposit: number;
  completedTasksCount: number;
  referralCount: number;
  deviceId: string;
  lastLogin?: string;
  fcmToken?: string;
  pushEnabled?: boolean;
  maxSingleWithdrawal?: number;
  dailyTaskLimit?: number;
  dailyEarningLimit?: number;
  activeTierInfo?: {
    name: string;
    securityDeposit: number;
    maxSingleWithdrawal: number;
    dailyTaskLimit: number;
    dailyEarningLimit: number;
  };
}

export type PlanStatus = 'Draft' | 'Published' | 'Active' | 'Inactive' | 'Archived';

export interface SubscriptionPlan {
  id: string;
  name: string;
  planImage?: string;
  planIcon?: string;
  shortDescription: string;
  detailedDescription: string;
  tierName: string;
  refundableSecurityDeposit: number;
  dailyTaskLimit: number;
  dailyEarningLimit: number;
  maxSingleWithdrawal: number;
  monthlyWithdrawalLimit: number;
  benefits: string[];
  priority: 'high' | 'medium' | 'low';
  displayOrder: number;
  status: PlanStatus;
  publishDate: string;
  scheduledPublishDate?: string;
  lastUpdated: string;
  customBenefits?: { key: string; value: string }[];
}

export interface PlanHistoryRecord {
  id: string;
  planId: string;
  planName: string;
  action: 'Created' | 'Updated' | 'Activated' | 'Deactivated' | 'Upgraded' | 'Downgraded' | 'Published' | 'Archived' | 'Duplicated';
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface PlanUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  currentPlanId: string;
  currentPlanName: string;
  requestedPlanId: string;
  requestedPlanName: string;
  requiredDeposit: number;
  userDepositBalance: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestType: 'upgrade' | 'downgrade';
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface TierConfig {
  name: TierLevel;
  securityDeposit: number; // In BDT (e.g. Basic: 200, Standard: 500, Premium: 1000, VIP: 2000)
  maxSingleWithdrawal: number; // e.g., Basic: 2000, Standard: 5000, Premium: 10000, VIP: 20000
  description: string;
  benefits: string[];
  active: boolean;
}

export type TaskCategory = 'video' | 'install' | 'referral' | 'custom' | 'time_track';

export type TaskStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'completed' | 'deleted';

export type TaskVisibility = 'all' | 'verified_only' | 'tier_specific' | 'region_specific' | 'campaign';

export interface SponsorTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardAmount: number; // Added to Earned Balance
  imageUrl?: string;
  thumbnail: string;
  sponsorName: string;
  sponsorLogo?: string;
  durationSeconds: number; // Duration required for video/time tracking
  startDate?: string;
  expiryDate: string;
  status: TaskStatus;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  maxUsers: number;
  completedUsersCount: number;
  maxDailyPerUser: number;
  visibility?: TaskVisibility;
  targetTier?: TierLevel;
  targetRegion?: string;
  campaignName?: string;
  linkUrl?: string;
  videoUrl?: string;
  appName?: string;
  appIcon?: string;
  requiredReferralCount?: number;
  instructions?: string;
  campaignDuration?: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  taskTitle: string;
  category?: TaskCategory;
  rewardEarned: number;
  walletType: WalletType;
  txId?: string;
  status: 'pending' | 'completed' | 'rejected' | 'expired';
  completedAt: string;
  proofNote?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export interface PaymentGatewayConfig {
  id: string; // 'bKash' | 'Nagad' | 'Rocket'
  name: PaymentMethod;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
  instructions: string;
  enabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  screenshotUrl?: string;
  proofNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userTier: TierLevel;
  amount: number;
  method: PaymentMethod;
  accountNumber: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  transactionId: string;
  createdAt: string;
  processedAt?: string;
  rejectReason?: string;
  adminRemark?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  targetTier: TierLevel;
  requiredDeposit: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  nidOrPassport?: string;
  documentPhotoUrl?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  walletType: WalletType;
  amount: number;
  type: 'credit' | 'debit';
  title: string;
  description: string;
  txId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' or specific userId
  title: string;
  message: string;
  type: 'system' | 'deposit' | 'withdrawal' | 'task' | 'referral' | 'verification' | 'announcement';
  isRead: boolean;
  createdAt: string;
}

export interface NoticeBanner {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sponsorLogoUrl?: string;
  videoUrl?: string;
  isActive: boolean;
  isPinned?: boolean;
  adminName?: string;
  type: 'notice' | 'banner' | 'announcement' | 'sponsor_logo';
  createdAt: string;
  expiryDate?: string;
}

export interface SponsorBrand {
  id: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
  websiteUrl?: string;
  status: 'active' | 'paused' | 'draft' | 'inactive';
  createdAt: string;
}

export interface SponsorCampaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  campaignName: string;
  description: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'completed';
  budgetAmount: number;
  spentAmount: number;
  associatedTaskIds: string[];
  createdAt: string;
}

export interface ReferralRecord {
  id: string; // Reward ID
  txId: string; // Transaction ID
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  referredUserPhone: string;
  rewardAmount: number;
  rewardDate: string;
  status: 'credited' | 'pending' | 'rejected' | 'canceled';
}

export interface ReferralSettings {
  isEnabled: boolean;
  rewardAmount: number;
  campaignStatus: 'active' | 'paused';
  requireVerificationForReward: boolean;
  monthlyLeaderboardPrizePool: number;
}

export interface ReferralStat {
  userId: string;
  userName: string;
  referralCode: string;
  totalReferredCount: number;
  activeReferredCount: number;
  inactiveReferredCount: number;
  todayReferredCount: number;
  monthlyReferredCount: number;
  totalCommissionsEarned: number;
  rank: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  replies: {
    sender: 'user' | 'admin' | 'ai';
    message: string;
    timestamp: string;
  }[];
}

export type AdminRole = 'Super Admin' | 'Finance Admin' | 'Support Admin' | 'Content Admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  lastLogin?: string;
}

export interface SystemSettings {
  appName: string;
  appLogo: string;
  themeColor: string;
  language: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultSignupBonus: number;
  supportWhatsApp: string;
  supportTelegram: string;
  supportEmail: string;
  otpAuthEnabled: boolean;
  autoApproveWithdrawalLimit: number;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  targetGroup: 'all' | 'verified_only' | 'unverified_only' | 'tier_vip' | 'custom_users';
  targetUserIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipientCount: number;
  createdAt: string;
}

export interface BackupSnapshot {
  id: string;
  snapshotName: string;
  type: 'database' | 'media' | 'settings' | 'full';
  sizeBytes: number;
  createdAt: string;
  backupDataJson?: string;
}

export interface SystemAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  module?: string;
  target: string;
  details: string;
  ipAddress?: string;
  device?: string;
  createdAt: string;
}

export interface AntiFraudFlag {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  status: 'open' | 'investigating' | 'cleared' | 'banned';
  createdAt: string;
}
