import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  jsonb,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. CORE USER TABLES
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email').notNull().unique(),
  role: text('role').default('user').notNull(), // 'user' | 'admin'
  status: text('status').default('Active').notNull(), // 'Active' | 'Suspended' | 'Blocked'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  index('idx_users_firebase_uid').on(table.firebaseUid),
  index('idx_users_email').on(table.email),
  index('idx_users_status').on(table.status)
]);

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  avatarUrl: text('avatar_url'),
  country: text('country').default('Bangladesh'),
  verificationStatus: text('verification_status').default('Unverified').notNull(), // 'Unverified' | 'Pending' | 'Verified' | 'Rejected'
  tierStatus: text('tier_status').default('Bronze').notNull(), // 'Free' | 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  theme: text('theme').default('dark').notNull(),
  language: text('language').default('English').notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userDevices = pgTable('user_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name'),
  os: text('os'),
  ipAddress: text('ip_address'),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userLoginHistory = pgTable('user_login_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: text('ip_address').notNull(),
  deviceInfo: text('device_info'),
  location: text('location'),
  status: text('status').default('success').notNull(),
  loginAt: timestamp('login_at').defaultNow().notNull()
});

export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  phoneOrEmail: text('phone_or_email').notNull(),
  otpCode: text('otp_code').notNull(),
  type: text('type').default('login').notNull(), // 'login' | 'withdrawal' | 'reset'
  expiresAt: timestamp('expires_at').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionToken: text('session_token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const passwordResets = pgTable('password_resets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  resetToken: text('reset_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 2. WALLET TABLES
// ==========================================

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  depositBalance: decimal('deposit_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  earnedBalance: decimal('earned_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  bonusBalance: decimal('bonus_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  securityBalance: decimal('security_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalWithdrawn: decimal('total_withdrawn', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalDeposited: decimal('total_deposited', { precision: 12, scale: 2 }).default('0.00').notNull(),
  isFrozen: boolean('is_frozen').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  walletType: text('wallet_type').notNull(), // 'deposit' | 'earned' | 'bonus' | 'security'
  type: text('type').notNull(), // 'credit' | 'debit'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  txId: text('tx_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_tx_user_id').on(table.userId),
  index('idx_tx_created_at').on(table.createdAt)
]);

export const bonusWallets = pgTable('bonus_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalClaimed: decimal('total_claimed', { precision: 12, scale: 2 }).default('0.00').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const earnedWallets = pgTable('earned_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalTaskEarnings: decimal('total_task_earnings', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalReferralEarnings: decimal('total_referral_earnings', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const depositWallets = pgTable('deposit_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalDeposits: decimal('total_deposits', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const securityWallets = pgTable('security_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  refundableAmount: decimal('refundable_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  lockExpiresAt: timestamp('lock_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const refundHistory = pgTable('refund_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  status: text('status').default('processed').notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const walletAudits = pgTable('wallet_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  adminId: uuid('admin_id').references(() => users.id),
  previousBalance: decimal('previous_balance', { precision: 12, scale: 2 }).notNull(),
  newBalance: decimal('new_balance', { precision: 12, scale: 2 }).notNull(),
  changeReason: text('change_reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 3. DEPOSIT TABLES
// ==========================================

export const depositMethods = pgTable('deposit_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // 'bKash' | 'Nagad' | 'Rocket' | 'Binance USDT'
  type: text('type').notNull(), // 'mobile_banking' | 'crypto'
  accountNumber: text('account_number').notNull(),
  minLimit: decimal('min_limit', { precision: 12, scale: 2 }).default('100.00').notNull(),
  maxLimit: decimal('max_limit', { precision: 12, scale: 2 }).default('50000.00').notNull(),
  chargePercentage: decimal('charge_percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  instructions: text('instructions'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const depositRequests = pgTable('deposit_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  methodId: uuid('method_id').references(() => depositMethods.id),
  method: text('method').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  fee: decimal('fee', { precision: 12, scale: 2 }).default('0.00').notNull(),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }).notNull(),
  transactionId: text('transaction_id').notNull(),
  userPhone: text('user_phone').notNull(),
  proofImage: text('proof_image'),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  remarks: text('remarks'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('idx_deposit_user_id').on(table.userId),
  index('idx_deposit_status').on(table.status)
]);

export const depositTransactions = pgTable('deposit_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  depositRequestId: uuid('deposit_request_id').references(() => depositRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  gatewayResponse: text('gateway_response'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const depositVerifications = pgTable('deposit_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  depositRequestId: uuid('deposit_request_id').references(() => depositRequests.id, { onDelete: 'cascade' }).notNull(),
  verifiedBy: uuid('verified_by').references(() => users.id),
  status: text('status').notNull(),
  notes: text('notes'),
  verifiedAt: timestamp('verified_at').defaultNow().notNull()
});

// ==========================================
// 4. WITHDRAWAL TABLES
// ==========================================

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  method: text('method').notNull(),
  accountNumber: text('account_number').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  charge: decimal('charge', { precision: 12, scale: 2 }).default('0.00').notNull(),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  remarks: text('remarks'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('idx_withdraw_user_id').on(table.userId),
  index('idx_withdraw_status').on(table.status)
]);

export const withdrawalTransactions = pgTable('withdrawal_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  withdrawalRequestId: uuid('withdrawal_request_id').references(() => withdrawalRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const withdrawalHistory = pgTable('withdrawal_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: text('method').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const withdrawalAudits = pgTable('withdrawal_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  withdrawalRequestId: uuid('withdrawal_request_id').references(() => withdrawalRequests.id, { onDelete: 'cascade' }).notNull(),
  adminId: uuid('admin_id').references(() => users.id),
  oldStatus: text('old_status').notNull(),
  newStatus: text('new_status').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 5. IDENTITY VERIFICATION TABLES
// ==========================================

export const identityVerifications = pgTable('identity_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  fullName: text('full_name').notNull(),
  documentType: text('document_type').notNull(), // 'National NID' | 'Passport' | 'Driving License'
  documentNumber: text('document_number').notNull(),
  frontImageUrl: text('front_image_url').notNull(),
  backImageUrl: text('back_image_url'),
  selfieUrl: text('selfie_url'),
  status: text('status').default('Pending').notNull(), // 'Pending' | 'Verified' | 'Rejected'
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const verificationDocuments = pgTable('verification_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  verificationId: uuid('verification_id').references(() => identityVerifications.id, { onDelete: 'cascade' }).notNull(),
  docType: text('doc_type').notNull(),
  filePath: text('file_path').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
});

export const verificationStatuses = pgTable('verification_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  status: text('status').notNull(),
  remarks: text('remarks'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const verificationAudits = pgTable('verification_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  verificationId: uuid('verification_id').references(() => identityVerifications.id, { onDelete: 'cascade' }).notNull(),
  adminId: uuid('admin_id').references(() => users.id),
  action: text('action').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 6. PLAN TABLES
// ==========================================

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  tierName: text('tier_name').notNull(), // 'Free' | 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  durationDays: integer('duration_days').default(30).notNull(),
  refundableSecurityDeposit: decimal('refundable_security_deposit', { precision: 12, scale: 2 }).default('0.00').notNull(),
  dailyTaskLimit: integer('daily_task_limit').default(5).notNull(),
  dailyEarningLimit: decimal('daily_earning_limit', { precision: 12, scale: 2 }).default('100.00').notNull(),
  minSingleWithdrawal: decimal('min_single_withdrawal', { precision: 12, scale: 2 }).default('100.00').notNull(),
  maxSingleWithdrawal: decimal('max_single_withdrawal', { precision: 12, scale: 2 }).default('5000.00').notNull(),
  status: text('status').default('published').notNull(), // 'published' | 'draft' | 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const planBenefits = pgTable('plan_benefits', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => plans.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  iconName: text('icon_name'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const planFeatures = pgTable('plan_features', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => plans.id, { onDelete: 'cascade' }).notNull(),
  featureKey: text('feature_key').notNull(),
  featureValue: text('feature_value').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const planHistories = pgTable('plan_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  pricePaid: decimal('price_paid', { precision: 12, scale: 2 }).notNull(),
  startsAt: timestamp('starts_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 7. TASK TABLES
// ==========================================

export const taskCategories = pgTable('task_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => taskCategories.id),
  sponsorName: text('sponsor_name').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  rewardAmount: decimal('reward_amount', { precision: 12, scale: 2 }).notNull(),
  durationSeconds: integer('duration_seconds').default(30).notNull(),
  maxUsers: integer('max_users').default(1000).notNull(),
  completedUsersCount: integer('completed_users_count').default(0).notNull(),
  status: text('status').default('active').notNull(), // 'active' | 'paused' | 'scheduled' | 'completed'
  scheduledAt: timestamp('scheduled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const taskCompletions = pgTable('task_completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rewardEarned: decimal('reward_earned', { precision: 12, scale: 2 }).notNull(),
  proofData: text('proof_data'),
  status: text('status').default('approved').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_completion_user_task').on(table.userId, table.taskId)
]);

export const taskRewards = pgTable('task_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rewardAmount: decimal('reward_amount', { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const taskHistories = pgTable('task_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const taskMedia = pgTable('task_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  mediaType: text('media_type').default('image').notNull(), // 'image' | 'video'
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 8. REFERRAL TABLES
// ==========================================

export const referralUsers = pgTable('referral_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: uuid('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  referredId: uuid('referred_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  referralCode: text('referral_code').notNull(),
  level: integer('level').default(1).notNull(),
  status: text('status').default('Active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const referralRewards = pgTable('referral_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: uuid('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  referredId: uuid('referred_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }).notNull(),
  level: integer('level').default(1).notNull(),
  reason: text('reason').notNull(),
  status: text('status').default('paid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const referralTransactions = pgTable('referral_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const referralHistories = pgTable('referral_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: uuid('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventType: text('event_type').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 9. SPONSOR TABLES
// ==========================================

export const sponsors = pgTable('sponsors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  companyName: text('company_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').default('Active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sponsorCampaigns = pgTable('sponsor_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  sponsorId: uuid('sponsor_id').references(() => sponsors.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }).notNull(),
  spentBudget: decimal('spent_budget', { precision: 12, scale: 2 }).default('0.00').notNull(),
  targetViews: integer('target_views').default(1000).notNull(),
  currentViews: integer('current_views').default(0).notNull(),
  status: text('status').default('Active').notNull(),
  startsAt: timestamp('starts_at').defaultNow().notNull(),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sponsorTasks = pgTable('sponsor_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => sponsorCampaigns.id, { onDelete: 'cascade' }).notNull(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  allocatedBudget: decimal('allocated_budget', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sponsorPayments = pgTable('sponsor_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  sponsorId: uuid('sponsor_id').references(() => sponsors.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').default('completed').notNull(),
  transactionRef: text('transaction_ref'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 10. CONTENT TABLES
// ==========================================

export const banners = pgTable('banners', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url'),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const notices = pgTable('notices', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  category: text('category').default('general').notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  targetGroup: text('target_group').default('all').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentHtml: text('content_html').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const descriptions = pgTable('descriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  keyName: text('key_name').notNull().unique(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ==========================================
// 11. NOTIFICATION TABLES
// ==========================================

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('system').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_notif_user_id').on(table.userId)
]);

export const pushNotifications = pgTable('push_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  targetSegment: text('target_segment').default('all').notNull(),
  sentCount: integer('sent_count').default(0).notNull(),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  status: text('status').default('sent').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const notificationHistories = pgTable('notification_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  notificationId: uuid('notification_id').references(() => notifications.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deliveredAt: timestamp('delivered_at').defaultNow().notNull()
});

export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateKey: text('template_key').notNull().unique(),
  titleTemplate: text('title_template').notNull(),
  bodyTemplate: text('body_template').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ==========================================
// 12. ADMIN TABLES
// ==========================================

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  role: text('role').default('Super Admin').notNull(), // 'Super Admin' | 'Finance Admin' | 'Support Admin' | 'Content Admin'
  permissionsJson: jsonb('permissions_json'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const adminRoles = pgTable('admin_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  roleName: text('role_name').notNull().unique(),
  description: text('description'),
  permissionsArray: jsonb('permissions_array'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  permissionKey: text('permission_key').notNull().unique(),
  moduleName: text('module_name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id),
  adminName: text('admin_name').notNull(),
  action: text('action').notNull(),
  module: text('module'),
  target: text('target').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  device: text('device'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 13. REPORT & SECURITY TABLES
// ==========================================

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportType: text('report_type').notNull(),
  title: text('title').notNull(),
  datasetJson: jsonb('dataset_json'),
  recordCount: integer('record_count').default(0).notNull(),
  generatedBy: uuid('generated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  metricName: text('metric_name').notNull(),
  metricValue: decimal('metric_value', { precision: 14, scale: 2 }).notNull(),
  snapshotDate: timestamp('snapshot_date').defaultNow().notNull(),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const fraudLogs = pgTable('fraud_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  riskScore: integer('risk_score').default(0).notNull(),
  reason: text('reason').notNull(),
  detectedIp: text('detected_ip'),
  detectedDevice: text('detected_device'),
  actionTaken: text('action_taken').default('flagged').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const deviceBans = pgTable('device_bans', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  reason: text('reason').notNull(),
  bannedBy: uuid('banned_by').references(() => users.id),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const ipLogs = pgTable('ip_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address').notNull(),
  country: text('country'),
  isVpn: boolean('is_vpn').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const blacklistedDevices = pgTable('blacklisted_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const blockedUsers = pgTable('blocked_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  reason: text('reason').notNull(),
  blockedBy: uuid('blocked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 14. SYSTEM & LOG TABLES
// ==========================================

export const applicationSettings = pgTable('application_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValueJson: jsonb('setting_value_json').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  gatewayName: text('gateway_name').notNull().unique(),
  configJson: jsonb('config_json').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const referralSettings = pgTable('referral_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  level1Percent: decimal('level1_percent', { precision: 5, scale: 2 }).default('10.00').notNull(),
  level2Percent: decimal('level2_percent', { precision: 5, scale: 2 }).default('5.00').notNull(),
  level3Percent: decimal('level3_percent', { precision: 5, scale: 2 }).default('3.00').notNull(),
  level4Percent: decimal('level4_percent', { precision: 5, scale: 2 }).default('2.00').notNull(),
  level5Percent: decimal('level5_percent', { precision: 5, scale: 2 }).default('1.00').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const taskSettings = pgTable('task_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  maxDailyTasks: integer('max_daily_tasks').default(10).notNull(),
  cooldownSeconds: integer('cooldown_seconds').default(30).notNull(),
  autoVerify: boolean('auto_verify').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const maintenanceSettings = pgTable('maintenance_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  isMaintenance: boolean('is_maintenance').default(false).notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  allowIps: jsonb('allow_ips'),
  message: text('message'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const aiSettings = pgTable('ai_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  modelName: text('model_name').default('gemini-3.6-flash').notNull(),
  apiKeyConfigured: boolean('api_key_configured').default(false).notNull(),
  maxTokens: integer('max_tokens').default(2048).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const apiLogs = pgTable('api_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  statusCode: integer('status_code').notNull(),
  responseTimeMs: integer('response_time_ms'),
  userId: uuid('user_id'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const errorLogs = pgTable('error_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  errorMessage: text('error_message').notNull(),
  stackTrace: text('stack_trace'),
  endpoint: text('endpoint'),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  logLevel: text('log_level').default('info').notNull(),
  message: text('message').notNull(),
  module: text('module'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'),
  actorName: text('actor_name').notNull(),
  action: text('action').notNull(),
  module: text('module'),
  target: text('target').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  device: text('device'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// DRIZZLE RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId]
  }),
  transactions: many(walletTransactions),
  deposits: many(depositRequests),
  withdrawals: many(withdrawalRequests),
  completions: many(taskCompletions),
  notifications: many(notifications)
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id]
  }),
  transactions: many(walletTransactions)
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  completions: many(taskCompletions),
  media: many(taskMedia)
}));
