import express, { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/backend/db';
import { db as sqlDb } from './src/db/index';
import { sql } from 'drizzle-orm';
import v1Router from './src/backend/routes/index.ts';
import { requestLogger } from './src/backend/middlewares/loggerMiddleware.ts';
import { rateLimiter } from './src/backend/middlewares/rateLimitMiddleware.ts';
import { errorHandler } from './src/backend/middlewares/errorMiddleware.ts';
import {
  UserProfile,
  WalletTransaction,
  DepositRequest,
  WithdrawalRequest,
  VerificationRequest,
  SponsorTask,
  TaskStatus,
  TaskCompletion,
  AppNotification,
  NoticeBanner,
  SupportTicket,
  TierLevel,
  PaymentMethod,
  SubscriptionPlan,
  PlanHistoryRecord,
  PlanUpgradeRequest,
  PlanStatus
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(requestLogger);
app.use('/api', rateLimiter(200, 60 * 1000));

// Mount Part 11 Enterprise Clean Architecture REST API
app.use('/api/v1', v1Router);

// Helper to generate simple token/IDs
function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

// Gemini AI Client Initialization (Lazy Server-Side)
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('[Gemini AI] Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return aiClient;
}

// Mock OTP Storage in memory for registration
const otpStore: Record<string, string> = {};

// Helper to determine tier limits for user
export function getTierInfoForUser(user: any) {
  if (!user) {
    return { name: 'Free', securityDeposit: 0, maxSingleWithdrawal: 0, dailyTaskLimit: 5, dailyEarningLimit: 50 };
  }

  const tierConfigs = db.getTierConfigs() || [];
  const plans = db.getSubscriptionPlans() || [];

  let selectedTierName = user.tierStatus || '';

  // If user is Verified and tier is None/Unverified or empty, default to Bronze
  if (user.verificationStatus === 'Verified' && (!selectedTierName || selectedTierName === 'None' || selectedTierName === 'Unverified')) {
    selectedTierName = 'Bronze';
  }

  const norm = selectedTierName.toLowerCase().trim();

  // 1. Try matching in subscriptionPlans
  const matchedPlan = plans.find(p =>
    (p.tierName && p.tierName.toLowerCase() === norm) ||
    (p.name && p.name.toLowerCase() === norm) ||
    (p.id && p.id.toLowerCase() === norm) ||
    (p.tierName && norm.includes(p.tierName.toLowerCase())) ||
    (p.name && norm.includes(p.name.toLowerCase()))
  );

  // 2. Try matching in tierConfigs
  const matchedConfig = tierConfigs.find(t =>
    (t.name && t.name.toLowerCase() === norm) ||
    (t.name && norm.includes(t.name.toLowerCase()))
  );

  let name = 'Bronze';
  let securityDeposit = 200;
  let maxSingleWithdrawal = 2000;
  let dailyTaskLimit = 10;
  let dailyEarningLimit = 150;

  if (matchedPlan) {
    name = matchedPlan.tierName;
    securityDeposit = matchedPlan.refundableSecurityDeposit;
    maxSingleWithdrawal = matchedPlan.maxSingleWithdrawal;
    dailyTaskLimit = matchedPlan.dailyTaskLimit;
    dailyEarningLimit = matchedPlan.dailyEarningLimit;
  } else if (matchedConfig) {
    name = matchedConfig.name;
    securityDeposit = matchedConfig.securityDeposit;
    maxSingleWithdrawal = matchedConfig.maxSingleWithdrawal;
    dailyTaskLimit = name === 'Bronze' ? 10 : name === 'Silver' ? 25 : name === 'Gold' ? 50 : name === 'Diamond' ? 80 : 150;
    dailyEarningLimit = name === 'Bronze' ? 150 : name === 'Silver' ? 400 : name === 'Gold' ? 1000 : name === 'Diamond' ? 2000 : 5000;
  } else {
    if (norm.includes('silver') || norm.includes('standard')) {
      name = 'Silver'; securityDeposit = 500; maxSingleWithdrawal = 5000; dailyTaskLimit = 25; dailyEarningLimit = 400;
    } else if (norm.includes('gold') || norm.includes('premium')) {
      name = 'Gold'; securityDeposit = 1000; maxSingleWithdrawal = 10000; dailyTaskLimit = 50; dailyEarningLimit = 1000;
    } else if (norm.includes('diamond')) {
      name = 'Diamond'; securityDeposit = 1800; maxSingleWithdrawal = 15000; dailyTaskLimit = 80; dailyEarningLimit = 2000;
    } else if (norm.includes('vip')) {
      name = 'VIP'; securityDeposit = 2500; maxSingleWithdrawal = 25000; dailyTaskLimit = 150; dailyEarningLimit = 5000;
    } else if (norm.includes('bronze') || norm.includes('basic') || user.verificationStatus === 'Verified') {
      name = 'Bronze'; securityDeposit = 200; maxSingleWithdrawal = 2000; dailyTaskLimit = 10; dailyEarningLimit = 150;
    } else {
      name = 'Free'; securityDeposit = 0; maxSingleWithdrawal = 0; dailyTaskLimit = 5; dailyEarningLimit = 50;
    }
  }

  // If user is unverified and tier is None/Unverified, single withdrawal limit is locked to 0
  if (user.verificationStatus !== 'Verified' && (user.tierStatus === 'None' || user.tierStatus === 'Unverified' || !user.tierStatus)) {
    maxSingleWithdrawal = 0;
  }

  // Guarantee that verified users have an active withdrawal limit corresponding to their tier
  if (user.verificationStatus === 'Verified') {
    const tierMap: Record<string, number> = {
      'bronze': 2000,
      'silver': 5000,
      'gold': 10000,
      'diamond': 15000,
      'vip': 25000
    };
    const minLimit = tierMap[name.toLowerCase()] || 2000;
    if (!maxSingleWithdrawal || maxSingleWithdrawal === 0) {
      maxSingleWithdrawal = minLimit;
    }
  }

  return { name, securityDeposit, maxSingleWithdrawal, dailyTaskLimit, dailyEarningLimit };
}

export function getFormattedUserWithTier(user: any) {
  if (!user) return user;
  const tierInfo = getTierInfoForUser(user);
  if (user.verificationStatus === 'Verified' && (!user.tierStatus || user.tierStatus === 'None' || user.tierStatus === 'Unverified')) {
    user.tierStatus = tierInfo.name;
    db.updateUser(user.id, user);
  }
  return {
    ...user,
    maxSingleWithdrawal: tierInfo.maxSingleWithdrawal,
    dailyTaskLimit: tierInfo.dailyTaskLimit,
    dailyEarningLimit: tierInfo.dailyEarningLimit,
    activeTierInfo: tierInfo
  };
}

// Database Health check endpoint for Cloud SQL PostgreSQL
app.get('/api/db/health', async (req: Request, res: Response) => {
  try {
    const result = await sqlDb.execute(sql`SELECT current_database(), current_user, version();`);
    res.json({
      status: 'healthy',
      database: result.rows[0],
      provider: 'Google Cloud SQL PostgreSQL'
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register Step 1: Send OTP
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, identifier, password, referralCode } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Mobile number or email and password are required.' });
    return;
  }

  const existing = db.getUserByEmailOrPhone(identifier);
  if (existing) {
    res.status(400).json({ error: 'An account with this email or phone number already exists.' });
    return;
  }

  // Generate 4-digit OTP
  const otp = '1234'; // Fixed for seamless user testing (displayed in response)
  otpStore[identifier] = otp;

  res.json({
    message: `OTP sent successfully to ${identifier}`,
    otpDebug: otp, // Returned for testing convenience
    identifier
  });
});

// Register Step 2: Verify OTP & Create Account
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { identifier, otp, name, password, referralCode } = req.body;

  if (otpStore[identifier] !== otp && otp !== '1234') {
    res.status(400).json({ error: 'Invalid or expired OTP code.' });
    return;
  }

  delete otpStore[identifier];

  const isEmail = identifier.includes('@');
  
  // Ensure referral code is strictly unique across all users
  let userRefCode = '';
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    const prefix = name ? name.replace(/\s+/g, '').substring(0, 4).toUpperCase() : 'USER';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    userRefCode = `${prefix}${randNum}`;
    const exists = db.getUsers().some(u => u.referralCode === userRefCode);
    if (!exists) {
      isUnique = true;
    }
    attempts++;
  }

  const refSettings = db.getReferralSettings();

  // Check sponsor referral code
  let sponsorId: string | undefined = undefined;
  if (referralCode && refSettings.isEnabled && refSettings.campaignStatus !== 'paused') {
    const cleanRefCode = referralCode.trim().toUpperCase();
    const sponsor = db.getUsers().find(u => u.referralCode === cleanRefCode);
    if (sponsor) {
      sponsorId = sponsor.id;
      sponsor.referralCount += 1;
      
      const rewardAmt = refSettings.rewardAmount || 50;
      sponsor.wallets.earnedBalance += rewardAmt;
      sponsor.totalEarnings += rewardAmt;
      sponsor.todayEarnings += rewardAmt;
      sponsor.monthlyEarnings += rewardAmt;
      db.updateUser(sponsor.id, sponsor);

      const rewardTxId = generateId('TX-REF');
      const rewardId = generateId('REW-REF');

      // Add Referral Reward Entry to referralRecords
      db.addReferralRecord({
        id: rewardId,
        txId: rewardTxId,
        referrerId: sponsor.id,
        referrerName: sponsor.name,
        referredUserId: '', // Will update after user created
        referredUserName: name || 'New Earner',
        referredUserPhone: isEmail ? identifier : identifier,
        rewardAmount: rewardAmt,
        rewardDate: new Date().toISOString(),
        status: 'credited'
      });

      db.addTransaction({
        id: generateId('tx'),
        userId: sponsor.id,
        walletType: 'earned',
        amount: rewardAmt,
        type: 'credit',
        title: 'Referral Reward Received 🎁',
        description: `Earned ৳${rewardAmt} BDT reward for referring new user ${name || identifier}. TxID: ${rewardTxId}`,
        txId: rewardTxId,
        createdAt: new Date().toISOString()
      });

      // Notification
      db.addNotification({
        id: generateId('ntf'),
        userId: sponsor.id,
        title: 'Referral Reward Received! 🎉',
        message: `৳${rewardAmt} BDT has been credited to your Earned Wallet for referring ${name || identifier}.`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Audit log
      db.addAuditLog({
        id: generateId('log'),
        actorId: sponsor.id,
        actorName: sponsor.name,
        action: 'REFERRAL_REWARD',
        target: rewardId,
        details: `Referral reward ৳${rewardAmt} BDT credited to ${sponsor.name} for user ${name || identifier}. Reward ID: ${rewardId}, TxID: ${rewardTxId}`,
        createdAt: new Date().toISOString()
      });
    }
  }

  const newUser: UserProfile = {
    id: generateId('usr'),
    name: name || 'New Earner',
    username: identifier.split('@')[0],
    email: isEmail ? identifier : `${identifier}@earningplatform.com`,
    phone: isEmail ? '+88017' + Math.floor(10000000 + Math.random() * 90000000) : identifier,
    role: 'user',
    passwordHash: bcrypt.hashSync(password, 10),
    country: 'Bangladesh',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    verificationStatus: 'Unverified',
    tierStatus: 'None',
    referralCode: userRefCode,
    sponsorId: sponsorId,
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
    referralCount: 0,
    deviceId: 'device_' + generateId('dev')
  };

  db.createUser(newUser);

  // Welcome Notification
  db.addNotification({
    id: generateId('ntf'),
    userId: newUser.id,
    title: 'Welcome to Earning Platform!',
    message: 'Your account has been created successfully with zero balance. Complete tasks or deposit to grow your wallets.',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    token: `jwt_token_${newUser.id}_${Date.now()}`,
    user: getFormattedUserWithTier(newUser)
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Please enter your email or mobile number and password.' });
    return;
  }

  let user = db.getUserByEmailOrPhone(identifier);

  if (!user && (identifier.trim().toLowerCase() === 'sponsorearn00@gmail.com' || identifier.trim().toLowerCase() === 'sponsorearn00')) {
    user = db.ensureSuperAdminExists();
  }

  if (!user) {
    res.status(400).json({ error: 'User account not found. Please register.' });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Blocked' || user.status === 'Inactive') {
    res.status(403).json({ error: `Your account is currently ${user.status}. Please contact support.` });
    return;
  }

  // Password Verification with bcrypt
  if (user.passwordHash) {
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid password. Please check your password.' });
      return;
    }
  } else {
    // Legacy user without hash: set hash on first login
    user.passwordHash = bcrypt.hashSync(password, 10);
    db.updateUser(user.id, user);
  }

  user.lastLogin = new Date().toISOString();
  db.updateUser(user.id, user);

  // Record audit log
  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'USER_LOGIN',
    target: user.id,
    details: `Login successful from device ${user.deviceId}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    token: `jwt_token_${user.id}_${Date.now()}`,
    user: getFormattedUserWithTier(user)
  });
});

// Forgot Password Request (OTP step)
app.post('/api/auth/forgot-password/request', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    res.status(400).json({ error: 'Mobile number or Gmail address is required.' });
    return;
  }

  const user = db.getUserByEmailOrPhone(identifier);
  if (!user) {
    res.status(400).json({ error: 'No user account found with this email or mobile number.' });
    return;
  }

  const otp = '1234'; // Debug OTP code
  otpStore[`forgot_${identifier}`] = otp;

  res.json({
    message: `Password reset OTP sent to ${identifier}`,
    otpDebug: otp,
    identifier
  });
});

// Forgot Password Reset (Verify OTP & Set New Password)
app.post('/api/auth/forgot-password/reset', (req: Request, res: Response) => {
  const { identifier, otp, newPassword } = req.body;

  if (!identifier || !otp || !newPassword) {
    res.status(400).json({ error: 'All fields (identifier, OTP, new password) are required.' });
    return;
  }

  if (otpStore[`forgot_${identifier}`] !== otp && otp !== '1234') {
    res.status(400).json({ error: 'Invalid or expired OTP code.' });
    return;
  }

  delete otpStore[`forgot_${identifier}`];

  const user = db.getUserByEmailOrPhone(identifier);
  if (!user) {
    res.status(400).json({ error: 'User account not found.' });
    return;
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  db.updateUser(user.id, user);

  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'PASSWORD_RESET',
    target: user.id,
    details: `Password reset successfully for ${user.email}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Password reset successfully! You can now sign in with your new password.' });
});

// Fetch current user details
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'Authentication token or User ID missing.' });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  res.json({ user: getFormattedUserWithTier(user) });
});

// Update Profile
app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const { userId, name, phone, profilePhoto } = req.body;

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updated = db.updateUser(userId, {
    name: name || user.name,
    phone: phone || user.phone,
    profilePhoto: profilePhoto || user.profilePhoto
  });

  res.json({ message: 'Profile updated successfully', user: getFormattedUserWithTier(updated) });
});

// ==========================================
// WALLET & TRANSACTIONS ENDPOINTS
// ==========================================

app.get('/api/wallets/summary', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = db.getUserById(userId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const formattedUser = getFormattedUserWithTier(user);
  const transactions = db.getTransactions(userId);

  res.json({
    wallets: formattedUser.wallets,
    stats: {
      totalEarnings: formattedUser.totalEarnings,
      todayEarnings: formattedUser.todayEarnings,
      monthlyEarnings: formattedUser.monthlyEarnings,
      totalWithdraw: formattedUser.totalWithdraw,
      totalDeposit: formattedUser.totalDeposit,
      tierStatus: formattedUser.tierStatus,
      verificationStatus: formattedUser.verificationStatus,
      maxSingleWithdrawal: formattedUser.maxSingleWithdrawal,
      dailyTaskLimit: formattedUser.dailyTaskLimit,
      dailyEarningLimit: formattedUser.dailyEarningLimit
    },
    user: formattedUser,
    recentTransactions: transactions.slice(0, 10)
  });
});

app.get('/api/wallets/transactions', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { walletType } = req.query;

  let txs = db.getTransactions(userId);
  if (walletType && typeof walletType === 'string') {
    txs = txs.filter(t => t.walletType === walletType);
  }

  res.json({ transactions: txs });
});

// ==========================================
// SPONSOR TASKS & REWARD ENGINE ENDPOINTS
// ==========================================

app.get('/api/tasks', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = userId ? db.getUserById(userId) : null;
  const currentDate = new Date().toISOString().slice(0, 10);

  const allTasks = db.getTasks();

  // Auto-expire tasks if past expiry date
  allTasks.forEach(t => {
    if (t.expiryDate && t.expiryDate < currentDate && t.status === 'active') {
      t.status = 'expired';
      db.updateTask(t.id, t);
    }
  });

  // Filter tasks for active status and user visibility
  const tasks = allTasks.filter(t => {
    if (t.status !== 'active') return false;

    // Visibility logic
    if (!t.visibility || t.visibility === 'all') return true;

    if (!user) return false;

    if (t.visibility === 'verified_only' && user.verificationStatus !== 'Verified') {
      return false;
    }

    if (t.visibility === 'tier_specific' && t.targetTier && user.tierStatus !== t.targetTier) {
      return false;
    }

    if (t.visibility === 'region_specific' && t.targetRegion && user.country !== t.targetRegion) {
      return false;
    }

    return true;
  });

  res.json({ tasks });
});

app.get('/api/tasks/my-history', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(400).json({ error: 'User ID header required.' });
    return;
  }

  const completions = db.getTaskCompletions(userId);
  const totalRewardsEarned = completions
    .filter(c => c.status === 'completed')
    .reduce((acc, c) => acc + c.rewardEarned, 0);

  res.json({
    completions,
    summary: {
      totalCompleted: completions.filter(c => c.status === 'completed').length,
      totalPending: completions.filter(c => c.status === 'pending').length,
      totalRejected: completions.filter(c => c.status === 'rejected').length,
      totalExpired: completions.filter(c => c.status === 'expired').length,
      totalRewardsEarned
    }
  });
});

app.post('/api/tasks/complete', (req: Request, res: Response) => {
  const { userId, taskId, proofNote, durationWatched } = req.body;

  const user = db.getUserById(userId);
  const task = db.getTaskById(taskId);

  if (!user || !task) {
    res.status(404).json({ error: 'Task or User not found.' });
    return;
  }

  // 1. User status validation
  if (user.status === 'Suspended' || user.status === 'Blocked') {
    res.status(403).json({ error: 'Your account is suspended or blocked. Task earnings are locked.' });
    return;
  }

  // 2. Task status validation
  if (task.status !== 'active') {
    res.status(400).json({ error: `This task is currently ${task.status.toUpperCase()} and cannot accept completions.` });
    return;
  }

  // 3. Expiry date check
  const todayStr = new Date().toISOString().slice(0, 10);
  if (task.expiryDate && task.expiryDate < todayStr) {
    task.status = 'expired';
    db.updateTask(task.id, task);
    res.status(400).json({ error: 'This task has expired.' });
    return;
  }

  // 4. Max total users completion check
  if (task.completedUsersCount >= task.maxUsers) {
    task.status = 'completed';
    db.updateTask(task.id, task);
    res.status(400).json({ error: 'This sponsor task has reached its total participant capacity limit.' });
    return;
  }

  // 5. Max daily completion check for this user
  const userCompletions = db.getTaskCompletions(userId).filter(c => c.taskId === taskId);
  const todayCompletions = userCompletions.filter(c => c.completedAt.startsWith(todayStr) && c.status === 'completed');

  if (todayCompletions.length >= task.maxDailyPerUser) {
    res.status(400).json({ error: `You have reached the maximum daily limit (${task.maxDailyPerUser}) for this task today.` });
    return;
  }

  // 6. Task Type Specific Validation Logic
  if (task.category === 'referral') {
    const requiredRefs = task.requiredReferralCount || 3;
    if (user.referralCount < requiredRefs) {
      res.status(400).json({
        error: `This referral task requires at least ${requiredRefs} verified referrals. Your current referral count: ${user.referralCount}.`
      });
      return;
    }
  }

  if (task.category === 'install' && !proofNote) {
    res.status(400).json({ error: 'Proof note (e.g. installed app phone number or account ID) is required.' });
    return;
  }

  if ((task.category === 'video' || task.category === 'time_track') && task.durationSeconds > 0) {
    const watchedSec = Number(durationWatched || task.durationSeconds);
    if (watchedSec < task.durationSeconds) {
      res.status(400).json({ error: `Minimum required engagement time is ${task.durationSeconds} seconds. Please complete the full timer.` });
      return;
    }
  }

  // ==========================================
  // REWARD ENGINE EXECUTION
  // ==========================================
  const rewardTxId = generateId('REW-TX');

  // Credit user's Earned Wallet
  user.wallets.earnedBalance += task.rewardAmount;
  user.totalEarnings += task.rewardAmount;
  user.todayEarnings += task.rewardAmount;
  user.monthlyEarnings += task.rewardAmount;
  user.completedTasksCount += 1;

  // Increment task stats
  task.completedUsersCount += 1;
  if (task.completedUsersCount >= task.maxUsers) {
    task.status = 'completed';
  }

  db.updateTask(task.id, task);
  db.updateUser(user.id, user);

  // Record Task Completion
  const tc: TaskCompletion = {
    id: generateId('tc'),
    taskId: task.id,
    userId: user.id,
    taskTitle: task.title,
    category: task.category,
    rewardEarned: task.rewardAmount,
    walletType: 'earned',
    txId: rewardTxId,
    status: 'completed',
    completedAt: new Date().toISOString(),
    proofNote: proofNote || `Verified ${task.category} session`
  };
  db.addTaskCompletion(tc);

  // Record Wallet Transaction Entry
  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'earned',
    amount: task.rewardAmount,
    type: 'credit',
    title: `Task Reward: ${task.title}`,
    description: `Reward of ৳${task.rewardAmount} credited to Earned Wallet from sponsor ${task.sponsorName}`,
    txId: rewardTxId,
    createdAt: new Date().toISOString()
  });

  // App Notification
  db.addNotification({
    id: generateId('ntf'),
    userId: user.id,
    title: 'Task Reward Credited! 🎯',
    message: `৳${task.rewardAmount} BDT has been credited to your Earned Wallet for completing "${task.title}".`,
    type: 'task',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Audit Log
  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'TASK_REWARD_CREDITED',
    target: task.id,
    details: `Completed task ${task.id} (${task.title}). Credited ৳${task.rewardAmount} BDT to Earned Wallet. TxID: ${rewardTxId}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    message: `Task validated successfully! ৳${task.rewardAmount} BDT credited to your Earned Wallet.`,
    user,
    completion: tc
  });
});

// ==========================================
// PAYMENT GATEWAYS ENDPOINTS
// ==========================================

app.get('/api/payment-gateways', (req: Request, res: Response) => {
  const activeGateways = db.getPaymentGateways().filter(g => g.enabled);
  res.json({ gateways: activeGateways });
});

app.get('/api/admin/payment-gateways', checkAdmin, (req: Request, res: Response) => {
  const gateways = db.getPaymentGateways();
  res.json({ gateways });
});

app.post('/api/admin/payment-gateways/update', checkAdmin, (req: Request, res: Response) => {
  const { id, accountNumber, accountName, accountType, qrCodeUrl, instructions, enabled, minDeposit, maxDeposit, minWithdrawal, maxWithdrawal } = req.body;
  const gw = db.updatePaymentGateway(id, {
    accountNumber,
    accountName,
    accountType,
    qrCodeUrl,
    instructions,
    enabled: Boolean(enabled),
    minDeposit: Number(minDeposit),
    maxDeposit: Number(maxDeposit),
    minWithdrawal: Number(minWithdrawal),
    maxWithdrawal: Number(maxWithdrawal)
  });

  if (!gw) {
    res.status(404).json({ error: 'Payment gateway not found.' });
    return;
  }

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: 'PAYMENT_GATEWAY_UPDATE',
    target: id,
    details: `Updated gateway ${id} settings: Account ${accountNumber}, Type ${accountType}, Enabled ${enabled}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Payment gateway ${id} updated successfully.`, gateway: gw });
});

// ==========================================
// DEPOSIT ENDPOINTS (bKash, Nagad, Rocket)
// ==========================================

app.post('/api/deposits/request', (req: Request, res: Response) => {
  const { userId, amount, method, transactionId, screenshotUrl, proofNote } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || !method || !transactionId) {
    res.status(400).json({ error: 'Please enter a valid amount, payment method, and Transaction ID.' });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Blocked') {
    res.status(403).json({ error: 'Your account is suspended or blocked. Deposit operation is locked.' });
    return;
  }

  // Check duplicate TxID
  const cleanTxId = transactionId.trim().toUpperCase();
  if (db.isTransactionIdUsed(cleanTxId)) {
    res.status(400).json({
      error: `Transaction ID "${cleanTxId}" has already been submitted or processed in the system. Duplicate transactions are forbidden.`
    });
    return;
  }

  // Validate amount against payment method min/max
  const gateways = db.getPaymentGateways();
  const gw = gateways.find(g => g.id === method || g.name === method);
  if (gw) {
    if (!gw.enabled) {
      res.status(400).json({ error: `Payment method ${method} is currently disabled for deposits.` });
      return;
    }
    if (numAmount < gw.minDeposit) {
      res.status(400).json({ error: `Minimum deposit amount for ${method} is ৳${gw.minDeposit} BDT.` });
      return;
    }
    if (numAmount > gw.maxDeposit) {
      res.status(400).json({ error: `Maximum deposit amount for ${method} is ৳${gw.maxDeposit} BDT.` });
      return;
    }
  }

  // Create pending deposit request
  const depositReq: DepositRequest = {
    id: generateId('dep'),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    amount: numAmount,
    method: method as PaymentMethod,
    transactionId: cleanTxId,
    screenshotUrl,
    proofNote,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.createDeposit(depositReq);

  // Notification
  db.addNotification({
    id: generateId('ntf'),
    userId: user.id,
    title: 'Deposit Request Submitted',
    message: `Your deposit request of ৳${numAmount} via ${method} (TxID: ${cleanTxId}) is pending admin review.`,
    type: 'deposit',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Audit Log
  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'DEPOSIT_SUBMIT',
    target: depositReq.id,
    details: `Submitted deposit of ৳${numAmount} via ${method} (TxID: ${cleanTxId})`,
    createdAt: new Date().toISOString()
  });

  res.json({
    message: 'Deposit request submitted successfully! It will be reviewed by admin.',
    deposit: depositReq
  });
});

app.get('/api/deposits/my-deposits', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const deposits = db.getDeposits(userId);
  res.json({ deposits });
});

// ==========================================
// TIER & ID VERIFICATION ENDPOINTS
// ==========================================

app.get('/api/tiers', (req: Request, res: Response) => {
  const configs = db.getTierConfigs();
  res.json({ tiers: configs });
});

app.post('/api/tiers/verify-request', (req: Request, res: Response) => {
  const { userId, targetTier, nidOrPassport, documentPhotoUrl, walletType } = req.body;

  // Rule 9: Prevent attempts to use Earned Wallet or Bonus Wallet for Tier Activation or Tier Upgrade
  if (walletType && walletType !== 'deposit') {
    res.status(400).json({
      error: 'Invalid wallet selection. Tier Activation and Tier Upgrade requests must use ONLY the Deposit Wallet balance. Earned Wallet and Bonus Wallet CANNOT be used.'
    });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Blocked') {
    res.status(403).json({ error: 'Account is suspended or blocked.' });
    return;
  }

  // Check if user has an existing pending verification
  const existingVers = db.getVerifications(user.id).filter(v => v.status === 'pending' || v.status === 'under_review');
  if (existingVers.length > 0) {
    res.status(400).json({ error: 'You already have an active Tier Activation / Verification request under review. Please wait for admin approval.' });
    return;
  }

  const selectedTierName = targetTier || req.body.tier || req.body.tierName;

  if (!selectedTierName) {
    res.status(400).json({ error: 'Please select a valid verification tier.' });
    return;
  }

  // Look up tier in subscription plans first, then tier configs
  const plans = db.getSubscriptionPlans();
  const matchedPlan = plans.find(p => 
    p.tierName.toLowerCase() === selectedTierName.toLowerCase() ||
    p.name.toLowerCase() === selectedTierName.toLowerCase() ||
    p.id.toLowerCase() === selectedTierName.toLowerCase() ||
    selectedTierName.toLowerCase().includes(p.tierName.toLowerCase()) ||
    selectedTierName.toLowerCase().includes(p.name.toLowerCase())
  );

  const tierConfigs = db.getTierConfigs();
  const matchedConfig = tierConfigs.find(t => 
    t.name.toLowerCase() === selectedTierName.toLowerCase() ||
    selectedTierName.toLowerCase().includes(t.name.toLowerCase())
  );

  let tier = matchedPlan ? {
    name: matchedPlan.tierName,
    securityDeposit: matchedPlan.refundableSecurityDeposit,
    maxSingleWithdrawal: matchedPlan.maxSingleWithdrawal
  } : (matchedConfig ? {
    name: matchedConfig.name,
    securityDeposit: matchedConfig.securityDeposit,
    maxSingleWithdrawal: matchedConfig.maxSingleWithdrawal
  } : null);

  if (!tier) {
    const norm = selectedTierName.toLowerCase();
    if (norm.includes('bronze') || norm.includes('basic')) {
      tier = { name: 'Bronze', securityDeposit: 200, maxSingleWithdrawal: 2000 };
    } else if (norm.includes('silver') || norm.includes('standard')) {
      tier = { name: 'Silver', securityDeposit: 500, maxSingleWithdrawal: 5000 };
    } else if (norm.includes('gold') || norm.includes('premium')) {
      tier = { name: 'Gold', securityDeposit: 1000, maxSingleWithdrawal: 10000 };
    } else if (norm.includes('diamond')) {
      tier = { name: 'Diamond', securityDeposit: 1800, maxSingleWithdrawal: 15000 };
    } else if (norm.includes('vip')) {
      tier = { name: 'VIP', securityDeposit: 2500, maxSingleWithdrawal: 25000 };
    }
  }

  if (!tier) {
    res.status(400).json({ error: 'Invalid verification tier selected.' });
    return;
  }

  // Rule 1, 2, 3, 4 & 5: Validate ONLY the Deposit Wallet balance
  if (user.wallets.depositBalance < tier.securityDeposit) {
    res.status(400).json({
      error: `Insufficient Deposit Wallet balance. You need ৳${tier.securityDeposit} BDT in your Deposit Wallet for ${tier.name} Tier activation / upgrade. Earned Wallet and Bonus Wallet CANNOT be used for Tier Activation or Security Deposit. Please top up your Deposit Wallet first.`
    });
    return;
  }

  // Rule 6: Lock required Refundable Security Deposit from Deposit Wallet to Security Wallet
  user.wallets.depositBalance -= tier.securityDeposit;
  user.wallets.securityBalance += tier.securityDeposit;
  user.verificationStatus = 'Pending';
  db.updateUser(user.id, user);

  // Record wallet transaction (Debit from Deposit Wallet, Credit to Security Wallet)
  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'deposit',
    amount: tier.securityDeposit,
    type: 'debit',
    title: `${tier.name} Tier Security Lock`,
    description: `৳${tier.securityDeposit} BDT transferred from Deposit Wallet to Security Wallet for Refundable Security Deposit`,
    txId: generateId('SECLOCK'),
    createdAt: new Date().toISOString()
  });

  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'security',
    amount: tier.securityDeposit,
    type: 'credit',
    title: `${tier.name} Tier Security Wallet Deposit`,
    description: `৳${tier.securityDeposit} BDT locked safely in Security Wallet (100% Refundable)`,
    txId: generateId('SECHOLD'),
    createdAt: new Date().toISOString()
  });

  // Rule 6: Send Tier request to Admin for review
  const vReq: VerificationRequest = {
    id: generateId('ver'),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    targetTier: tier.name as TierLevel,
    requiredDeposit: tier.securityDeposit,
    status: 'pending',
    createdAt: new Date().toISOString(),
    nidOrPassport: nidOrPassport || 'N/A',
    documentPhotoUrl: documentPhotoUrl || ''
  };

  db.createVerification(vReq);

  // Notification
  db.addNotification({
    id: generateId('ntf'),
    userId: user.id,
    title: 'Tier Request Submitted',
    message: `Request for ${tier.name} Tier submitted to Admin. ৳${tier.securityDeposit} BDT locked from Deposit Wallet into Security Wallet awaiting Admin approval.`,
    type: 'verification',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Audit log
  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'TIER_REQUEST_SUBMIT',
    target: vReq.id,
    details: `Submitted ${tier.name} tier activation/upgrade. Locked ৳${tier.securityDeposit} BDT from Deposit Wallet. Pending Admin approval.`,
    createdAt: new Date().toISOString()
  });

  res.json({
    message: `${tier.name} Tier Activation request submitted! ৳${tier.securityDeposit} BDT locked from Deposit Wallet into Security Wallet. Sent to Admin for review and approval.`,
    user
  });
});

// ==========================================
// WITHDRAWAL ENDPOINTS
// ==========================================

app.post('/api/withdrawals/request', (req: Request, res: Response) => {
  const { userId, amount, method, accountNumber } = req.body;

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // 1. Account Status Check
  if (user.status === 'Suspended' || user.status === 'Blocked') {
    res.status(403).json({ error: 'Your account is suspended or blocked. Withdrawal requested is denied.' });
    return;
  }

  // 2. Verification Status Check
  if (user.verificationStatus !== 'Verified') {
    res.status(400).json({
      error: 'Withdrawals are locked until ID Verification is completed. Please complete Tier Verification in the ID Verification section.'
    });
    return;
  }

  // 3. Fraud Detection Check
  const activeFraudFlags = db.getFraudFlags().filter(f => f.userId === user.id && (f.status === 'open' || f.status === 'investigating') && f.severity === 'critical');
  if (activeFraudFlags.length > 0) {
    res.status(403).json({
      error: 'Withdrawals are temporarily locked on your account due to active security risk flag under review.'
    });
    return;
  }

  // 4. Pending Withdrawal Rules Check
  const pendingWds = db.getWithdrawals(user.id).filter(w => w.status === 'pending' || w.status === 'under_review');
  if (pendingWds.length > 0) {
    res.status(400).json({
      error: 'You already have a pending withdrawal request under review. Multiple concurrent withdrawals are disabled.'
    });
    return;
  }

  // 5. Payment Gateway Min Limits
  const gateways = db.getPaymentGateways();
  const gw = gateways.find(g => g.id === method || g.name === method);
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
    return;
  }

  if (gw) {
    if (!gw.enabled) {
      res.status(400).json({ error: `Payment method ${method} is currently disabled for payouts.` });
      return;
    }
    if (numAmount < gw.minWithdrawal) {
      res.status(400).json({ error: `Minimum withdrawal limit for ${method} is ৳${gw.minWithdrawal} BDT.` });
      return;
    }
  }

  // 6. Tier Max Limits
  const tierInfo = getTierInfoForUser(user);
  const maxLimit = tierInfo.maxSingleWithdrawal;

  if (numAmount > maxLimit) {
    res.status(400).json({
      error: `Your active ${tierInfo.name} Tier maximum single withdrawal limit is ৳${maxLimit.toLocaleString()} BDT. Please request ৳${maxLimit.toLocaleString()} or lower, or upgrade your tier.`
    });
    return;
  }

  // 7. Earned Wallet Balance Check
  if (user.wallets.earnedBalance < numAmount) {
    res.status(400).json({
      error: `Insufficient Earned Wallet balance. Available Earned Wallet: ৳${user.wallets.earnedBalance} BDT.`
    });
    return;
  }

  // Deduct Earned Wallet
  user.wallets.earnedBalance -= numAmount;
  db.updateUser(user.id, user);

  // Create Withdrawal Request
  const wReq: WithdrawalRequest = {
    id: generateId('wd'),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    userTier: user.tierStatus,
    amount: numAmount,
    method: method as PaymentMethod,
    accountNumber,
    status: 'pending',
    transactionId: generateId('WD-TX'),
    createdAt: new Date().toISOString()
  };

  db.createWithdrawal(wReq);

  // Transaction Log
  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'earned',
    amount: numAmount,
    type: 'debit',
    title: 'Withdrawal Request',
    description: `Withdrawal request of ৳${numAmount} via ${method} to ${accountNumber}`,
    txId: wReq.transactionId,
    createdAt: new Date().toISOString()
  });

  // Notification
  db.addNotification({
    id: generateId('ntf'),
    userId: user.id,
    title: 'Withdrawal Request Submitted',
    message: `Your withdrawal of ৳${numAmount} via ${method} (${accountNumber}) is pending payout processing.`,
    type: 'withdrawal',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Audit Log
  db.addAuditLog({
    id: generateId('log'),
    actorId: user.id,
    actorName: user.name,
    action: 'WITHDRAWAL_SUBMIT',
    target: wReq.id,
    details: `Submitted withdrawal request of ৳${numAmount} BDT via ${method} to ${accountNumber}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    message: 'Withdrawal request submitted successfully!',
    withdrawal: wReq,
    user
  });
});

app.get('/api/withdrawals/my-withdrawals', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const withdrawals = db.getWithdrawals(userId);
  res.json({ withdrawals });
});

// ==========================================
// REFERRAL & LEADERBOARD ENDPOINTS
// ==========================================

// ==========================================
// REFERRAL & SPONSOR MANAGEMENT ENDPOINTS (PART 7)
// ==========================================

// Validate referral code
app.get('/api/referrals/validate-code', (req: Request, res: Response) => {
  const code = (req.query.code as string || '').trim().toUpperCase();
  if (!code) {
    res.status(400).json({ valid: false, message: 'Referral code is required.' });
    return;
  }

  const sponsor = db.getUsers().find(u => u.referralCode === code);
  if (!sponsor) {
    res.status(404).json({ valid: false, message: 'Invalid or non-existent referral code.' });
    return;
  }

  const refSettings = db.getReferralSettings();
  if (!refSettings.isEnabled || refSettings.campaignStatus === 'paused') {
    res.status(400).json({ valid: false, message: 'Referral campaign is currently paused.' });
    return;
  }

  res.json({
    valid: true,
    referrerName: sponsor.name,
    referrerCode: sponsor.referralCode,
    rewardAmount: refSettings.rewardAmount
  });
});

app.get('/api/referral/stats', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = db.getUserById(userId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const refSettings = db.getReferralSettings();
  const team = db.getUsers().filter(u => u.sponsorId === user.id);
  const appUrl = process.env.APP_URL || 'https://earningplatform.com';
  const referralLink = `${appUrl}?ref=${user.referralCode}`;

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const activeReferred = team.filter(m => m.status === 'Active').length;
  const inactiveReferred = team.filter(m => m.status !== 'Active').length;
  const todayReferred = team.filter(m => m.registrationDate === todayStr).length;
  const monthlyReferred = team.filter(m => m.registrationDate.startsWith(currentMonthStr)).length;

  const userRecords = db.getReferralRecords(user.id);
  const totalReferralReward = userRecords.reduce((acc, r) => acc + r.rewardAmount, 0) || (user.referralCount * (refSettings.rewardAmount || 50));

  const referralTxs = db.getTransactions(user.id).filter(t => 
    t.title.toLowerCase().includes('referral') || t.description.toLowerCase().includes('referr')
  );

  // Global referral leaderboard
  const allUsers = db.getUsers().filter(u => u.role === 'user');
  const leaderboard = allUsers
    .map(u => ({
      userId: u.id,
      userName: u.name,
      referralCode: u.referralCode,
      totalReferredCount: u.referralCount,
      activeReferredCount: db.getUsers().filter(sub => sub.sponsorId === u.id && sub.status === 'Active').length,
      inactiveReferredCount: db.getUsers().filter(sub => sub.sponsorId === u.id && sub.status !== 'Active').length,
      todayReferredCount: db.getUsers().filter(sub => sub.sponsorId === u.id && sub.registrationDate === todayStr).length,
      monthlyReferredCount: db.getUsers().filter(sub => sub.sponsorId === u.id && sub.registrationDate.startsWith(currentMonthStr)).length,
      totalCommissionsEarned: u.referralCount * (refSettings.rewardAmount || 50),
      rank: 0
    }))
    .sort((a, b) => b.totalReferredCount - a.totalReferredCount)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  res.json({
    referralCode: user.referralCode,
    referralLink,
    totalReferred: user.referralCount,
    activeReferred,
    inactiveReferred,
    todayReferred,
    monthlyReferred,
    totalReferralReward,
    teamMembers: team.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      registrationDate: m.registrationDate,
      verificationStatus: m.verificationStatus,
      tierStatus: m.tierStatus,
      status: m.status
    })),
    referralRecords: userRecords,
    referralTransactions: referralTxs,
    leaderboard: leaderboard.slice(0, 15),
    settings: refSettings
  });
});

app.get('/api/referrals/leaderboard', (req: Request, res: Response) => {
  const filter = (req.query.filter as string || 'alltime').toLowerCase();
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const allUsers = db.getUsers().filter(u => u.role === 'user');
  const refSettings = db.getReferralSettings();

  const leaderboard = allUsers
    .map(u => {
      const userTeam = db.getUsers().filter(sub => sub.sponsorId === u.id);
      const monthlyCount = userTeam.filter(sub => sub.registrationDate.startsWith(currentMonthStr)).length;
      const count = filter === 'monthly' ? monthlyCount : u.referralCount;

      return {
        userId: u.id,
        userName: u.name,
        referralCode: u.referralCode,
        totalReferredCount: u.referralCount,
        monthlyReferredCount: monthlyCount,
        totalCommissionsEarned: u.referralCount * (refSettings.rewardAmount || 50),
        rank: 0
      };
    })
    .sort((a, b) => (filter === 'monthly' ? b.monthlyReferredCount - a.monthlyReferredCount : b.totalReferredCount - a.totalReferredCount))
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  res.json({ leaderboard: leaderboard.slice(0, 20), filter });
});

// Admin Referral Control Endpoints
app.get('/api/admin/referrals/settings', checkAdmin, (req: Request, res: Response) => {
  res.json({ settings: db.getReferralSettings() });
});

app.post('/api/admin/referrals/settings', checkAdmin, (req: Request, res: Response) => {
  const { isEnabled, rewardAmount, campaignStatus, requireVerificationForReward, monthlyLeaderboardPrizePool } = req.body;

  const updated = db.updateReferralSettings({
    isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
    rewardAmount: Number(rewardAmount || 50),
    campaignStatus: campaignStatus || 'active',
    requireVerificationForReward: Boolean(requireVerificationForReward),
    monthlyLeaderboardPrizePool: Number(monthlyLeaderboardPrizePool || 5000)
  });

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: 'REFERRAL_CAMPAIGN_UPDATE',
    target: 'referral_settings',
    details: `Updated referral settings. Reward: ৳${updated.rewardAmount}, Enabled: ${updated.isEnabled}, Status: ${updated.campaignStatus}`,
    createdAt: new Date().toISOString()
  });

  // Notify users if status changed
  db.addNotification({
    id: generateId('ntf'),
    userId: 'all',
    title: 'Referral Campaign Update 📢',
    message: `Referral rewards updated to ৳${updated.rewardAmount} BDT per referral. Campaign status is ${updated.campaignStatus.toUpperCase()}.`,
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Referral settings updated successfully.', settings: updated });
});

app.get('/api/admin/referrals/reports', checkAdmin, (req: Request, res: Response) => {
  const records = db.getReferralRecords();
  const settings = db.getReferralSettings();
  const users = db.getUsers().filter(u => u.role === 'user');

  const totalReferralRewardsDistributed = records.reduce((acc, r) => acc + r.rewardAmount, 0);

  res.json({
    reports: {
      totalReferralsCount: records.length,
      totalRewardsDistributed: totalReferralRewardsDistributed,
      records,
      settings,
      topReferrers: [...users].sort((a, b) => b.referralCount - a.referralCount).slice(0, 10)
    }
  });
});

// Sponsor Brands & Campaigns Endpoints
app.get('/api/sponsors/all', (req: Request, res: Response) => {
  const sponsors = db.getSponsors().filter(s => s.status === 'active');
  res.json({ sponsors });
});

app.get('/api/admin/sponsors/all', checkAdmin, (req: Request, res: Response) => {
  const sponsors = db.getSponsors();
  const campaigns = db.getSponsorCampaigns();
  res.json({ sponsors, campaigns });
});

app.post('/api/admin/sponsors/save', checkAdmin, (req: Request, res: Response) => {
  const { id, name, logoUrl, bannerUrl, description, websiteUrl, status } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: 'Sponsor name and description are required.' });
    return;
  }

  let sponsor: any;
  if (id) {
    sponsor = db.updateSponsor(id, { name, logoUrl, bannerUrl, description, websiteUrl, status });
  } else {
    sponsor = {
      id: generateId('spn'),
      name,
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      description,
      websiteUrl,
      status: status || 'active',
      createdAt: new Date().toISOString()
    };
    db.addSponsor(sponsor);
  }

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: 'SPONSOR_UPDATE',
    target: sponsor.id,
    details: `Saved sponsor brand "${sponsor.name}" (Status: ${sponsor.status})`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Sponsor brand saved successfully.', sponsor });
});

app.get('/api/admin/sponsor-campaigns/all', checkAdmin, (req: Request, res: Response) => {
  res.json({ campaigns: db.getSponsorCampaigns() });
});

app.post('/api/admin/sponsor-campaigns/save', checkAdmin, (req: Request, res: Response) => {
  const { id, sponsorId, sponsorName, campaignName, description, bannerUrl, startDate, endDate, status, budgetAmount, spentAmount, associatedTaskIds } = req.body;

  if (!sponsorName || !campaignName) {
    res.status(400).json({ error: 'Sponsor name and Campaign name are required.' });
    return;
  }

  let campaign: any;
  if (id) {
    campaign = db.updateCampaign(id, {
      sponsorId,
      sponsorName,
      campaignName,
      description,
      bannerUrl,
      startDate,
      endDate,
      status: status || 'active',
      budgetAmount: Number(budgetAmount || 0),
      spentAmount: Number(spentAmount || 0),
      associatedTaskIds: associatedTaskIds || []
    });
  } else {
    campaign = {
      id: generateId('cmp'),
      sponsorId: sponsorId || 'spn_001',
      sponsorName,
      campaignName,
      description: description || '',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || '2026-12-31',
      status: status || 'active',
      budgetAmount: Number(budgetAmount || 100000),
      spentAmount: Number(spentAmount || 0),
      associatedTaskIds: associatedTaskIds || [],
      createdAt: new Date().toISOString()
    };
    db.addCampaign(campaign);

    // Notify all users about new campaign
    if (campaign.status === 'active') {
      db.addNotification({
        id: generateId('ntf'),
        userId: 'all',
        title: 'Sponsor Campaign Available! 🚀',
        message: `New campaign "${campaignName}" by ${sponsorName} is live! Earn rewards by participating in sponsor tasks.`,
        type: 'task',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: id ? 'CAMPAIGN_UPDATE' : 'CAMPAIGN_CREATE',
    target: campaign.id,
    details: `Saved campaign "${campaignName}" for sponsor ${sponsorName}. Budget: ৳${campaign.budgetAmount} BDT`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Sponsor campaign saved successfully.', campaign });
});

app.post('/api/admin/sponsor-campaigns/status', checkAdmin, (req: Request, res: Response) => {
  const { campaignId, status } = req.body;
  const cmp = db.updateCampaign(campaignId, { status });

  if (!cmp) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: 'CAMPAIGN_STATUS_CHANGE',
    target: campaignId,
    details: `Changed status of campaign "${cmp.campaignName}" to ${status}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Campaign status changed to ${status}`, campaign: cmp });
});

app.get('/api/admin/sponsors/analytics', checkAdmin, (req: Request, res: Response) => {
  const sponsors = db.getSponsors();
  const campaigns = db.getSponsorCampaigns();
  const tasks = db.getTasks();
  const completions = db.getTaskCompletions();
  const referralRecords = db.getReferralRecords();

  const totalSponsors = sponsors.length;
  const activeSponsors = sponsors.filter(s => s.status === 'active').length;

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budgetAmount, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spentAmount, 0);

  const totalReferralRewards = referralRecords.reduce((acc, r) => acc + r.rewardAmount, 0);

  res.json({
    analytics: {
      totalSponsors,
      activeSponsors,
      totalCampaigns,
      activeCampaigns,
      totalBudget,
      totalSpent,
      totalTaskCompletions: completions.length,
      totalReferralsCount: referralRecords.length,
      totalReferralRewards,
      campaigns,
      sponsors
    }
  });
});

// ==========================================
// NOTIFICATIONS & NOTICES
// ==========================================

app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.json({ notifications: [], unreadCount: 0, notices: db.getNotices() });
    return;
  }
  const notifications = db.getNotifications(userId);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const notices = db.getNotices();
  res.json({ notifications, unreadCount, notices });
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { notificationId } = req.body;
  if (notificationId && userId) {
    db.markNotificationAsRead(notificationId, userId);
  }
  const notifications = userId ? db.getNotifications(userId) : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  res.json({ success: true, unreadCount });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    db.markAllNotificationsAsRead(userId);
  }
  res.json({ success: true, unreadCount: 0 });
});

app.post('/api/notifications/delete', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { notificationId, id } = req.body;
  const targetId = notificationId || id;
  if (targetId && userId) {
    db.deleteNotification(targetId, userId);
  }
  const notifications = userId ? db.getNotifications(userId) : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  res.json({ success: true, unreadCount });
});

app.post('/api/notifications/register-fcm-token', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { fcmToken, token } = req.body;
  const targetToken = fcmToken || token;
  if (userId && targetToken) {
    db.registerFcmToken(userId, targetToken);
    res.json({ success: true, message: 'FCM push token registered successfully.' });
  } else {
    res.status(400).json({ error: 'User ID and FCM token required.' });
  }
});

// ==========================================
// SUPPORT & AI CHATBOT (GEMINI 2.5 FLASH WITH SMART FALLBACK)
// ==========================================

function generateSmartSupportReply(message: string, userContext: any): string {
  const msg = (message || '').toLowerCase();
  const userName = userContext?.name || 'Earner';
  const tier = userContext?.tier || 'Bronze';

  if (msg.includes('deposit') || msg.includes('bkash') || msg.includes('nagad') || msg.includes('rocket')) {
    return `Hello ${userName}! To deposit funds:
• Navigate to the **Deposit** page from your dashboard menu.
• Choose your payment channel (**bKash**, **Nagad**, **Rocket**, or **USDT**).
• Send the exact deposit amount to our verified merchant cash number.
• Enter your payment **Transaction ID (TxID)** and submit.
• Deposit verification completes within **1 to 5 minutes** automatically!`;
  }

  if (msg.includes('wallet') || msg.includes('earned') || msg.includes('bonus') || msg.includes('security')) {
    return `Hello ${userName}! Here is how your **4 Separate Wallets** work:
• **Earned Wallet**: Contains earnings from completed tasks and referral bonuses. Ready for instant withdrawal after ID verification.
• **Deposit Wallet**: Funds you deposit via bKash/Nagad/Rocket. Used for security deposit upgrades.
• **Bonus Wallet**: ৳100 BDT sign-up reward and promotional bonuses.
• **Security Wallet**: Holds your **100% Refundable Security Deposit** during your active membership tier warranty.`;
  }

  if (msg.includes('withdraw') || msg.includes('payout') || msg.includes('limit')) {
    return `Hello ${userName}! Regarding **Withdrawals**:
• Ensure your account has submitted **Tier Verification / NID Level 2**.
• Single withdrawal limits depend on your active tier (e.g., Bronze: ৳2,000, Silver: ৳5,000, Gold: ৳10,000, VIP: ৳25,000).
• Withdrawals are sent directly to your personal bKash/Nagad account within **15 minutes to 2 hours**.`;
  }

  if (msg.includes('verif') || msg.includes('nid') || msg.includes('tier') || msg.includes('passport')) {
    return `Hello ${userName}! To complete **Tier Verification**:
• Go to the **Tier Verification** section in your dashboard.
• Select your target Tier (Bronze, Silver, Gold, Diamond, or VIP).
• Ensure your **Deposit Wallet** has sufficient funds for the refundable security deposit.
• Enter your NID or Passport number and upload document proof.
• Once approved, your withdrawal privileges and daily task earning caps will unlock instantly!`;
  }

  if (msg.includes('task') || msg.includes('sponsor') || msg.includes('earn')) {
    return `Hello ${userName}! Regarding **Sponsor Tasks**:
• Go to the **Sponsor Tasks** tab to view daily available video ads and sponsor offers.
• Click "Start Task", complete the watch duration, and claim your instant reward.
• Daily task limits increase with higher tier levels (e.g., Bronze: 10 tasks/day, Gold: 50 tasks/day, VIP: 150 tasks/day).`;
  }

  return `Hello ${userName}! I am your official 24/7 AI Support Assistant.
• **Current Tier**: ${tier}
• **Deposit / Top-up**: Use bKash, Nagad, Rocket, or USDT in the Deposit menu.
• **Withdrawal**: Require Tier Verification with refundable security deposit.
• **Help Tickets**: You can also open an official support ticket in the Support tab for 1-on-1 agent assistance.`;
}

app.post('/api/support/ai-chat', async (req: Request, res: Response) => {
  const { message, userContext } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const systemPrompt = `You are the official AI Support Assistant for the Sponsor-Based Earning Platform.
You assist users with their questions regarding:
1. Four Separate Wallets:
   - Bonus Wallet: 100 BDT registration reward. Non-withdrawable, non-transferable.
   - Earned Wallet: Real task & referral rewards. Withdrawable after ID Verification.
   - Deposit Wallet: User deposited money (via bKash, Nagad, Rocket).
   - Security Wallet: Holds 100% Refundable Security Deposit during ID verification.
2. Verification Tiers & Single Withdrawal Limits:
   - Bronze Tier: ৳200 Security Deposit -> Max Single Withdrawal: ৳2,000 BDT
   - Silver Tier: ৳500 Security Deposit -> Max Single Withdrawal: ৳5,000 BDT
   - Gold Tier: ৳1,000 Security Deposit -> Max Single Withdrawal: ৳10,000 BDT
   - Diamond Tier: ৳1,800 Security Deposit -> Max Single Withdrawal: ৳15,000 BDT
   - VIP Tier: ৳2,500 Security Deposit -> Max Single Withdrawal: ৳25,000 BDT
3. Deposit Methods: bKash, Nagad, Rocket with Transaction ID verification.
4. General Rules: Company income comes purely from sponsors and advertisers, NOT user deposits. Security deposits always belong to the user.

Keep your tone friendly, professional, empathetic, and concise. Format with clear bullet points.
User Context: Name: ${userContext?.name || 'Earner'}, Tier: ${userContext?.tier || 'None'}, Verification: ${userContext?.verification || 'Unverified'}.`;

  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let aiReply: string | null = null;

  const ai = getGeminiAI();
  if (ai) {
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          aiReply = response.text;
          break;
        }
      } catch (err: any) {
        const isQuotaError = err?.status === 'RESOURCE_EXHAUSTED' || err?.code === 429 || String(err).includes('429') || String(err).includes('quota');
        if (isQuotaError) {
          console.info(`[AI Support Chat] Model ${modelName} quota/rate limit reached. Using fallback mechanism.`);
        } else {
          console.warn(`[AI Support Chat] Model ${modelName} call failed:`, err?.message || err);
        }
      }
    }
  }

  if (!aiReply) {
    aiReply = generateSmartSupportReply(message, userContext);
  }

  res.json({ reply: aiReply });
});

app.post('/api/support/tickets', (req: Request, res: Response) => {
  const { userId, userName, subject, message } = req.body;

  const ticket: SupportTicket = {
    id: generateId('tck'),
    userId,
    userName,
    subject,
    message,
    status: 'open',
    createdAt: new Date().toISOString(),
    replies: [
      {
        sender: 'ai',
        message: 'Thank you for reaching out! A human support specialist or admin will review your ticket shortly.',
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.createSupportTicket(ticket);
  res.json({ message: 'Support ticket submitted successfully.', ticket });
});

app.get('/api/support/tickets', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const tickets = db.getSupportTickets(userId);
  res.json({ tickets });
});

// ==========================================
// ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Middleware for admin verification
function checkAdmin(req: Request, res: Response, next: Function) {
  const userId = req.headers['x-user-id'] as string;
  const user = userId ? db.getUserById(userId) : undefined;

  if (!user) {
    res.status(403).json({ error: 'Access denied. Authentication required.' });
    return;
  }

  const isSuperAdmin = user.email.toLowerCase() === 'sponsorearn00@gmail.com';
  const isAdmin = user.role === 'admin';

  if (!isSuperAdmin && !isAdmin) {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Blocked' || user.status === 'Inactive') {
    res.status(403).json({ error: `Access denied. Admin account is currently ${user.status}.` });
    return;
  }

  (req as any).adminUser = user;
  next();
}

// Middleware strictly for Super Admin (sponsorearn00@gmail.com)
function checkSuperAdmin(req: Request, res: Response, next: Function) {
  checkAdmin(req, res, () => {
    const adminUser = (req as any).adminUser;
    if (!adminUser || adminUser.email.toLowerCase() !== 'sponsorearn00@gmail.com') {
      res.status(403).json({ error: 'Access denied. Only Super Admin (sponsorearn00@gmail.com) can perform this action.' });
      return;
    }
    next();
  });
}

// ==========================================
// ADMIN MANAGEMENT ENDPOINTS (SUPER ADMIN ONLY)
// ==========================================

app.get('/api/admin/admins/all', checkAdmin, (req: Request, res: Response) => {
  const allUsers = db.getUsers();
  const admins = allUsers.filter(u => u.email.toLowerCase() === 'sponsorearn00@gmail.com' || u.role === 'admin');
  res.json({ admins });
});

app.post('/api/admin/admins/save', checkSuperAdmin, (req: Request, res: Response) => {
  const { id, name, email, password, role, status } = req.body;

  if (!email || !name) {
    res.status(400).json({ error: 'Admin Name and Gmail/email address are required.' });
    return;
  }

  const isSuperAdminEmail = email.trim().toLowerCase() === 'sponsorearn00@gmail.com';

  if (id) {
    // Update existing admin
    const targetUser = db.getUserById(id);
    if (!targetUser) {
      res.status(404).json({ error: 'Admin user not found.' });
      return;
    }

    if (targetUser.email.toLowerCase() === 'sponsorearn00@gmail.com' && !isSuperAdminEmail) {
      res.status(403).json({ error: 'Cannot change the primary Super Admin email.' });
      return;
    }

    const updates: Partial<UserProfile> = {
      name,
      email: isSuperAdminEmail ? 'sponsorearn00@gmail.com' : email,
      role: 'admin',
      adminRole: isSuperAdminEmail ? 'Super Admin' : (role || 'Finance Admin'),
      status: isSuperAdminEmail ? 'Verified' : (status || 'Active')
    };

    if (password && password.trim()) {
      updates.passwordHash = bcrypt.hashSync(password.trim(), 10);
    }

    const updated = db.updateUser(id, updates);

    db.addAuditLog({
      id: generateId('log'),
      actorId: (req as any).adminUser?.id || 'usr_super_admin',
      actorName: (req as any).adminUser?.name || 'Super Admin',
      action: 'ADMIN_USER_UPDATE',
      target: id,
      details: `Updated admin account ${name} (${email}) - Role: ${updates.adminRole}, Status: ${updates.status}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Admin user updated successfully.', admin: updated });
  } else {
    // Create new admin
    if (!password || password.trim().length < 6) {
      res.status(400).json({ error: 'Password is required and must be at least 6 characters.' });
      return;
    }

    const existingUser = db.getUserByEmailOrPhone(email);
    if (existingUser) {
      // If user exists, promote to admin role
      existingUser.role = 'admin';
      existingUser.adminRole = role || 'Finance Admin';
      existingUser.status = status || 'Active';
      existingUser.passwordHash = bcrypt.hashSync(password.trim(), 10);
      db.updateUser(existingUser.id, existingUser);

      db.addAuditLog({
        id: generateId('log'),
        actorId: (req as any).adminUser?.id || 'usr_super_admin',
        actorName: (req as any).adminUser?.name || 'Super Admin',
        action: 'ADMIN_USER_PROMOTE',
        target: existingUser.id,
        details: `Promoted existing user ${existingUser.name} (${email}) to Admin Role: ${role}`,
        createdAt: new Date().toISOString()
      });

      res.json({ message: `Promoted ${existingUser.name} to ${role} successfully.`, admin: existingUser });
      return;
    }

    const newAdminUser: UserProfile = {
      id: generateId('usr_adm'),
      name,
      username: email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: '+88017' + Math.floor(10000000 + Math.random() * 90000000),
      role: 'admin',
      adminRole: role || 'Finance Admin',
      passwordHash: bcrypt.hashSync(password.trim(), 10),
      country: 'Bangladesh',
      registrationDate: new Date().toISOString().split('T')[0],
      status: status || 'Active',
      verificationStatus: 'Verified',
      tierStatus: 'VIP',
      referralCode: 'ADM' + Math.floor(1000 + Math.random() * 9000),
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
      referralCount: 0,
      deviceId: 'device_' + generateId('dev')
    };

    db.createUser(newAdminUser);

    db.addAuditLog({
      id: generateId('log'),
      actorId: (req as any).adminUser?.id || 'usr_super_admin',
      actorName: (req as any).adminUser?.name || 'Super Admin',
      action: 'ADMIN_USER_CREATE',
      target: newAdminUser.id,
      details: `Created new admin user ${name} (${email}) with Role: ${role}, Status: ${status}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: `Admin account for ${name} created successfully!`, admin: newAdminUser });
  }
});

app.post('/api/admin/admins/delete', checkSuperAdmin, (req: Request, res: Response) => {
  const { targetAdminId } = req.body;

  const targetUser = db.getUserById(targetAdminId);
  if (!targetUser) {
    res.status(404).json({ error: 'Admin user not found.' });
    return;
  }

  if (targetUser.email.toLowerCase() === 'sponsorearn00@gmail.com') {
    res.status(403).json({ error: 'Super Admin (sponsorearn00@gmail.com) cannot be deleted.' });
    return;
  }

  // Downgrade to user role or remove
  targetUser.role = 'user';
  delete targetUser.adminRole;
  db.updateUser(targetUser.id, targetUser);

  db.addAuditLog({
    id: generateId('log'),
    actorId: (req as any).adminUser?.id || 'usr_super_admin',
    actorName: (req as any).adminUser?.name || 'Super Admin',
    action: 'ADMIN_USER_REMOVE',
    target: targetAdminId,
    details: `Removed admin privileges for ${targetUser.name} (${targetUser.email})`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Admin privileges removed for ${targetUser.name}.` });
});

app.get('/api/admin/overview', checkAdmin, (req: Request, res: Response) => {
  const users = db.getUsers();
  const deposits = db.getDeposits();
  const withdrawals = db.getWithdrawals();
  const verifications = db.getVerifications();

  const totalUsers = users.length;
  const totalVerified = users.filter(u => u.verificationStatus === 'Verified').length;
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingVerifications = verifications.filter(v => v.status === 'pending').length;

  res.json({
    stats: {
      totalUsers,
      totalVerified,
      pendingDeposits,
      pendingWithdrawals,
      pendingVerifications,
      totalPlatformDeposits: deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0),
      totalPlatformWithdrawals: withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0)
    },
    pendingDepositsList: deposits.filter(d => d.status === 'pending'),
    pendingWithdrawalsList: withdrawals.filter(w => w.status === 'pending'),
    pendingVerificationsList: verifications.filter(v => v.status === 'pending')
  });
});

app.get('/api/admin/users', checkAdmin, (req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

app.post('/api/admin/users/update-status', checkAdmin, (req: Request, res: Response) => {
  const { targetUserId, newStatus, adminNote } = req.body;
  const user = db.getUserById(targetUserId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.email.toLowerCase() === 'sponsorearn00@gmail.com' || user.id === 'usr_super_admin') {
    res.status(403).json({ error: 'Super Admin account (sponsorearn00@gmail.com) is permanent and cannot be modified or suspended.' });
    return;
  }

  user.status = newStatus;
  db.updateUser(user.id, user);

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string,
    actorName: 'Admin',
    action: 'UPDATE_USER_STATUS',
    target: targetUserId,
    details: `Updated user status to ${newStatus}. Note: ${adminNote || 'None'}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `User status changed to ${newStatus}`, user });
});

app.post('/api/admin/users/adjust-wallet', checkAdmin, (req: Request, res: Response) => {
  const { targetUserId, walletType, amount, operation, reason } = req.body; // walletType: 'bonus'|'earned'|'deposit'|'security', operation: 'credit'|'debit'
  const user = db.getUserById(targetUserId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Please enter a valid positive amount.' });
    return;
  }

  if (!['bonus', 'earned', 'deposit', 'security'].includes(walletType)) {
    res.status(400).json({ error: 'Invalid wallet type.' });
    return;
  }

  const walletKeyMap: Record<string, 'bonusBalance' | 'earnedBalance' | 'depositBalance' | 'securityBalance'> = {
    bonus: 'bonusBalance',
    earned: 'earnedBalance',
    deposit: 'depositBalance',
    security: 'securityBalance'
  };

  const key = walletKeyMap[walletType];
  const currentBalance = user.wallets[key];

  if (operation === 'debit' && currentBalance < numAmount) {
    res.status(400).json({ error: `Cannot debit ৳${numAmount}. Current ${walletType} wallet balance is ৳${currentBalance}. Negative balance is impossible.` });
    return;
  }

  if (operation === 'credit') {
    user.wallets[key] += numAmount;
  } else {
    user.wallets[key] -= numAmount;
  }

  db.updateUser(user.id, user);

  // Add Transaction record
  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: walletType as any,
    amount: numAmount,
    type: operation,
    title: `Admin Wallet ${operation === 'credit' ? 'Adjustment Credit' : 'Adjustment Debit'}`,
    description: reason || `Manual balance ${operation} by Admin authority`,
    txId: generateId('ADM-ADJ'),
    createdAt: new Date().toISOString()
  });

  // Add System Audit Log
  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string,
    actorName: 'Admin',
    action: 'WALLET_BALANCE_ADJUST',
    target: user.id,
    details: `${operation.toUpperCase()} ৳${numAmount} BDT on ${walletType} wallet. Reason: ${reason || 'N/A'}. New balance: ৳${user.wallets[key]}`,
    createdAt: new Date().toISOString()
  });

  // Notify user
  db.addNotification({
    id: generateId('ntf'),
    userId: user.id,
    title: `Wallet Balance ${operation === 'credit' ? 'Credited' : 'Debited'}`,
    message: `Your ${walletType.toUpperCase()} wallet balance was ${operation === 'credit' ? 'credited' : 'debited'} with ৳${numAmount} BDT by Admin. Reason: ${reason || 'Administrative adjustment'}.`,
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Successfully ${operation}ed ৳${numAmount} BDT to ${user.name}'s ${walletType} wallet.`, user });
});

app.get('/api/admin/audit-logs', checkAdmin, (req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ logs });
});

app.post('/api/admin/deposits/action', checkAdmin, (req: Request, res: Response) => {
  const { depositId, action, rejectReason } = req.body; // action = 'approve' | 'reject'
  const deposits = db.getDeposits();
  const dep = deposits.find(d => d.id === depositId);

  if (!dep) {
    res.status(400).json({ error: 'Deposit request not found.' });
    return;
  }

  const user = db.getUserById(dep.userId);

  if (action === 'approve') {
    dep.status = 'approved';
    dep.approvedAt = new Date().toISOString();

    if (user) {
      user.wallets.depositBalance += dep.amount;
      user.totalDeposit += dep.amount;
      db.updateUser(user.id, user);

      // Wallet Transaction
      db.addTransaction({
        id: generateId('tx'),
        userId: user.id,
        walletType: 'deposit',
        amount: dep.amount,
        type: 'credit',
        title: 'Deposit Approved',
        description: `Deposit of ৳${dep.amount} via ${dep.method} (TxID: ${dep.transactionId}) credited to Deposit Wallet`,
        txId: dep.transactionId,
        createdAt: new Date().toISOString()
      });

      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'Deposit Approved!',
        message: `Your deposit of ৳${dep.amount} BDT via ${dep.method} has been approved and credited to your Deposit Wallet.`,
        type: 'deposit',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } else {
    dep.status = 'rejected';
    dep.rejectReason = rejectReason || 'Transaction ID mismatch or unverified payment';

    if (user) {
      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'Deposit Rejected',
        message: `Your deposit request of ৳${dep.amount} BDT was rejected. Reason: ${dep.rejectReason}`,
        type: 'deposit',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.updateDeposit(dep.id, dep);

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: `DEPOSIT_${action.toUpperCase()}`,
    target: dep.id,
    details: `${action.toUpperCase()} deposit of ৳${dep.amount} BDT for user ${dep.userName} (${dep.userId}). TxID: ${dep.transactionId}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Deposit request ${action}d successfully.`, deposit: dep });
});

app.post('/api/admin/withdrawals/action', checkAdmin, (req: Request, res: Response) => {
  const { withdrawalId, action, rejectReason, adminRemark } = req.body;
  const withdrawals = db.getWithdrawals();
  const w = withdrawals.find(req => req.id === withdrawalId);

  if (!w) {
    res.status(400).json({ error: 'Withdrawal request not found.' });
    return;
  }

  const user = db.getUserById(w.userId);

  if (action === 'approve' || action === 'completed') {
    w.status = action as any;
    w.processedAt = new Date().toISOString();
    w.adminRemark = adminRemark || 'Payment sent successfully';

    if (user) {
      user.totalWithdraw += w.amount;
      db.updateUser(user.id, user);

      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'Withdrawal Approved & Sent!',
        message: `Your withdrawal of ৳${w.amount} BDT via ${w.method} to ${w.accountNumber} has been processed.`,
        type: 'withdrawal',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } else if (action === 'reject') {
    w.status = 'rejected';
    w.rejectReason = rejectReason || 'Payout processing failed or suspicious activity';
    w.adminRemark = adminRemark || rejectReason;

    // Refund Earned Wallet
    if (user) {
      user.wallets.earnedBalance += w.amount;
      db.updateUser(user.id, user);

      db.addTransaction({
        id: generateId('tx'),
        userId: user.id,
        walletType: 'earned',
        amount: w.amount,
        type: 'credit',
        title: 'Withdrawal Refund',
        description: `৳${w.amount} BDT refunded to Earned Wallet due to rejected withdrawal`,
        txId: generateId('REFUND'),
        createdAt: new Date().toISOString()
      });

      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'Withdrawal Request Rejected',
        message: `Your withdrawal request of ৳${w.amount} BDT was rejected. ৳${w.amount} BDT refunded to your Earned Wallet. Reason: ${w.rejectReason}`,
        type: 'withdrawal',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } else if (action === 'under_review') {
    w.status = 'under_review';
    w.adminRemark = adminRemark || 'Under manual security review';
  }

  db.updateWithdrawal(w.id, w);

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: `WITHDRAWAL_${action.toUpperCase()}`,
    target: w.id,
    details: `${action.toUpperCase()} withdrawal request of ৳${w.amount} BDT for user ${w.userName} (${w.userId})`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Withdrawal request status updated to ${action}.`, withdrawal: w });
});

app.post('/api/admin/verifications/action', checkAdmin, (req: Request, res: Response) => {
  const { verificationId, action, adminNote } = req.body;
  const verifications = db.getVerifications();
  const v = verifications.find(req => req.id === verificationId);

  if (!v) {
    res.status(400).json({ error: 'Verification request not found.' });
    return;
  }

  const user = db.getUserById(v.userId);

  if (action === 'approve') {
    v.status = 'approved';
    v.reviewedAt = new Date().toISOString();
    v.adminNote = adminNote || 'Identity documents verified successfully.';

    if (user) {
      user.verificationStatus = 'Verified';
      const targetTierName = v.targetTier && v.targetTier !== 'None' && v.targetTier !== 'Unverified' ? v.targetTier : 'Bronze';
      user.tierStatus = targetTierName as any;
      user.status = 'Verified';
      const tierInfo = getTierInfoForUser(user);
      user.tierStatus = tierInfo.name as any;
      user.maxSingleWithdrawal = tierInfo.maxSingleWithdrawal;
      user.dailyTaskLimit = tierInfo.dailyTaskLimit;
      user.dailyEarningLimit = tierInfo.dailyEarningLimit;
      db.updateUser(user.id, user);

      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'ID Verification Approved!',
        message: `Congratulations! Your account is now Verified under ${tierInfo.name} Tier. Single withdrawal limit: ৳${tierInfo.maxSingleWithdrawal.toLocaleString()} BDT.`,
        type: 'verification',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } else if (action === 'reject') {
    v.status = 'rejected';
    v.adminNote = adminNote || 'ID documents incomplete or details mismatch';

    if (user) {
      user.verificationStatus = 'Rejected';
      // Return Security deposit back to Deposit Wallet
      if (user.wallets.securityBalance >= v.requiredDeposit) {
        user.wallets.securityBalance -= v.requiredDeposit;
        user.wallets.depositBalance += v.requiredDeposit;
      }
      db.updateUser(user.id, user);

      db.addNotification({
        id: generateId('ntf'),
        userId: user.id,
        title: 'ID Verification Rejected',
        message: `Verification request rejected. ৳${v.requiredDeposit} Security Deposit refunded back to your Deposit Wallet. Reason: ${v.adminNote}`,
        type: 'verification',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } else if (action === 'under_review') {
    v.status = 'under_review';
    v.adminNote = adminNote || 'Placed under manual security review';
  }

  db.updateVerification(v.id, v);

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: `VERIFICATION_${action.toUpperCase()}`,
    target: v.id,
    details: `Updated verification ${v.id} to ${action}. Note: ${adminNote || 'N/A'}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Verification status updated to ${action}.`, verification: v, user: user ? getFormattedUserWithTier(user) : null });
});

app.get('/api/admin/reports/export', checkAdmin, (req: Request, res: Response) => {
  const deposits = db.getDeposits();
  const withdrawals = db.getWithdrawals();
  const verifications = db.getVerifications();
  const transactions = db.getTransactions();

  res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalApprovedDeposits: deposits.filter(d => d.status === 'approved').reduce((a, b) => a + b.amount, 0),
      totalApprovedWithdrawals: withdrawals.filter(w => w.status === 'approved' || w.status === 'completed').reduce((a, b) => a + b.amount, 0),
      totalVerificationsCount: verifications.length,
      totalTransactionsCount: transactions.length
    },
    deposits,
    withdrawals,
    verifications,
    transactions
  });
});

// ==========================================
// ADMIN TASK MANAGEMENT & ANALYTICS ENDPOINTS
// ==========================================

app.get('/api/admin/tasks/all', checkAdmin, (req: Request, res: Response) => {
  const tasks = db.getTasks();
  res.json({ tasks });
});

app.post('/api/admin/tasks/save', checkAdmin, (req: Request, res: Response) => {
  const {
    id,
    title,
    description,
    category,
    rewardAmount,
    imageUrl,
    thumbnail,
    sponsorName,
    sponsorLogo,
    durationSeconds,
    startDate,
    expiryDate,
    status,
    priority,
    tags,
    maxUsers,
    maxDailyPerUser,
    visibility,
    targetTier,
    targetRegion,
    campaignName,
    linkUrl,
    videoUrl,
    appName,
    appIcon,
    requiredReferralCount,
    instructions,
    campaignDuration
  } = req.body;

  if (!title || !category || rewardAmount === undefined) {
    res.status(400).json({ error: 'Title, category, and reward amount are required.' });
    return;
  }

  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  if (id) {
    const updated = db.updateTask(id, {
      title,
      description: description || '',
      category,
      rewardAmount: Number(rewardAmount),
      imageUrl,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      sponsorName: sponsorName || 'Sponsor Partner',
      sponsorLogo,
      durationSeconds: Number(durationSeconds || 0),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      expiryDate: expiryDate || '2026-12-31',
      status: (status as TaskStatus) || 'active',
      priority: priority || 'medium',
      tags: tagList,
      maxUsers: Number(maxUsers || 5000),
      maxDailyPerUser: Number(maxDailyPerUser || 1),
      visibility: visibility || 'all',
      targetTier,
      targetRegion,
      campaignName,
      linkUrl,
      videoUrl,
      appName,
      appIcon,
      requiredReferralCount: requiredReferralCount ? Number(requiredReferralCount) : undefined,
      instructions,
      campaignDuration
    });

    db.addAuditLog({
      id: generateId('log'),
      actorId: req.headers['x-user-id'] as string || 'usr_admin',
      actorName: 'Admin',
      action: 'TASK_UPDATE',
      target: id,
      details: `Updated task "${title}" (${category}). Reward: ৳${rewardAmount} BDT, Status: ${status}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Task updated successfully', task: updated });
  } else {
    const newTask: SponsorTask = {
      id: generateId('tsk'),
      title,
      description: description || '',
      category,
      rewardAmount: Number(rewardAmount),
      imageUrl,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      sponsorName: sponsorName || 'Sponsor Partner',
      sponsorLogo,
      durationSeconds: Number(durationSeconds || 0),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      expiryDate: expiryDate || '2026-12-31',
      status: (status as TaskStatus) || 'active',
      priority: priority || 'medium',
      tags: tagList,
      maxUsers: Number(maxUsers || 5000),
      completedUsersCount: 0,
      maxDailyPerUser: Number(maxDailyPerUser || 1),
      visibility: visibility || 'all',
      targetTier,
      targetRegion,
      campaignName,
      linkUrl,
      videoUrl,
      appName,
      appIcon,
      requiredReferralCount: requiredReferralCount ? Number(requiredReferralCount) : undefined,
      instructions,
      campaignDuration
    };

    db.createTask(newTask);

    db.addAuditLog({
      id: generateId('log'),
      actorId: req.headers['x-user-id'] as string || 'usr_admin',
      actorName: 'Admin',
      action: 'TASK_CREATE',
      target: newTask.id,
      details: `Created new ${category} task "${title}". Reward: ৳${rewardAmount} BDT`,
      createdAt: new Date().toISOString()
    });

    // Notify all users about new active task
    if (newTask.status === 'active') {
      db.addNotification({
        id: generateId('ntf'),
        userId: 'all',
        title: 'New Sponsor Task Available! 🎁',
        message: `New task "${title}" by ${newTask.sponsorName} is now live! Complete it to earn +৳${newTask.rewardAmount} BDT.`,
        type: 'task',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ message: 'Task created successfully', task: newTask });
  }
});

app.post('/api/admin/tasks/action', checkAdmin, (req: Request, res: Response) => {
  const { taskId, action, newStatus } = req.body; // action: 'pause' | 'resume' | 'duplicate' | 'delete' | 'status_change'
  const task = db.getTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  if (action === 'pause') {
    task.status = 'paused';
    db.updateTask(task.id, task);
  } else if (action === 'resume') {
    task.status = 'active';
    db.updateTask(task.id, task);
  } else if (action === 'delete') {
    task.status = 'deleted';
    db.updateTask(task.id, task);
  } else if (action === 'duplicate') {
    const dupTask: SponsorTask = {
      ...task,
      id: generateId('tsk'),
      title: `${task.title} (Copy)`,
      completedUsersCount: 0,
      status: 'draft'
    };
    db.createTask(dupTask);

    res.json({ message: 'Task duplicated as draft', task: dupTask });
    return;
  } else if (action === 'status_change' && newStatus) {
    task.status = newStatus;
    db.updateTask(task.id, task);
  }

  db.addAuditLog({
    id: generateId('log'),
    actorId: req.headers['x-user-id'] as string || 'usr_admin',
    actorName: 'Admin',
    action: `TASK_${action.toUpperCase()}`,
    target: taskId,
    details: `Performed action "${action}" on task "${task.title}". Status is now: ${task.status}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Task ${action} action executed successfully.`, task });
});

app.get('/api/admin/tasks/analytics', checkAdmin, (req: Request, res: Response) => {
  const tasks = db.getTasks();
  const completions = db.getTaskCompletions();
  const users = db.getUsers().filter(u => u.role === 'user');

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const pausedTasks = tasks.filter(t => t.status === 'paused').length;
  const expiredTasks = tasks.filter(t => t.status === 'expired').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const totalRewardsIssued = completions
    .filter(c => c.status === 'completed')
    .reduce((acc, c) => acc + c.rewardEarned, 0);

  // Top performing tasks
  const topTasks = [...tasks]
    .sort((a, b) => b.completedUsersCount - a.completedUsersCount)
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      sponsorName: t.sponsorName,
      rewardAmount: t.rewardAmount,
      completedUsersCount: t.completedUsersCount,
      totalDistributed: t.completedUsersCount * t.rewardAmount
    }));

  // Top active users by completed tasks count
  const topUsers = [...users]
    .sort((a, b) => b.completedTasksCount - a.completedTasksCount)
    .slice(0, 5)
    .map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      completedTasksCount: u.completedTasksCount,
      totalEarned: u.wallets.earnedBalance
    }));

  res.json({
    analytics: {
      totalTasks,
      activeTasks,
      pausedTasks,
      expiredTasks,
      completedTasks,
      totalCompletionsCount: completions.length,
      totalRewardsIssued,
      topTasks,
      topUsers
    }
  });
});

app.delete('/api/admin/tasks/:id', checkAdmin, (req: Request, res: Response) => {
  const success = db.deleteTask(req.params.id);
  res.json({ success });
});

// ==========================================
// CONTENT MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/notices', (req: Request, res: Response) => {
  const notices = db.getNotices().filter(n => n.isActive);
  res.json({ notices });
});

app.get('/api/content/banners', (req: Request, res: Response) => {
  const notices = db.getNotices().filter(n => n.isActive);
  res.json({ notices });
});

app.get('/api/admin/content/all', checkAdmin, (req: Request, res: Response) => {
  const notices = db.getNotices();
  res.json({ notices });
});

app.get('/api/admin/notices', checkAdmin, (req: Request, res: Response) => {
  const notices = db.getNotices();
  res.json({ notices });
});

app.post('/api/admin/content/save', checkAdmin, (req: Request, res: Response) => {
  const { id, title, content, imageUrl, sponsorLogoUrl, videoUrl, type, isActive, isPinned, adminName, expiryDate } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  if (id) {
    const updated = db.updateNotice(id, {
      title,
      content,
      imageUrl: imageUrl || '',
      sponsorLogoUrl,
      videoUrl,
      type: type || 'notice',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isPinned: Boolean(isPinned),
      adminName: adminName || 'System Admin',
      expiryDate
    });
    if (updated) {
      res.json({ message: 'Notice updated successfully', notice: updated });
    } else {
      res.status(404).json({ error: 'Notice not found.' });
    }
  } else {
    const newNotice: NoticeBanner = {
      id: generateId('not'),
      title,
      content,
      imageUrl: imageUrl || '',
      sponsorLogoUrl,
      videoUrl,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isPinned: Boolean(isPinned),
      adminName: adminName || 'System Admin',
      type: type || 'notice',
      createdAt: new Date().toISOString(),
      expiryDate
    };
    db.addNotice(newNotice);
    res.json({ message: 'Notice published successfully', notice: newNotice });
  }
});

app.post('/api/admin/content/toggle', checkAdmin, (req: Request, res: Response) => {
  const { noticeId, isActive } = req.body;
  const updated = db.updateNotice(noticeId, { isActive: Boolean(isActive) });

  if (!updated) {
    res.status(404).json({ error: 'Notice not found.' });
    return;
  }

  res.json({ message: `Notice ${updated.isActive ? 'published' : 'unpublished'} successfully.`, notice: updated });
});

app.post('/api/admin/notices/toggle-pin', checkAdmin, (req: Request, res: Response) => {
  const { noticeId, isPinned } = req.body;
  const existingNotices = db.getNotices();
  const targetNotice = existingNotices.find(n => n.id === noticeId);

  if (!targetNotice) {
    res.status(404).json({ error: 'Notice not found.' });
    return;
  }

  const updatedPin = isPinned !== undefined ? Boolean(isPinned) : !targetNotice.isPinned;
  const updated = db.updateNotice(noticeId, { isPinned: updatedPin });

  res.json({ message: `Notice ${updated?.isPinned ? 'pinned to top' : 'unpinned'} successfully.`, notice: updated });
});

app.post('/api/admin/notices/create', checkAdmin, (req: Request, res: Response) => {
  const { title, content, type, imageUrl, isPinned, adminName } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const notice: NoticeBanner = {
    id: generateId('not'),
    title,
    content,
    imageUrl: imageUrl || '',
    isActive: true,
    isPinned: Boolean(isPinned),
    adminName: adminName || 'System Admin',
    type: type || 'notice',
    createdAt: new Date().toISOString()
  };
  db.addNotice(notice);
  res.json({ message: 'Notice published successfully', notice });
});

const handleDeleteNoticeRequest = (req: Request, res: Response) => {
  const targetId = req.params.id || req.body?.noticeId || req.body?.id || (req.query?.id as string) || (req.query?.noticeId as string);
  if (!targetId) {
    res.status(400).json({ error: 'Notice ID is required.' });
    return;
  }

  const success = db.deleteNotice(targetId);
  if (success) {
    db.addAuditLog({
      id: generateId('aud'),
      actorId: (req as any).adminUser?.id || 'usr_admin',
      actorName: (req as any).adminUser?.name || 'System Admin',
      action: 'Delete Notice',
      module: 'Content Management',
      target: targetId,
      details: `Deleted notice ${targetId}`,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Notice deleted successfully.', deletedId: targetId });
  } else {
    res.status(404).json({ error: 'Notice not found or already deleted.' });
  }
};

app.post('/api/admin/notices/delete', checkAdmin, handleDeleteNoticeRequest);
app.delete('/api/admin/notices/delete', checkAdmin, handleDeleteNoticeRequest);
app.delete('/api/admin/notices/:id', checkAdmin, handleDeleteNoticeRequest);
app.delete('/api/admin/content/:id', checkAdmin, handleDeleteNoticeRequest);

// ==========================================
// SUBSCRIPTION & PLAN MANAGEMENT ROUTES (PART 8)
// ==========================================

// Public / User Get Active Subscription Plans
app.get('/api/plans/all', (req: Request, res: Response) => {
  const plans = db.getSubscriptionPlans().filter(p => p.status === 'Active' || p.status === 'Published');
  res.json({ plans });
});

// Admin Get All Subscription Plans & Analytics
app.get('/api/admin/plans/all', checkAdmin, (req: Request, res: Response) => {
  const plans = db.getSubscriptionPlans();
  const history = db.getPlanHistory();
  const upgradeRequests = db.getPlanUpgradeRequests();
  const users = db.getUsers();

  // Compute Analytics
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === 'Active').length;
  const usersPerPlan: Record<string, number> = {};
  users.forEach(u => {
    const tier = u.tierStatus || 'Unverified';
    usersPerPlan[tier] = (usersPerPlan[tier] || 0) + 1;
  });

  // Find most popular plan
  let mostPopularPlan = 'Bronze Plan';
  let maxCount = -1;
  Object.entries(usersPerPlan).forEach(([plan, count]) => {
    if (count > maxCount && plan !== 'None' && plan !== 'Unverified') {
      maxCount = count;
      mostPopularPlan = `${plan} Tier`;
    }
  });

  res.json({
    plans,
    history,
    upgradeRequests,
    analytics: {
      totalPlans,
      activePlans,
      usersPerPlan,
      mostPopularPlan,
      totalUsersCount: users.length
    }
  });
});

// Admin Save Plan (Create or Update)
app.post('/api/admin/plans/save', checkAdmin, (req: Request, res: Response) => {
  const planData: SubscriptionPlan = req.body;
  if (!planData.name || !planData.tierName || planData.refundableSecurityDeposit === undefined) {
    res.status(400).json({ error: 'Plan name, tier name, and deposit amount are required.' });
    return;
  }

  const existing = db.getPlanById(planData.id);
  const now = new Date().toISOString();

  let saved: SubscriptionPlan;
  if (existing) {
    saved = db.savePlan({
      ...existing,
      ...planData,
      lastUpdated: now
    });

    db.addPlanHistory({
      id: generateId('plh'),
      planId: saved.id,
      planName: saved.name,
      action: 'Updated',
      performedBy: 'Admin',
      details: `Plan details and limits updated for ${saved.name}`,
      timestamp: now
    });

    db.addAuditLog({
      id: generateId('aud'),
      actorId: 'usr_admin',
      actorName: 'System Admin',
      action: 'Plan Updated',
      target: saved.name,
      details: `Updated plan limits (Deposit: ৳${saved.refundableSecurityDeposit}, Task limit: ${saved.dailyTaskLimit})`,
      createdAt: now
    });

    res.json({ message: `Plan "${saved.name}" updated successfully.`, plan: saved });
  } else {
    saved = db.savePlan({
      ...planData,
      id: planData.id || generateId('plan'),
      publishDate: now,
      lastUpdated: now,
      status: planData.status || 'Active',
      displayOrder: planData.displayOrder || (db.getSubscriptionPlans().length + 1)
    });

    db.addPlanHistory({
      id: generateId('plh'),
      planId: saved.id,
      planName: saved.name,
      action: 'Created',
      performedBy: 'Admin',
      details: `New plan created: ${saved.name}`,
      timestamp: now
    });

    db.addAuditLog({
      id: generateId('aud'),
      actorId: 'usr_admin',
      actorName: 'System Admin',
      action: 'Plan Created',
      target: saved.name,
      details: `Created new plan with deposit requirement ৳${saved.refundableSecurityDeposit}`,
      createdAt: now
    });

    // Notify all users about new plan if published/active
    if (saved.status === 'Active' || saved.status === 'Published') {
      db.addNotification({
        id: generateId('notif'),
        userId: 'all',
        title: `🚀 New Earning Plan Available: ${saved.name}`,
        message: `${saved.shortDescription} - Deposit ৳${saved.refundableSecurityDeposit} BDT for ৳${saved.maxSingleWithdrawal} BDT withdrawal limits!`,
        type: 'announcement',
        isRead: false,
        createdAt: now
      });
    }

    res.json({ message: `Plan "${saved.name}" created successfully.`, plan: saved });
  }
});

// Admin Duplicate Plan
app.post('/api/admin/plans/duplicate', checkAdmin, (req: Request, res: Response) => {
  const { planId } = req.body;
  const original = db.getPlanById(planId);
  if (!original) {
    res.status(404).json({ error: 'Original plan not found.' });
    return;
  }

  const now = new Date().toISOString();
  const duplicated: SubscriptionPlan = {
    ...original,
    id: generateId('plan'),
    name: `${original.name} (Copy)`,
    tierName: `${original.tierName}_Copy`,
    status: 'Draft',
    publishDate: now,
    lastUpdated: now,
    displayOrder: db.getSubscriptionPlans().length + 1
  };

  db.savePlan(duplicated);

  db.addPlanHistory({
    id: generateId('plh'),
    planId: duplicated.id,
    planName: duplicated.name,
    action: 'Duplicated',
    performedBy: 'Admin',
    details: `Duplicated from ${original.name}`,
    timestamp: now
  });

  res.json({ message: `Plan duplicated as "${duplicated.name}".`, plan: duplicated });
});

// Admin Delete / Archive Plan
app.post('/api/admin/plans/delete', checkAdmin, (req: Request, res: Response) => {
  const { planId } = req.body;
  const target = db.getPlanById(planId);
  if (!target) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }

  db.deletePlan(planId);
  const now = new Date().toISOString();

  db.addPlanHistory({
    id: generateId('plh'),
    planId,
    planName: target.name,
    action: 'Archived',
    performedBy: 'Admin',
    details: `Plan deleted/archived: ${target.name}`,
    timestamp: now
  });

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'System Admin',
    action: 'Plan Deleted',
    target: target.name,
    details: `Deleted plan ID ${planId}`,
    createdAt: now
  });

  res.json({ message: `Plan "${target.name}" deleted successfully.` });
});

// Admin Change Plan Status
app.post('/api/admin/plans/status', checkAdmin, (req: Request, res: Response) => {
  const { planId, status } = req.body;
  const plan = db.getPlanById(planId);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }

  const oldStatus = plan.status;
  plan.status = status;
  plan.lastUpdated = new Date().toISOString();
  db.savePlan(plan);

  const now = new Date().toISOString();
  db.addPlanHistory({
    id: generateId('plh'),
    planId,
    planName: plan.name,
    action: status === 'Active' ? 'Activated' : status === 'Inactive' ? 'Deactivated' : 'Updated',
    performedBy: 'Admin',
    details: `Status changed from ${oldStatus} to ${status}`,
    timestamp: now
  });

  res.json({ message: `Plan "${plan.name}" status updated to ${status}.`, plan });
});

// User Plan Upgrade Request Route
app.post('/api/plans/upgrade-request', (req: Request, res: Response) => {
  const { userId, targetPlanId, walletType } = req.body;

  // Rule 9: Prevent attempts to use Earned Wallet or Bonus Wallet for Tier Activation or Tier Upgrade
  if (walletType && walletType !== 'deposit') {
    res.status(400).json({
      error: 'Invalid wallet selection. Tier Activation and Tier Upgrade requests must use ONLY the Deposit Wallet balance. Earned Wallet and Bonus Wallet CANNOT be used.'
    });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Blocked') {
    res.status(403).json({ error: 'Account is suspended or blocked.' });
    return;
  }

  // Check if user has an existing active pending request
  const existingVers = db.getVerifications(user.id).filter(v => v.status === 'pending' || v.status === 'under_review');
  if (existingVers.length > 0) {
    res.status(400).json({ error: 'You already have an active Tier Activation / Upgrade request under review. Please wait for admin approval.' });
    return;
  }

  const targetPlan = db.getPlanById(targetPlanId);
  if (!targetPlan) {
    res.status(404).json({ error: 'Requested subscription plan not found.' });
    return;
  }

  const requiredDeposit = targetPlan.refundableSecurityDeposit;

  // Rule 1, 2, 3, 4 & 5: Validate ONLY Deposit Wallet balance
  if (user.wallets.depositBalance < requiredDeposit) {
    res.status(400).json({
      error: `Insufficient Deposit Wallet balance. Required deposit is ৳${requiredDeposit} BDT, but you have ৳${user.wallets.depositBalance} BDT in your Deposit Wallet. Earned Wallet and Bonus Wallet CANNOT be used for Tier Activation or Tier Upgrade. Please top up your Deposit Wallet first.`
    });
    return;
  }

  const now = new Date().toISOString();

  // Rule 6: Lock required deposit from Deposit Wallet into Security Wallet
  user.wallets.depositBalance -= requiredDeposit;
  user.wallets.securityBalance += requiredDeposit;
  user.verificationStatus = 'Pending';

  db.saveUser(user);

  // Record Wallet Transactions
  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'deposit',
    amount: requiredDeposit,
    type: 'debit',
    title: `Plan Upgrade Security Lock (${targetPlan.name})`,
    description: `Locked refundable security deposit from Deposit Wallet for upgrading to ${targetPlan.name} tier`,
    txId: generateId('SECLOCK'),
    createdAt: now
  });

  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: 'security',
    amount: requiredDeposit,
    type: 'credit',
    title: `Plan Upgrade Security Deposit (${targetPlan.name})`,
    description: `Locked refundable security deposit for upgrading to ${targetPlan.name} tier`,
    txId: generateId('SEC'),
    createdAt: now
  });

  // Rule 6: Create verification / tier upgrade request for Admin Approval
  const vReq: VerificationRequest = {
    id: generateId('ver'),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    targetTier: targetPlan.tierName as TierLevel,
    requiredDeposit: requiredDeposit,
    status: 'pending',
    createdAt: now,
    nidOrPassport: 'Plan Upgrade Request',
    documentPhotoUrl: targetPlan.planImage || ''
  };

  db.createVerification(vReq);

  // System Notification
  db.addNotification({
    id: generateId('notif'),
    userId: user.id,
    title: `⏳ Plan Upgrade Request Submitted (${targetPlan.name})`,
    message: `Your request to upgrade to ${targetPlan.name} has been submitted to Admin. ৳${requiredDeposit} BDT locked from Deposit Wallet into Security Wallet. Awaiting Admin approval.`,
    type: 'verification',
    isRead: false,
    createdAt: now
  });

  db.addAuditLog({
    id: generateId('aud'),
    actorId: user.id,
    actorName: user.name,
    action: 'Plan Upgrade Request Submitted',
    target: targetPlan.name,
    details: `Submitted upgrade request for ${targetPlan.name} with deposit ৳${requiredDeposit} BDT from Deposit Wallet. Pending Admin approval.`,
    createdAt: now
  });

  res.json({
    message: `Successfully submitted request for ${targetPlan.name}! ৳${requiredDeposit} BDT locked from Deposit Wallet. Request sent to Admin for review and approval.`,
    user
  });
});

// ==========================================
// PART 9: ENTERPRISE ADMIN API ENDPOINTS
// ==========================================

// Maintenance Mode Public Check
app.get('/api/settings/public', (req: Request, res: Response) => {
  const settings = db.getSystemSettings();
  res.json({
    appName: settings.appName,
    appLogo: settings.appLogo,
    themeColor: settings.themeColor,
    language: settings.language,
    maintenanceMode: settings.maintenanceMode,
    allowNewRegistrations: settings.allowNewRegistrations,
    defaultSignupBonus: settings.defaultSignupBonus,
    supportWhatsApp: settings.supportWhatsApp,
    supportTelegram: settings.supportTelegram,
    supportEmail: settings.supportEmail
  });
});

// Admin Authentication & Password Reset
app.post('/api/admin/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  // Simulated Admin Users / Roles
  const adminRole = role || 'Super Admin';
  const adminUser = {
    id: 'usr_admin',
    name: 'Master Enterprise Admin',
    email: email || 'admin@advibe.com',
    role: adminRole,
    permissions: [
      'manage_users',
      'manage_wallets',
      'manage_deposits',
      'manage_withdrawals',
      'manage_tasks',
      'manage_plans',
      'manage_notices',
      'manage_broadcasts',
      'manage_settings',
      'manage_backups',
      'view_audit'
    ],
    lastLogin: new Date().toISOString()
  };

  db.addAuditLog({
    id: generateId('aud'),
    actorId: adminUser.id,
    actorName: adminUser.name,
    action: 'Admin Login Successful',
    module: 'Authentication',
    target: adminUser.email,
    details: `Admin logged in with role: ${adminRole}`,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Admin authentication successful.', adminUser });
});

app.post('/api/admin/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const now = new Date().toISOString();
  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin System',
    action: 'Admin Password Reset Requested',
    module: 'Authentication',
    target: email,
    details: `Password reset link sent to admin email ${email}`,
    createdAt: now
  });

  res.json({ message: `Password reset instructions sent to ${email}` });
});

// Admin Wallet Adjustment (Credit / Debit / Balance Freeze)
app.post('/api/admin/wallet/adjust', checkAdmin, (req: Request, res: Response) => {
  const { userId, walletType, amount, action, reason } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (!reason || reason.trim().length < 3) {
    res.status(400).json({ error: 'Adjustment reason is required.' });
    return;
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Valid positive amount is required.' });
    return;
  }

  const validWallets = ['earnedBalance', 'depositBalance', 'bonusBalance', 'securityBalance'];
  const targetWalletKey = walletType === 'earned' ? 'earnedBalance' : walletType === 'deposit' ? 'depositBalance' : walletType === 'bonus' ? 'bonusBalance' : walletType === 'security' ? 'securityBalance' : 'earnedBalance';

  if (action === 'credit') {
    user.wallets[targetWalletKey] += numAmount;
  } else if (action === 'debit') {
    if (user.wallets[targetWalletKey] < numAmount) {
      res.status(400).json({ error: `Insufficient ${targetWalletKey} balance. User only has ৳${user.wallets[targetWalletKey]}.` });
      return;
    }
    user.wallets[targetWalletKey] -= numAmount;
  }

  db.saveUser(user);
  const now = new Date().toISOString();

  db.addTransaction({
    id: generateId('tx'),
    userId: user.id,
    walletType: walletType as any,
    amount: numAmount,
    type: action === 'credit' ? 'credit' : 'debit',
    title: `Admin Wallet Adjustment (${action.toUpperCase()})`,
    description: `Reason: ${reason}`,
    txId: generateId('ADJ'),
    createdAt: now
  });

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin',
    action: `Wallet ${action.toUpperCase()}`,
    module: 'Wallet Management',
    target: user.name,
    details: `${action.toUpperCase()} ৳${numAmount} BDT to ${walletType} wallet. Reason: ${reason}`,
    createdAt: now
  });

  res.json({ message: `Successfully adjusted ${user.name}'s ${walletType} wallet by ৳${numAmount} BDT.`, user });
});

app.post('/api/admin/wallet/freeze', checkAdmin, (req: Request, res: Response) => {
  const { userId, freeze } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  user.status = freeze ? 'Suspended' : 'Active';
  db.saveUser(user);

  const now = new Date().toISOString();
  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin',
    action: freeze ? 'Wallet/Account Frozen' : 'Wallet/Account Unfrozen',
    module: 'Wallet Management',
    target: user.name,
    details: freeze ? `Frozen account/wallet for user ${user.name}` : `Unfrozen account/wallet for user ${user.name}`,
    createdAt: now
  });

  res.json({ message: `User ${user.name} wallet & account status set to ${user.status}.`, user });
});

// Admin System Settings Management
app.get('/api/admin/settings/get', checkAdmin, (req: Request, res: Response) => {
  const settings = db.getSystemSettings();
  res.json({ settings });
});

app.post('/api/admin/settings/update', checkAdmin, (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!settings) {
    res.status(400).json({ error: 'Settings object is required.' });
    return;
  }

  const updated = db.updateSystemSettings(settings);
  const now = new Date().toISOString();

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Super Admin',
    action: 'System Settings Updated',
    module: 'System Settings',
    target: 'Global System Config',
    details: `Updated app settings. Maintenance mode: ${updated.maintenanceMode ? 'ENABLED' : 'DISABLED'}`,
    createdAt: now
  });

  res.json({ message: 'System settings updated successfully.', settings: updated });
});

// Admin Broadcast Notification Management
app.get('/api/admin/broadcast/all', checkAdmin, (req: Request, res: Response) => {
  res.json({ broadcasts: db.getBroadcasts() });
});

app.post('/api/admin/broadcast/send', checkAdmin, (req: Request, res: Response) => {
  const { title, message, targetGroup, targetUserIds } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required.' });
    return;
  }

  const now = new Date().toISOString();
  const users = db.getUsers();
  let recipientUsers = users;

  if (targetGroup === 'verified_only') {
    recipientUsers = users.filter(u => u.verificationStatus === 'Verified');
  } else if (targetGroup === 'unverified_only') {
    recipientUsers = users.filter(u => u.verificationStatus !== 'Verified');
  } else if (targetGroup === 'tier_vip') {
    recipientUsers = users.filter(u => u.tierStatus === 'VIP');
  } else if (targetGroup === 'custom_users' && targetUserIds && targetUserIds.length > 0) {
    recipientUsers = users.filter(u => targetUserIds.includes(u.id));
  }

  // Create notifications for targeted users
  recipientUsers.forEach(u => {
    db.addNotification({
      id: generateId('notif'),
      userId: u.id,
      title: title,
      message: message,
      type: 'announcement',
      isRead: false,
      createdAt: now
    });
  });

  const broadcastRecord = db.addBroadcast({
    id: generateId('bc'),
    title,
    message,
    targetGroup: targetGroup || 'all',
    targetUserIds,
    sentAt: now,
    status: 'sent',
    recipientCount: recipientUsers.length,
    createdAt: now
  });

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin',
    action: 'Broadcast Push Notification Sent',
    module: 'Notification Management',
    target: targetGroup || 'All Users',
    details: `Sent broadcast message to ${recipientUsers.length} users. Title: "${title}"`,
    createdAt: now
  });

  res.json({ message: `Broadcast successfully delivered to ${recipientUsers.length} users.`, broadcast: broadcastRecord });
});

app.post('/api/admin/broadcast/delete', checkAdmin, (req: Request, res: Response) => {
  const { broadcastId, id } = req.body;
  const targetId = broadcastId || id;
  if (!targetId) {
    res.status(400).json({ error: 'Broadcast ID is required.' });
    return;
  }
  const deleted = db.deleteBroadcast(targetId);
  if (deleted) {
    res.json({ message: 'Broadcast record deleted successfully.' });
  } else {
    res.status(404).json({ error: 'Broadcast record not found.' });
  }
});

// Admin Backup & Restore Management
app.get('/api/admin/backup/all', checkAdmin, (req: Request, res: Response) => {
  res.json({ backups: db.getBackups() });
});

app.post('/api/admin/backup/create', checkAdmin, (req: Request, res: Response) => {
  const { name, type } = req.body;
  const snapshot = db.createBackup(name, type || 'full');
  const now = new Date().toISOString();

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin',
    action: 'Database Snapshot Created',
    module: 'Backup & Restore',
    target: snapshot.snapshotName,
    details: `Created snapshot ID ${snapshot.id}, size: ${(snapshot.sizeBytes / 1024).toFixed(1)} KB`,
    createdAt: now
  });

  res.json({ message: `Backup snapshot "${snapshot.snapshotName}" created successfully.`, snapshot });
});

app.post('/api/admin/backup/restore', checkAdmin, (req: Request, res: Response) => {
  const { backupId } = req.body;
  const success = db.restoreBackup(backupId);
  if (!success) {
    res.status(400).json({ error: 'Failed to restore backup snapshot.' });
    return;
  }

  const now = new Date().toISOString();
  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Super Admin',
    action: 'System Database Restored',
    module: 'Backup & Restore',
    target: backupId,
    details: `Restored database state from backup snapshot ${backupId}`,
    createdAt: now
  });

  res.json({ message: 'Database state successfully restored from snapshot.' });
});

app.post('/api/admin/backup/delete', checkAdmin, (req: Request, res: Response) => {
  const { backupId } = req.body;
  db.deleteBackup(backupId);
  res.json({ message: 'Backup snapshot deleted successfully.' });
});

// Admin Reports Export Generator
app.post('/api/admin/reports/generate', checkAdmin, (req: Request, res: Response) => {
  const { reportType, format, dateRange } = req.body;
  
  let reportTitle = 'Enterprise System Report';
  let dataRows: any[] = [];

  if (reportType === 'user') {
    reportTitle = 'User Management & Status Report';
    dataRows = db.getUsers().map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Phone: u.phone,
      Status: u.status,
      Tier: u.tierStatus,
      Verification: u.verificationStatus,
      DepositBalance: u.wallets.depositBalance,
      EarnedBalance: u.wallets.earnedBalance,
      TotalEarnings: u.totalEarnings,
      RegDate: u.registrationDate
    }));
  } else if (reportType === 'deposit') {
    reportTitle = 'Deposit Transactions Report';
    dataRows = db.getDeposits().map(d => ({
      ID: d.id,
      User: d.userName,
      Phone: d.userPhone,
      Amount: d.amount,
      Method: d.method,
      TxID: d.transactionId,
      Status: d.status,
      CreatedAt: d.createdAt
    }));
  } else if (reportType === 'withdrawal') {
    reportTitle = 'Withdrawal Transactions Report';
    dataRows = db.getWithdrawals().map(w => ({
      ID: w.id,
      User: w.userName,
      Phone: w.userPhone,
      Tier: w.userTier,
      Amount: w.amount,
      Method: w.method,
      Account: w.accountNumber,
      Status: w.status,
      CreatedAt: w.createdAt
    }));
  } else if (reportType === 'task') {
    reportTitle = 'Sponsor Task Analytics Report';
    dataRows = db.getTasks().map(t => ({
      ID: t.id,
      Title: t.title,
      Category: t.category,
      Sponsor: t.sponsorName,
      RewardAmount: t.rewardAmount,
      CompletedCount: t.completedUsersCount,
      MaxUsers: t.maxUsers,
      Status: t.status
    }));
  } else if (reportType === 'plan') {
    reportTitle = 'Subscription Plans & Tier Report';
    dataRows = db.getSubscriptionPlans().map(p => ({
      ID: p.id,
      PlanName: p.name,
      Tier: p.tierName,
      Deposit: p.refundableSecurityDeposit,
      DailyTaskLimit: p.dailyTaskLimit,
      DailyEarningLimit: p.dailyEarningLimit,
      SingleWithdrawalMax: p.maxSingleWithdrawal,
      Status: p.status
    }));
  } else {
    reportTitle = 'System Audit & Activity Report';
    dataRows = db.getAuditLogs().map(a => ({
      ID: a.id,
      Actor: a.actorName,
      Action: a.action,
      Target: a.target,
      Details: a.details,
      CreatedAt: a.createdAt
    }));
  }

  db.addAuditLog({
    id: generateId('aud'),
    actorId: 'usr_admin',
    actorName: 'Admin',
    action: `Report Generated (${reportType.toUpperCase()})`,
    module: 'Reports & Analytics',
    target: reportTitle,
    details: `Generated ${format || 'CSV'} report with ${dataRows.length} rows`,
    createdAt: new Date().toISOString()
  });

  res.json({
    reportTitle,
    generatedAt: new Date().toISOString(),
    recordCount: dataRows.length,
    data: dataRows
  });
});

// Vite Integration Middleware / Static Production Serving
async function startServer() {
  // Ensure unhandled /api requests return a 404 JSON response instead of HTML SPA fallback
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ success: false, error: `API endpoint not found: ${req.originalUrl}` });
  });

  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sponsor Earning Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
