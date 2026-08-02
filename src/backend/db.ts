import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  SponsorTask,
  TaskCompletion,
  DepositRequest,
  WithdrawalRequest,
  VerificationRequest,
  WalletTransaction,
  AppNotification,
  NoticeBanner,
  SupportTicket,
  SystemAuditLog,
  AntiFraudFlag,
  TierConfig,
  PaymentGatewayConfig,
  SponsorBrand,
  SponsorCampaign,
  ReferralRecord,
  ReferralSettings,
  SubscriptionPlan,
  PlanHistoryRecord,
  PlanUpgradeRequest,
  SystemSettings,
  BroadcastNotification,
  BackupSnapshot
} from '../types';

interface DatabaseSchema {
  users: UserProfile[];
  tasks: SponsorTask[];
  taskCompletions: TaskCompletion[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  verifications: VerificationRequest[];
  transactions: WalletTransaction[];
  notifications: AppNotification[];
  notices: NoticeBanner[];
  supportTickets: SupportTicket[];
  auditLogs: SystemAuditLog[];
  fraudFlags: AntiFraudFlag[];
  tierConfigs: TierConfig[];
  paymentGateways: PaymentGatewayConfig[];
  sponsors: SponsorBrand[];
  sponsorCampaigns: SponsorCampaign[];
  referralRecords: ReferralRecord[];
  referralSettings: ReferralSettings;
  subscriptionPlans: SubscriptionPlan[];
  planHistory: PlanHistoryRecord[];
  planUpgradeRequests: PlanUpgradeRequest[];
  systemSettings: SystemSettings;
  broadcasts: BroadcastNotification[];
  backups: BackupSnapshot[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'backend', 'data.json');

const defaultTierConfigs: TierConfig[] = [
  {
    name: 'Bronze',
    securityDeposit: 200,
    maxSingleWithdrawal: 2000,
    description: 'Bronze tier for new active earners.',
    benefits: ['10 Daily Tasks', '150 BDT Daily Earning Cap', '2,000 BDT Max Single Withdrawal', 'Standard Support', '5% Referral Commission'],
    active: true
  },
  {
    name: 'Silver',
    securityDeposit: 500,
    maxSingleWithdrawal: 5000,
    description: 'Silver earner package with enhanced rewards.',
    benefits: ['25 Daily Tasks', '400 BDT Daily Earning Cap', '5,000 BDT Max Single Withdrawal', 'Priority Support', '8% Referral Commission'],
    active: true
  },
  {
    name: 'Gold',
    securityDeposit: 1000,
    maxSingleWithdrawal: 10000,
    description: 'Gold pro package with express payouts.',
    benefits: ['50 Daily Tasks', '1,000 BDT Daily Earning Cap', '10,000 BDT Max Single Withdrawal', 'Express Payouts (Within 2 Hours)', '10% Referral Commission'],
    active: true
  },
  {
    name: 'Diamond',
    securityDeposit: 1800,
    maxSingleWithdrawal: 15000,
    description: 'Diamond executive package with automated instant withdrawals.',
    benefits: ['80 Daily Tasks', '2,000 BDT Daily Earning Cap', '15,000 BDT Max Single Withdrawal', 'Instant Automated Withdrawals', '12% Referral Commission'],
    active: true
  },
  {
    name: 'VIP',
    securityDeposit: 2500,
    maxSingleWithdrawal: 25000,
    description: 'VIP elite tier with maximum limits and direct support.',
    benefits: ['150 Daily Tasks', '5,000 BDT Daily Earning Cap', '25,000 BDT Max Single Withdrawal', '100% Instant Automated Withdrawals', '15% Referral Commission'],
    active: true
  },
  {
    name: 'Basic',
    securityDeposit: 200,
    maxSingleWithdrawal: 2000,
    description: 'Entry level verification tier for new users.',
    benefits: ['Up to 2,000 BDT single withdrawal limit', 'Full access to daily sponsor tasks', 'Standard referral commission (5%)'],
    active: true
  },
  {
    name: 'Standard',
    securityDeposit: 500,
    maxSingleWithdrawal: 5000,
    description: 'Popular tier for regular active earners.',
    benefits: ['Up to 5,000 BDT single withdrawal limit', 'Priority task assignment', 'Enhanced referral commission (8%)'],
    active: true
  },
  {
    name: 'Premium',
    securityDeposit: 1000,
    maxSingleWithdrawal: 10000,
    description: 'High earning limits with dedicated support.',
    benefits: ['Up to 10,000 BDT single withdrawal limit', 'Express payout processing within 2 hours', '10% referral commission'],
    active: true
  }
];

const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'plan_bronze',
    name: 'Bronze Plan',
    planImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    planIcon: 'Award',
    shortDescription: 'Ideal starter plan for new active earners with refundable deposit.',
    detailedDescription: '### Bronze Starter Package\n- **Refundable Security Deposit**: 200 BDT\n- **Daily Task Limit**: 10 Tasks per day\n- **Daily Earning Cap**: 150 BDT\n- **Maximum Single Withdrawal**: 2,000 BDT\n- **Monthly Withdrawal Limit**: 30,000 BDT\n- **Referral Commission**: 5%\n- **Support**: Standard 24/7 Support Ticket access',
    tierName: 'Bronze',
    refundableSecurityDeposit: 200,
    dailyTaskLimit: 10,
    dailyEarningLimit: 150,
    maxSingleWithdrawal: 2000,
    monthlyWithdrawalLimit: 30000,
    benefits: ['10 Daily Tasks', '150 BDT Daily Earning Cap', '2,000 BDT Max Single Withdrawal', 'Standard Support', '5% Referral Commission'],
    priority: 'low',
    displayOrder: 1,
    status: 'Active',
    publishDate: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'plan_silver',
    name: 'Silver Plan',
    planImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
    planIcon: 'Shield',
    shortDescription: 'Most popular plan for consistent daily earners with enhanced rewards.',
    detailedDescription: '### Silver Earner Package\n- **Refundable Security Deposit**: 500 BDT\n- **Daily Task Limit**: 25 Tasks per day\n- **Daily Earning Cap**: 400 BDT\n- **Maximum Single Withdrawal**: 5,000 BDT\n- **Monthly Withdrawal Limit**: 75,000 BDT\n- **Referral Commission**: 8%\n- **Support**: Fast Priority Support & Exclusive Sponsor Tasks',
    tierName: 'Silver',
    refundableSecurityDeposit: 500,
    dailyTaskLimit: 25,
    dailyEarningLimit: 400,
    maxSingleWithdrawal: 5000,
    monthlyWithdrawalLimit: 75000,
    benefits: ['25 Daily Tasks', '400 BDT Daily Earning Cap', '5,000 BDT Max Single Withdrawal', 'Priority Support', '8% Referral Commission', 'Exclusive Sponsor Tasks'],
    priority: 'medium',
    displayOrder: 2,
    status: 'Active',
    publishDate: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'plan_gold',
    name: 'Gold Plan',
    planImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    planIcon: 'Sparkles',
    shortDescription: 'High-earning capacity plan with express payout processing in 2 hours.',
    detailedDescription: '### Gold Pro Package\n- **Refundable Security Deposit**: 1,000 BDT\n- **Daily Task Limit**: 50 Tasks per day\n- **Daily Earning Cap**: 1,000 BDT\n- **Maximum Single Withdrawal**: 10,000 BDT\n- **Monthly Withdrawal Limit**: 150,000 BDT\n- **Referral Commission**: 10%\n- **Express Payouts**: Processed within 2 hours Guaranteed',
    tierName: 'Gold',
    refundableSecurityDeposit: 1000,
    dailyTaskLimit: 50,
    dailyEarningLimit: 1000,
    maxSingleWithdrawal: 10000,
    monthlyWithdrawalLimit: 150000,
    benefits: ['50 Daily Tasks', '1,000 BDT Daily Earning Cap', '10,000 BDT Max Single Withdrawal', 'Express Payouts (Within 2 Hours)', '10% Referral Commission', 'Exclusive Campaign Access', 'Special Bonus Events'],
    priority: 'high',
    displayOrder: 3,
    status: 'Active',
    publishDate: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'plan_diamond',
    name: 'Diamond Plan',
    planImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    planIcon: 'Gem',
    shortDescription: 'Professional earner plan with automated instant withdrawal capabilities.',
    detailedDescription: '### Diamond Executive Package\n- **Refundable Security Deposit**: 1,800 BDT\n- **Daily Task Limit**: 80 Tasks per day\n- **Daily Earning Cap**: 2,000 BDT\n- **Maximum Single Withdrawal**: 15,000 BDT\n- **Monthly Withdrawal Limit**: 250,000 BDT\n- **Referral Commission**: 12%\n- **Automated Payouts**: Instant approval for verified accounts',
    tierName: 'Diamond',
    refundableSecurityDeposit: 1800,
    dailyTaskLimit: 80,
    dailyEarningLimit: 2000,
    maxSingleWithdrawal: 15000,
    monthlyWithdrawalLimit: 250000,
    benefits: ['80 Daily Tasks', '2,000 BDT Daily Earning Cap', '15,000 BDT Max Single Withdrawal', 'Instant Automated Withdrawals', '12% Referral Commission', 'Dedicated Manager'],
    priority: 'high',
    displayOrder: 4,
    status: 'Active',
    publishDate: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'plan_vip',
    name: 'VIP Plan',
    planImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
    planIcon: 'Crown',
    shortDescription: 'Elite tier with maximum limits, direct admin line, and top bonuses.',
    detailedDescription: '### VIP Elite Package\n- **Refundable Security Deposit**: 2,500 BDT\n- **Daily Task Limit**: 150 Tasks per day\n- **Daily Earning Cap**: 5,000 BDT\n- **Maximum Single Withdrawal**: 25,000 BDT\n- **Monthly Withdrawal Limit**: 500,000 BDT\n- **Referral Commission**: 15%\n- **Support**: Direct WhatsApp Line with System Admin & VIP Leader Badge',
    tierName: 'VIP',
    refundableSecurityDeposit: 2500,
    dailyTaskLimit: 150,
    dailyEarningLimit: 5000,
    maxSingleWithdrawal: 25000,
    monthlyWithdrawalLimit: 500000,
    benefits: ['150 Daily Tasks', '5,000 BDT Daily Earning Cap', '25,000 BDT Max Single Withdrawal', '100% Instant Automated Withdrawals', '15% Referral Commission', 'Direct WhatsApp Line with Admin', 'Custom Event Bonuses'],
    priority: 'high',
    displayOrder: 5,
    status: 'Active',
    publishDate: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z'
  }
];

const defaultUsers: UserProfile[] = [
  {
    id: 'usr_super_admin',
    name: 'Super Admin',
    username: 'sponsorearn00',
    email: 'sponsorearn00@gmail.com',
    phone: '+8801700000000',
    role: 'admin',
    country: 'Bangladesh',
    registrationDate: '2026-01-01',
    status: 'Verified',
    verificationStatus: 'Verified',
    tierStatus: 'VIP',
    referralCode: 'SPONSOREARN',
    wallets: {
      bonusBalance: 10000,
      earnedBalance: 50000,
      depositBalance: 100000,
      securityBalance: 0
    },
    totalEarnings: 60000,
    todayEarnings: 1000,
    monthlyEarnings: 30000,
    totalWithdraw: 0,
    totalDeposit: 100000,
    completedTasksCount: 100,
    referralCount: 50,
    deviceId: 'dev_super_admin_001'
  },
  {
    id: 'usr_admin',
    name: 'System Admin',
    username: 'admin',
    email: 'admin@earningplatform.com',
    phone: '+8801700000000',
    role: 'admin',
    country: 'Bangladesh',
    registrationDate: '2026-01-01',
    status: 'Verified',
    verificationStatus: 'Verified',
    tierStatus: 'VIP',
    referralCode: 'ADMIN00',
    wallets: {
      bonusBalance: 0,
      earnedBalance: 0,
      depositBalance: 0,
      securityBalance: 0
    },
    totalEarnings: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
    completedTasksCount: 0,
    referralCount: 15,
    deviceId: 'dev_admin_001'
  },
  {
    id: 'usr_demo',
    name: 'Rahat Chowdhury',
    username: 'rahat88',
    email: 'user@earningplatform.com',
    phone: '+8801811111111',
    role: 'user',
    country: 'Bangladesh',
    registrationDate: '2026-02-15',
    status: 'Verified',
    verificationStatus: 'Verified',
    tierStatus: 'Basic',
    referralCode: 'RAHAT88',
    wallets: {
      bonusBalance: 100,
      earnedBalance: 350,
      depositBalance: 1000,
      securityBalance: 200
    },
    totalEarnings: 850,
    todayEarnings: 60,
    monthlyEarnings: 450,
    totalWithdraw: 500,
    totalDeposit: 1200,
    completedTasksCount: 12,
    referralCount: 3,
    deviceId: 'dev_user_881'
  }
];

const defaultTasks: SponsorTask[] = [
  {
    id: 'tsk_001',
    title: 'Watch Sponsor Promo: TechGadget 2026 Showcase',
    description: 'Watch the full 30-second sponsor video to earn instant rewards credited to your Earned Wallet.',
    category: 'video',
    rewardAmount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 30,
    expiryDate: '2026-12-31',
    status: 'active',
    maxUsers: 5000,
    completedUsersCount: 1280,
    maxDailyPerUser: 1,
    sponsorName: 'TechGadget Asia',
    linkUrl: 'https://youtube.com',
    instructions: 'Keep the video active for 30 seconds until the completion claim button lights up.'
  },
  {
    id: 'tsk_002',
    title: 'Install & Register: FinPay Digital Wallet App',
    description: 'Download the FinPay wallet app from Google Play, complete registration and submit screenshot proof.',
    category: 'install',
    rewardAmount: 45,
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 0,
    expiryDate: '2026-12-31',
    status: 'active',
    maxUsers: 2000,
    completedUsersCount: 840,
    maxDailyPerUser: 1,
    sponsorName: 'FinPay Bangladesh',
    linkUrl: 'https://play.google.com',
    instructions: 'Click the link, install the application, open it, and type your registered phone number as proof note.'
  },
  {
    id: 'tsk_003',
    title: 'Focus & Engage Session: Sponsor Ad Portal',
    description: 'Stay active on sponsor content page for 60 seconds with live timer tracking.',
    category: 'time_track',
    rewardAmount: 20,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 60,
    expiryDate: '2026-12-31',
    status: 'active',
    maxUsers: 10000,
    completedUsersCount: 3200,
    maxDailyPerUser: 2,
    sponsorName: 'Digital Ads Hub',
    instructions: 'Press Start Session and keep the window focused until 60 seconds elapses.'
  },
  {
    id: 'tsk_004',
    title: 'Referral Sprint: Invite 3 Verified Active Friends',
    description: 'Invite 3 friends who register using your referral code and complete basic account verification.',
    category: 'referral',
    rewardAmount: 100,
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 0,
    expiryDate: '2026-12-31',
    status: 'active',
    maxUsers: 5000,
    completedUsersCount: 650,
    maxDailyPerUser: 1,
    sponsorName: 'Sponsor Referral Pool',
    instructions: 'Share your personal referral link from the Referral section.'
  }
];

const defaultNotices: NoticeBanner[] = [
  {
    id: 'not_001',
    title: 'গুরুত্বপূর্ণ ঘোষণা: নতুন সিকিউরিটি ডিপোজিট ও ইনস্ট্যান্ট পেমেন্ট সুবিধা চালু',
    content: 'সম্মানিত গ্রাহকবৃন্দ, আপনাদের সুবিধার কথা চিন্তা করে প্ল্যাটফর্মের সিকিউরিটি ডিপোজিট এবং উইথড্রয়াল প্রক্রিয়া আরও সহজ করা হয়েছে। লেভেল ২ ভেরিফিকেশন সম্পন্ন করলেই আপনি পাবেন ইনস্ট্যান্ট উইথড্রয়াল সুবিধা। মনে রাখবেন, আপনার জমা করা সিকিউরিটি ডিপোজিট ১০০% রিফান্ডেবল এবং যেকোনো সময় ফেরতযোগ্য। যেকোনো অনুসন্ধানের জন্য আমাদের হেল্পডেস্কে যোগাযোগ করুন।',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isPinned: true,
    adminName: 'সিস্টেম অ্যাডমিন (System Admin)',
    type: 'announcement',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'not_002',
    title: 'bKash, Nagad & Rocket Automated Deposit System Active',
    content: 'Deposit verification is now 100% automated! When topping up your Deposit Wallet, send the payment to our official merchant cash numbers and enter your 10-digit transaction ID (TxID). Balance updates within 1 to 3 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isPinned: false,
    adminName: 'Finance Operations',
    type: 'notice',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'not_003',
    title: 'Sponsor Rewards Campaign 2026 Guidelines',
    content: 'Maximize your daily earnings by completing active sponsor video ads and promotional tasks. Higher verification tiers unlock increased daily earning caps and lower payout threshold times.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    isPinned: false,
    adminName: 'Campaign Manager',
    type: 'banner',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const defaultTransactions: WalletTransaction[] = [
  {
    id: 'tx_1001',
    userId: 'usr_demo',
    walletType: 'bonus',
    amount: 100,
    type: 'credit',
    title: 'Signup Welcome Bonus',
    description: 'Welcome bonus added to Bonus Wallet upon registration',
    txId: 'BONUS-REG-1001',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'tx_1002',
    userId: 'usr_demo',
    walletType: 'deposit',
    amount: 1000,
    type: 'credit',
    title: 'bKash Manual Deposit',
    description: 'Deposit approved by admin via bKash TxID 9J82K391',
    txId: 'DEP-BKASH-9J82K391',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'tx_1003',
    userId: 'usr_demo',
    walletType: 'security',
    amount: 200,
    type: 'credit',
    title: 'Basic Tier Security Deposit',
    description: 'Refundable Security Deposit locked in Security Wallet for Basic Tier Verification',
    txId: 'SEC-BASIC-8802',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'tx_1004',
    userId: 'usr_demo',
    walletType: 'earned',
    amount: 350,
    type: 'credit',
    title: 'Sponsor Task Rewards',
    description: 'Earned from watching sponsor videos and app installation tasks',
    txId: 'TSK-EARN-7731',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const defaultNotifications: AppNotification[] = [
  {
    id: 'ntf_001',
    userId: 'usr_demo',
    title: 'Account Verification Approved',
    message: 'Your Basic Tier ID verification has been approved! Withdrawal is now enabled up to 2,000 BDT.',
    type: 'verification',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ntf_002',
    userId: 'usr_demo',
    title: 'Deposit Approved',
    message: 'Your deposit of 1,000 BDT via bKash has been credited to your Deposit Wallet.',
    type: 'deposit',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

const defaultPaymentGateways: PaymentGatewayConfig[] = [
  {
    id: 'bKash',
    name: 'bKash',
    accountType: 'Personal',
    accountNumber: '01700000000',
    accountName: 'Sponsor Platform bKash',
    qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    instructions: '1. Open bKash app or dial *247#.\n2. Choose "Send Money" or "Cash In".\n3. Enter Account Number: 01700000000.\n4. Copy the 10-character Transaction ID (TxID) and submit here.',
    enabled: true,
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdrawal: 100,
    maxWithdrawal: 20000
  },
  {
    id: 'Nagad',
    name: 'Nagad',
    accountType: 'Personal',
    accountNumber: '01811111111',
    accountName: 'Sponsor Platform Nagad',
    qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    instructions: '1. Open Nagad app or dial *167#.\n2. Choose "Send Money".\n3. Enter Account Number: 01811111111.\n4. Copy the Transaction ID (TxID) and submit here.',
    enabled: true,
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdrawal: 100,
    maxWithdrawal: 20000
  },
  {
    id: 'Rocket',
    name: 'Rocket',
    accountType: 'Personal',
    accountNumber: '01922222222',
    accountName: 'Sponsor Platform Rocket',
    qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    instructions: '1. Open Rocket app or dial *322#.\n2. Choose "Send Money".\n3. Enter Account Number: 01922222222.\n4. Copy the Transaction ID (TxID) and submit here.',
    enabled: true,
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdrawal: 100,
    maxWithdrawal: 20000
  }
];

const defaultSponsors: SponsorBrand[] = [
  {
    id: 'spn_001',
    name: 'TechGadget Asia',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    description: 'Leading electronics & gadget retailer in South Asia.',
    websiteUrl: 'https://techgadget.asia',
    status: 'active',
    createdAt: '2026-01-10'
  },
  {
    id: 'spn_002',
    name: 'FinPay Bangladesh',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    description: 'Next-gen mobile financial services & digital payment wallet.',
    websiteUrl: 'https://finpay.com.bd',
    status: 'active',
    createdAt: '2026-01-15'
  }
];

const defaultSponsorCampaigns: SponsorCampaign[] = [
  {
    id: 'cmp_001',
    sponsorId: 'spn_001',
    sponsorName: 'TechGadget Asia',
    campaignName: 'Tech Gadgets Summer 2026 Promo Sprint',
    description: 'Promotional video watching & user engagement campaign.',
    bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    status: 'active',
    budgetAmount: 100000,
    spentAmount: 19200,
    associatedTaskIds: ['tsk_001'],
    createdAt: '2026-05-25'
  },
  {
    id: 'cmp_002',
    sponsorId: 'spn_002',
    sponsorName: 'FinPay Bangladesh',
    campaignName: 'App User Acquisition Drive 2026',
    description: 'App installation and active user onboarding campaign.',
    bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    status: 'active',
    budgetAmount: 150000,
    spentAmount: 37800,
    associatedTaskIds: ['tsk_002'],
    createdAt: '2026-04-20'
  }
];

const defaultReferralSettings: ReferralSettings = {
  isEnabled: true,
  rewardAmount: 50,
  campaignStatus: 'active',
  requireVerificationForReward: true,
  monthlyLeaderboardPrizePool: 5000
};

const defaultSystemSettings: SystemSettings = {
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
};

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.ensureSuperAdminExists();
  }

  public ensureSuperAdminExists(): UserProfile {
    let superAdmin = this.data.users.find(
      u => u.email.toLowerCase() === 'sponsorearn00@gmail.com' || u.username.toLowerCase() === 'sponsorearn00'
    );
    if (!superAdmin) {
      superAdmin = {
        id: 'usr_super_admin',
        name: 'Super Admin',
        username: 'sponsorearn00',
        email: 'sponsorearn00@gmail.com',
        phone: '+8801700000000',
        role: 'admin',
        country: 'Bangladesh',
        registrationDate: '2026-01-01',
        status: 'Verified',
        verificationStatus: 'Verified',
        tierStatus: 'VIP',
        referralCode: 'SPONSOREARN',
        wallets: {
          bonusBalance: 10000,
          earnedBalance: 50000,
          depositBalance: 100000,
          securityBalance: 0
        },
        totalEarnings: 60000,
        todayEarnings: 1000,
        monthlyEarnings: 30000,
        totalWithdraw: 0,
        totalDeposit: 100000,
        completedTasksCount: 100,
        referralCount: 50,
        deviceId: 'dev_super_admin_001'
      };
      this.data.users.unshift(superAdmin);
      this.commit();
    } else {
      let changed = false;
      if (superAdmin.email !== 'sponsorearn00@gmail.com') {
        superAdmin.email = 'sponsorearn00@gmail.com';
        changed = true;
      }
      if (superAdmin.role !== 'admin') {
        superAdmin.role = 'admin';
        changed = true;
      }
      if (superAdmin.status !== 'Verified') {
        superAdmin.status = 'Verified';
        changed = true;
      }
      if (superAdmin.verificationStatus !== 'Verified') {
        superAdmin.verificationStatus = 'Verified';
        changed = true;
      }
    }
    // Ensure sponsorearn00@gmail.com is Super Admin, while preserving other admin users
    this.data.users.forEach(u => {
      if (u.email.toLowerCase() === 'sponsorearn00@gmail.com') {
        u.role = 'admin';
        u.adminRole = 'Super Admin';
        u.status = 'Verified';
        u.verificationStatus = 'Verified';
      }
    });
    this.commit();
    return superAdmin;
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.paymentGateways || parsed.paymentGateways.length === 0) {
          parsed.paymentGateways = defaultPaymentGateways;
        }
        if (!parsed.sponsors) parsed.sponsors = defaultSponsors;
        if (!parsed.sponsorCampaigns) parsed.sponsorCampaigns = defaultSponsorCampaigns;
        if (!parsed.referralRecords) parsed.referralRecords = [];
        if (!parsed.referralSettings) parsed.referralSettings = defaultReferralSettings;
        if (!parsed.subscriptionPlans) parsed.subscriptionPlans = defaultPlans;
        if (!parsed.planHistory) parsed.planHistory = [];
        if (!parsed.planUpgradeRequests) parsed.planUpgradeRequests = [];
        if (!parsed.systemSettings) parsed.systemSettings = defaultSystemSettings;
        if (!parsed.broadcasts) parsed.broadcasts = [];
        if (!parsed.backups) parsed.backups = [];
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read db file, initializing default:', e);
    }

    const initialData: DatabaseSchema = {
      users: defaultUsers,
      tasks: defaultTasks,
      taskCompletions: [],
      deposits: [],
      withdrawals: [],
      verifications: [],
      transactions: defaultTransactions,
      notifications: defaultNotifications,
      notices: defaultNotices,
      supportTickets: [],
      auditLogs: [],
      fraudFlags: [],
      tierConfigs: defaultTierConfigs,
      paymentGateways: defaultPaymentGateways,
      sponsors: defaultSponsors,
      sponsorCampaigns: defaultSponsorCampaigns,
      referralRecords: [],
      referralSettings: defaultReferralSettings,
      subscriptionPlans: defaultPlans,
      planHistory: [],
      planUpgradeRequests: [],
      systemSettings: defaultSystemSettings,
      broadcasts: [],
      backups: []
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save db data:', e);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  // User queries
  public getUsers(): UserProfile[] {
    return this.data.users;
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmailOrPhone(identifier: string): UserProfile | undefined {
    const clean = identifier.trim().toLowerCase();
    if (clean === 'sponsorearn00@gmail.com' || clean === 'sponsorearn00' || clean === 'sponsorearn') {
      return this.ensureSuperAdminExists();
    }
    return this.data.users.find(u => u.email.toLowerCase() === clean || u.phone.toLowerCase() === clean || u.username.toLowerCase() === clean);
  }

  public createUser(user: UserProfile) {
    if (user.email.trim().toLowerCase() === 'sponsorearn00@gmail.com') {
      user.role = 'admin';
      user.status = 'Verified';
      user.verificationStatus = 'Verified';
    } else {
      user.role = 'user';
    }
    this.data.users.push(user);
    this.commit();
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const user = this.getUserById(id);
    if (user) {
      if (user.email.toLowerCase() === 'sponsorearn00@gmail.com' || user.id === 'usr_super_admin') {
        updates.role = 'admin';
        updates.status = 'Verified';
        updates.verificationStatus = 'Verified';
      } else {
        updates.role = 'user';
      }
      Object.assign(user, updates);
      this.commit();
    }
    return user;
  }

  public saveUser(user: UserProfile) {
    return this.updateUser(user.id, user);
  }

  // Wallet and Transactions
  public addTransaction(tx: WalletTransaction) {
    this.data.transactions.unshift(tx);
    this.commit();
  }

  public getTransactions(userId?: string): WalletTransaction[] {
    if (userId) {
      return this.data.transactions.filter(t => t.userId === userId);
    }
    return this.data.transactions;
  }

  // Tasks
  public getTasks(): SponsorTask[] {
    return this.data.tasks;
  }

  public getTaskById(id: string): SponsorTask | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  public createTask(task: SponsorTask) {
    this.data.tasks.unshift(task);
    this.commit();
  }

  public updateTask(id: string, updates: Partial<SponsorTask>): SponsorTask | undefined {
    const task = this.getTaskById(id);
    if (task) {
      Object.assign(task, updates);
      this.commit();
    }
    return task;
  }

  public deleteTask(id: string): boolean {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.tasks.splice(idx, 1);
      this.commit();
      return true;
    }
    return false;
  }

  public getTaskCompletions(userId?: string): TaskCompletion[] {
    if (userId) {
      return this.data.taskCompletions.filter(tc => tc.userId === userId);
    }
    return this.data.taskCompletions;
  }

  public addTaskCompletion(tc: TaskCompletion) {
    this.data.taskCompletions.unshift(tc);
    this.commit();
  }

  // Deposits
  public getDeposits(userId?: string): DepositRequest[] {
    if (userId) {
      return this.data.deposits.filter(d => d.userId === userId);
    }
    return this.data.deposits;
  }

  public createDeposit(deposit: DepositRequest) {
    this.data.deposits.unshift(deposit);
    this.commit();
  }

  public updateDeposit(id: string, updates: Partial<DepositRequest>): DepositRequest | undefined {
    const dep = this.data.deposits.find(d => d.id === id);
    if (dep) {
      Object.assign(dep, updates);
      this.commit();
    }
    return dep;
  }

  // Withdrawals
  public getWithdrawals(userId?: string): WithdrawalRequest[] {
    if (userId) {
      return this.data.withdrawals.filter(w => w.userId === userId);
    }
    return this.data.withdrawals;
  }

  public createWithdrawal(withdrawal: WithdrawalRequest) {
    this.data.withdrawals.unshift(withdrawal);
    this.commit();
  }

  public updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): WithdrawalRequest | undefined {
    const w = this.data.withdrawals.find(req => req.id === id);
    if (w) {
      Object.assign(w, updates);
      this.commit();
    }
    return w;
  }

  // Verifications
  public getVerifications(userId?: string): VerificationRequest[] {
    if (userId) {
      return this.data.verifications.filter(v => v.userId === userId);
    }
    return this.data.verifications;
  }

  public createVerification(v: VerificationRequest) {
    this.data.verifications.unshift(v);
    this.commit();
  }

  public updateVerification(id: string, updates: Partial<VerificationRequest>): VerificationRequest | undefined {
    const v = this.data.verifications.find(req => req.id === id);
    if (v) {
      Object.assign(v, updates);
      this.commit();
    }
    return v;
  }

  // Tier Configs
  public getTierConfigs(): TierConfig[] {
    if (!this.data.tierConfigs || this.data.tierConfigs.length === 0) {
      this.data.tierConfigs = defaultTierConfigs;
      this.commit();
    }
    return this.data.tierConfigs;
  }

  public updateTierConfigs(configs: TierConfig[]) {
    this.data.tierConfigs = configs;
    this.commit();
  }

  // Notifications
  public getNotifications(userId: string): AppNotification[] {
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications
      .filter(n => n.userId === userId || n.userId === 'all')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(n: AppNotification) {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(n);
    this.commit();
  }

  public markNotificationAsRead(id: string, userId: string) {
    const n = (this.data.notifications || []).find(item => item.id === id && (item.userId === userId || item.userId === 'all'));
    if (n) {
      n.isRead = true;
      this.commit();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    let updated = false;
    (this.data.notifications || []).forEach(n => {
      if ((n.userId === userId || n.userId === 'all') && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) this.commit();
  }

  public deleteNotification(id: string, userId: string): boolean {
    const initialLen = (this.data.notifications || []).length;
    this.data.notifications = (this.data.notifications || []).filter(
      n => !(n.id === id && (n.userId === userId || n.userId === 'all'))
    );
    if (this.data.notifications.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  public registerFcmToken(userId: string, token: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.fcmToken = token;
      user.pushEnabled = true;
      this.commit();
      return true;
    }
    return false;
  }

  // Notices
  public getNotices(): NoticeBanner[] {
    if (!this.data.notices) {
      this.data.notices = defaultNotices;
      this.commit();
    }
    // Return notices sorted: pinned first (newest first), then unpinned (newest first)
    return [...this.data.notices].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public addNotice(notice: NoticeBanner) {
    this.data.notices.unshift(notice);
    this.commit();
  }

  public updateNotice(id: string, updates: Partial<NoticeBanner>): NoticeBanner | undefined {
    const notice = this.data.notices.find(n => n.id === id);
    if (notice) {
      Object.assign(notice, updates);
      this.commit();
    }
    return notice;
  }

  public deleteNotice(id: string): boolean {
    if (!id) return false;
    const targetId = String(id).trim();
    if (!this.data.notices) {
      this.data.notices = [];
      return false;
    }

    const initialLen = this.data.notices.length;
    this.data.notices = this.data.notices.filter(n => n && n.id && String(n.id).trim() !== targetId);

    // Also attempt SQL deletion if drizzle sql database is active
    try {
      const g = globalThis as any;
      if (g && g.sqlDb && g.sql) {
        g.sqlDb.execute(g.sql`DELETE FROM notices WHERE id = ${targetId} OR id::text = ${targetId};`).catch(() => {});
      }
    } catch {
      // Ignore if sqlDb table not present
    }

    if (this.data.notices.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // Support Tickets
  public getSupportTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.data.supportTickets.filter(st => st.userId === userId);
    }
    return this.data.supportTickets;
  }

  public createSupportTicket(ticket: SupportTicket) {
    this.data.supportTickets.unshift(ticket);
    this.commit();
  }

  public addTicketReply(ticketId: string, reply: { sender: 'user' | 'admin' | 'ai'; message: string; timestamp: string }) {
    const ticket = this.data.supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.replies.push(reply);
      this.commit();
    }
  }

  // Audit Logs
  public addAuditLog(log: SystemAuditLog) {
    this.data.auditLogs.unshift(log);
    this.commit();
  }

  public getAuditLogs(): SystemAuditLog[] {
    return this.data.auditLogs;
  }

  // Anti-fraud
  public addFraudFlag(flag: AntiFraudFlag) {
    this.data.fraudFlags.unshift(flag);
    this.commit();
  }

  public getFraudFlags(): AntiFraudFlag[] {
    return this.data.fraudFlags;
  }

  // Payment Gateways
  public getPaymentGateways(): PaymentGatewayConfig[] {
    return this.data.paymentGateways || defaultPaymentGateways;
  }

  public updatePaymentGateway(id: string, updates: Partial<PaymentGatewayConfig>): PaymentGatewayConfig | undefined {
    const gw = this.getPaymentGateways().find(g => g.id === id);
    if (gw) {
      Object.assign(gw, updates);
      this.commit();
    }
    return gw;
  }

  // Duplicate TxID Check
  public isTransactionIdUsed(txId: string): boolean {
    const clean = txId.trim().toUpperCase();
    if (!clean) return false;

    // Check deposits
    const depositExists = this.data.deposits.some(d => d.transactionId.trim().toUpperCase() === clean);
    if (depositExists) return true;

    // Check transactions
    const walletTxExists = this.data.transactions.some(t => t.txId.trim().toUpperCase() === clean);
    if (walletTxExists) return true;

    return false;
  }

  // ==========================================
  // SPONSORS & CAMPAIGNS METHODS
  // ==========================================
  public getSponsors(): SponsorBrand[] {
    return this.data.sponsors || defaultSponsors;
  }

  public getSponsorById(id: string): SponsorBrand | undefined {
    return this.getSponsors().find(s => s.id === id);
  }

  public addSponsor(sponsor: SponsorBrand) {
    if (!this.data.sponsors) this.data.sponsors = [];
    this.data.sponsors.unshift(sponsor);
    this.commit();
  }

  public updateSponsor(id: string, updates: Partial<SponsorBrand>): SponsorBrand | undefined {
    const s = this.getSponsorById(id);
    if (s) {
      Object.assign(s, updates);
      this.commit();
    }
    return s;
  }

  public getSponsorCampaigns(): SponsorCampaign[] {
    return this.data.sponsorCampaigns || defaultSponsorCampaigns;
  }

  public getCampaignById(id: string): SponsorCampaign | undefined {
    return this.getSponsorCampaigns().find(c => c.id === id);
  }

  public addCampaign(campaign: SponsorCampaign) {
    if (!this.data.sponsorCampaigns) this.data.sponsorCampaigns = [];
    this.data.sponsorCampaigns.unshift(campaign);
    this.commit();
  }

  public updateCampaign(id: string, updates: Partial<SponsorCampaign>): SponsorCampaign | undefined {
    const c = this.getCampaignById(id);
    if (c) {
      Object.assign(c, updates);
      this.commit();
    }
    return c;
  }

  // ==========================================
  // REFERRAL SYSTEM METHODS
  // ==========================================
  public getReferralSettings(): ReferralSettings {
    return this.data.referralSettings || defaultReferralSettings;
  }

  public updateReferralSettings(updates: Partial<ReferralSettings>): ReferralSettings {
    if (!this.data.referralSettings) this.data.referralSettings = defaultReferralSettings;
    Object.assign(this.data.referralSettings, updates);
    this.commit();
    return this.data.referralSettings;
  }

  public getReferralRecords(referrerId?: string): ReferralRecord[] {
    if (!this.data.referralRecords) this.data.referralRecords = [];
    if (referrerId) {
      return this.data.referralRecords.filter(r => r.referrerId === referrerId);
    }
    return this.data.referralRecords;
  }

  public addReferralRecord(record: ReferralRecord) {
    if (!this.data.referralRecords) this.data.referralRecords = [];
    this.data.referralRecords.unshift(record);
    this.commit();
  }

  // ==========================================
  // SUBSCRIPTION & PLAN MANAGEMENT METHODS (PART 8)
  // ==========================================
  public getSubscriptionPlans(): SubscriptionPlan[] {
    if (!this.data.subscriptionPlans || this.data.subscriptionPlans.length === 0) {
      this.data.subscriptionPlans = defaultPlans;
      this.commit();
    }
    return this.data.subscriptionPlans.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getPlanById(id: string): SubscriptionPlan | undefined {
    return this.getSubscriptionPlans().find(p => p.id === id);
  }

  public savePlan(plan: SubscriptionPlan): SubscriptionPlan {
    if (!this.data.subscriptionPlans) this.data.subscriptionPlans = defaultPlans;
    const index = this.data.subscriptionPlans.findIndex(p => p.id === plan.id);
    if (index >= 0) {
      this.data.subscriptionPlans[index] = plan;
    } else {
      this.data.subscriptionPlans.push(plan);
    }
    this.commit();
    return plan;
  }

  public deletePlan(id: string): boolean {
    if (!this.data.subscriptionPlans) return false;
    const initialLen = this.data.subscriptionPlans.length;
    this.data.subscriptionPlans = this.data.subscriptionPlans.filter(p => p.id !== id);
    if (this.data.subscriptionPlans.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  public getPlanHistory(): PlanHistoryRecord[] {
    if (!this.data.planHistory) this.data.planHistory = [];
    return this.data.planHistory;
  }

  public addPlanHistory(record: PlanHistoryRecord) {
    if (!this.data.planHistory) this.data.planHistory = [];
    this.data.planHistory.unshift(record);
    this.commit();
  }

  public getPlanUpgradeRequests(): PlanUpgradeRequest[] {
    if (!this.data.planUpgradeRequests) this.data.planUpgradeRequests = [];
    return this.data.planUpgradeRequests;
  }

  public addPlanUpgradeRequest(request: PlanUpgradeRequest) {
    if (!this.data.planUpgradeRequests) this.data.planUpgradeRequests = [];
    this.data.planUpgradeRequests.unshift(request);
    this.commit();
  }

  public updatePlanUpgradeRequest(id: string, updates: Partial<PlanUpgradeRequest>): PlanUpgradeRequest | undefined {
    const req = (this.data.planUpgradeRequests || []).find(r => r.id === id);
    if (req) {
      Object.assign(req, updates);
      this.commit();
    }
    return req;
  }

  // ==========================================
  // SYSTEM SETTINGS & MAINTENANCE (PART 9)
  // ==========================================
  public getSystemSettings(): SystemSettings {
    if (!this.data.systemSettings) this.data.systemSettings = defaultSystemSettings;
    return this.data.systemSettings;
  }

  public updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    if (!this.data.systemSettings) this.data.systemSettings = defaultSystemSettings;
    Object.assign(this.data.systemSettings, updates);
    this.commit();
    return this.data.systemSettings;
  }

  // ==========================================
  // BROADCAST NOTIFICATIONS (PART 9)
  // ==========================================
  public getBroadcasts(): BroadcastNotification[] {
    if (!this.data.broadcasts) this.data.broadcasts = [];
    return this.data.broadcasts;
  }

  public addBroadcast(broadcast: BroadcastNotification): BroadcastNotification {
    if (!this.data.broadcasts) this.data.broadcasts = [];
    this.data.broadcasts.unshift(broadcast);
    this.commit();
    return broadcast;
  }

  public updateBroadcast(id: string, updates: Partial<BroadcastNotification>): BroadcastNotification | undefined {
    const b = (this.data.broadcasts || []).find(item => item.id === id);
    if (b) {
      Object.assign(b, updates);
      this.commit();
    }
    return b;
  }

  public deleteBroadcast(id: string): boolean {
    const initialLen = (this.data.broadcasts || []).length;
    this.data.broadcasts = (this.data.broadcasts || []).filter(b => b.id !== id);
    if (this.data.broadcasts.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // ==========================================
  // BACKUP MANAGEMENT (PART 9)
  // ==========================================
  public getBackups(): BackupSnapshot[] {
    if (!this.data.backups) this.data.backups = [];
    return this.data.backups;
  }

  public createBackup(name: string, type: 'database' | 'media' | 'settings' | 'full'): BackupSnapshot {
    if (!this.data.backups) this.data.backups = [];
    const snapshot: BackupSnapshot = {
      id: `snap_${Date.now()}`,
      snapshotName: name || `Backup_${new Date().toISOString().split('T')[0]}`,
      type,
      sizeBytes: JSON.stringify(this.data).length,
      createdAt: new Date().toISOString(),
      backupDataJson: JSON.stringify(this.data)
    };
    this.data.backups.unshift(snapshot);
    this.commit();
    return snapshot;
  }

  public restoreBackup(id: string): boolean {
    const backup = (this.data.backups || []).find(b => b.id === id);
    if (backup && backup.backupDataJson) {
      try {
        const restoredData = JSON.parse(backup.backupDataJson);
        this.data = restoredData;
        this.commit();
        return true;
      } catch (e) {
        console.error('Failed to restore backup', e);
      }
    }
    return false;
  }

  public deleteBackup(id: string): boolean {
    if (!this.data.backups) return false;
    const initialLen = this.data.backups.length;
    this.data.backups = this.data.backups.filter(b => b.id !== id);
    if (this.data.backups.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }
}

export const db = new JsonDatabase();
