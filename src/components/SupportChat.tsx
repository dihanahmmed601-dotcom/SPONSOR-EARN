import React, { useState } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile } from '../types';
import {
  Bot,
  User,
  Sparkles,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  SendHorizontal,
  LifeBuoy,
  Search,
  Paperclip,
  Clock,
  AlertCircle,
  Globe,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Bell,
  Check,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface SupportChatProps {
  user: UserProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  category?: string;
}

interface TicketThreadMessage {
  id: string;
  senderName: string;
  senderRole: 'user' | 'support' | 'system';
  text: string;
  attachmentUrl?: string;
  timestamp: string;
}

interface TicketItem {
  id: string;
  ticketNo: string;
  category: string;
  subject: string;
  status: 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  updatedAt: string;
  messages: TicketThreadMessage[];
}

interface FaqItem {
  id: string;
  category: 'Wallet' | 'Deposit' | 'Withdrawal' | 'Verification' | 'Tasks' | 'General';
  question: string;
  answer: string;
}

export const SupportChat: React.FC<SupportChatProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'tickets' | 'faq' | 'telegram'>('ai');
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');

  // Conversation session metadata
  const [conversationId] = useState<string>(() => `CONV-${Math.floor(100000 + Math.random() * 900000)}`);

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your AI Support Assistant powered by Gemini. Ask me about your 4 separate wallets, bKash/Nagad deposits, NID verification, task rewards, or membership plans!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'General'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiCategory, setAiCategory] = useState<string>('General');

  // Customer Support Tickets State
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 't-101',
      ticketNo: 'TK-88391',
      category: 'Deposit',
      subject: 'bKash Deposit TxID Pending Approval',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-07-30 14:20',
      updatedAt: '2026-07-30 15:45',
      messages: [
        {
          id: 'tm-1',
          senderName: user.name,
          senderRole: 'user',
          text: 'Submitted bKash deposit of ৳1,000 with TxID 9J4K2L8P. Please verify.',
          timestamp: '2026-07-30 14:20'
        },
        {
          id: 'tm-2',
          senderName: 'Senior Financial Support Officer',
          senderRole: 'support',
          text: 'Your TxID 9J4K2L8P is currently being reconciled with bKash Merchant Gateway logs. Funds will reflect in your Deposit Wallet shortly.',
          timestamp: '2026-07-30 15:45'
        }
      ]
    }
  ]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Deposit');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketAttachment, setTicketAttachment] = useState<string>('');
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [createTicketSuccess, setCreateTicketSuccess] = useState(false);

  // FAQ System State
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'Wallet',
      question: 'How do the 4 separate wallets work in Sponsor Earn?',
      answer: 'Your account features 4 distinct balances:\n1. Earned Wallet: Real task rewards available for withdrawal.\n2. Deposit Wallet: Funds added via bKash/Nagad/USDT used for plan upgrades.\n3. Bonus Wallet: Promotional rewards earned via referrals and daily streaks.\n4. Security Wallet: Refundable security deposit holding your membership tier warranty.'
    },
    {
      id: 'faq-2',
      category: 'Deposit',
      question: 'How long does bKash / Nagad deposit verification take?',
      answer: 'Instant automated deposits complete within 1-3 minutes. Manual TxID checks complete within 15 minutes during business hours (9 AM - 11 PM).'
    },
    {
      id: 'faq-3',
      category: 'Withdrawal',
      question: 'Is the Security Deposit 100% refundable upon withdrawal?',
      answer: 'Yes! Your Security Deposit is 100% refundable once your active membership tenure completes or upon requesting tier downgrade in accordance with security terms.'
    },
    {
      id: 'faq-4',
      category: 'Verification',
      question: 'Why is NID Level 2 verification required before withdrawing?',
      answer: 'NID Level 2 verification prevents duplicate fake accounts, secures multi-wallet transactions, and ensures full compliance with Bangladesh financial technology guidelines.'
    },
    {
      id: 'faq-5',
      category: 'Tasks',
      question: 'How do daily task limits work for each membership tier?',
      answer: 'Bronze Earner (Free): 5 tasks/day.\nGold Earner (৳1,000 Deposit): 15 tasks/day.\nPlatinum VIP (৳5,000 Deposit): 50 tasks/day.'
    }
  ];

  const categoryPrompts = [
    { label: 'Deposit Help', cat: 'Deposit', query: 'How do I deposit funds via bKash or Nagad?' },
    { label: 'Wallet Balances', cat: 'Wallet', query: 'Explain my Earned, Deposit, Bonus, and Security wallets.' },
    { label: 'Withdrawal Rules', cat: 'Withdrawal', query: 'What are the withdrawal rules and minimum limits?' },
    { label: 'NID Verification', cat: 'Verification', query: 'How do I complete NID Level 2 verification?' },
    { label: 'Membership Plans', cat: 'Plans', query: 'What benefits do Gold and Platinum tiers provide?' }
  ];

  const handleSendMessage = async (customText?: string) => {
    const query = customText || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: aiCategory
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoadingAi(true);

    try {
      const res = await safeFetchJson('/api/support/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: query,
          language,
          userContext: {
            name: user.name,
            email: user.email,
            tier: user.tierStatus,
            verification: user.verificationStatus,
            earnedBalance: user.earnedBalance,
            depositBalance: user.depositBalance
          }
        })
      });

      const replyText = res.ok && res.data?.reply ? res.data.reply : getAiFallbackResponse(query);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: aiCategory
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: getAiFallbackResponse(query),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: aiCategory
        }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  const getAiFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('deposit') || q.includes('bkash') || q.includes('nagad')) {
      return `To deposit funds:\n1. Go to the Deposit screen.\n2. Select bKash, Nagad, Rocket, or USDT.\n3. Send your deposit to our merchant number (e.g., 01711223344).\n4. Enter your TxID and submit proof.\n5. Verification completes within 1-5 minutes.`;
    }
    if (q.includes('wallet') || q.includes('earned') || q.includes('security')) {
      return `Your 4 wallets serve specific purposes:\n- Earned Wallet: Task earnings (withdrawable).\n- Deposit Wallet: Added funds for plan upgrades.\n- Bonus Wallet: Promotional rewards.\n- Security Wallet: Tier deposit holding (100% refundable).`;
    }
    if (q.includes('withdraw') || q.includes('payout')) {
      return `Withdrawal steps:\n- Ensure NID Level 2 verification is active.\n- Minimum withdrawal limit is ৳100.\n- Processed directly to your personal bKash/Nagad account within minutes.`;
    }
    return `Thank you for contacting Sponsor Earn 24/7 AI Support! If you require human agent assistance, you can escalate this conversation by clicking "Open Support Ticket".`;
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;

    const newTicket: TicketItem = {
      id: `t-${Date.now()}`,
      ticketNo: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      category: ticketCategory,
      subject: ticketSubject,
      status: 'Open',
      priority: ticketPriority,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [
        {
          id: `tm-${Date.now()}`,
          senderName: user.name,
          senderRole: 'user',
          text: ticketDescription,
          attachmentUrl: ticketAttachment || undefined,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setCreateTicketSuccess(true);
    setTicketSubject('');
    setTicketDescription('');
    setTicketAttachment('');
    setTimeout(() => setCreateTicketSuccess(false), 4000);
  };

  const handleAddReplyToTicket = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const replyMsg: TicketThreadMessage = {
      id: `tm-${Date.now()}`,
      senderName: user.name,
      senderRole: 'user',
      text: ticketReplyText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedTicket: TicketItem = {
      ...selectedTicket,
      status: 'Pending',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [...selectedTicket.messages, replyMsg]
    };

    setTickets(prev => prev.map(t => (t.id === selectedTicket.id ? updatedTicket : t)));
    setSelectedTicket(updatedTicket);
    setTicketReplyText('');
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faqCategoryFilter === 'All' || faq.category === faqCategoryFilter;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>24/7 AI Customer Support & Help Desk</span>
            </div>
            <h2 className="text-2xl font-black text-white">AI Support & Knowledge Hub</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Natural language 24/7 AI chatbot assistance, human helpdesk ticketing with status tracking, Telegram bot alerts, and comprehensive FAQ guidelines.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                language === 'EN' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              English (EN)
            </button>
            <button
              onClick={() => setLanguage('BN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                language === 'BN' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা (BN)
            </button>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 max-w-xl mt-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Chatbot</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tickets' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Tickets ({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'faq' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Smart FAQ</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'telegram' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 text-blue-400" />
            <span>Telegram Bot</span>
          </button>
        </div>
      </div>

      {/* 1. AI CHATBOT TAB */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          {/* Conversation Bar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white">AI Assistant Online</span>
              <span className="text-[10px] text-slate-500 font-mono">Session ID: {conversationId}</span>
            </div>
            <button
              onClick={() => setActiveTab('tickets')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Escalate to Human Ticket</span>
            </button>
          </div>

          {/* Prompt Suggestion Pills */}
          <div className="flex flex-wrap gap-2">
            {categoryPrompts.map((cp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiCategory(cp.cat);
                  handleSendMessage(cp.query);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{cp.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-[400px] overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-400 text-slate-950 font-bold rounded-tr-none shadow-md'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/50 text-[9px]">
                    <span className={msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}>
                      Category: {msg.category || 'General'}
                    </span>
                    <span className={msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}>
                      {msg.time}
                    </span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center shrink-0 border border-slate-700">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}

            {loadingAi && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Support Engine is processing natural language context...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={language === 'EN' ? "Type your question about wallets, deposits, or tasks..." : "আপনার প্রশ্নটি বাংলায় লিখুন..."}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loadingAi || !inputMessage.trim()}
              className="px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-amber-400/20"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. CUSTOMER SUPPORT TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ticket List & Create Form */}
          <div className="lg:col-span-5 space-y-4">
            {/* Create Ticket Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                <span>Open New Support Ticket</span>
              </h3>

              {createTicketSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ticket created successfully! Staff will respond shortly.</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  >
                    <option value="Deposit">Deposit Request / TxID</option>
                    <option value="Withdrawal">Withdrawal Delay</option>
                    <option value="Verification">NID / Level 2 Verification</option>
                    <option value="Tasks">Task Reward Issue</option>
                    <option value="Account">Account / Password Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deposit TxID 9J4K2L8P Pending"
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
                    <select
                      value={ticketPriority}
                      onChange={e => setTicketPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Screenshot URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={ticketAttachment}
                      onChange={e => setTicketAttachment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Detailed Explanation</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide exact payment reference, dates, or error details..."
                    value={ticketDescription}
                    onChange={e => setTicketDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>

            {/* Ticket List Cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Ticket History</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedTicket?.id === t.id
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold mb-1">
                      <span className="text-amber-400">{t.ticketNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          t.status === 'Open'
                            ? 'bg-blue-500/20 text-blue-400'
                            : t.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="font-bold line-clamp-1">{t.subject}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>Category: {t.category}</span>
                      <span>{t.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Ticket Conversation View */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-amber-400">{selectedTicket.ticketNo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                        selectedTicket.status === 'Open'
                          ? 'bg-blue-500/20 text-blue-400'
                          : selectedTicket.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-[350px] overflow-y-auto space-y-3 text-xs">
                  {selectedTicket.messages.map(m => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border ${
                        m.senderRole === 'user'
                          ? 'bg-amber-500/10 border-amber-500/30 ml-6 text-white'
                          : 'bg-slate-900 border-slate-800 mr-6 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold mb-1">
                        <span className={m.senderRole === 'user' ? 'text-amber-300' : 'text-purple-400'}>
                          {m.senderName} ({m.senderRole.toUpperCase()})
                        </span>
                        <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.attachmentUrl && (
                        <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-[10px] text-amber-400">
                          <Paperclip className="w-3.5 h-3.5" />
                          <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="underline font-mono">
                            View Attached Screenshot
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply message..."
                    value={ticketReplyText}
                    onChange={e => setTicketReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleAddReplyToTicket}
                    className="px-5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                Select a support ticket from the list to view conversation history and staff responses.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SMART FAQ TAB */}
      {activeTab === 'faq' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs by keywords (e.g. bKash, security deposit, NID)..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {['All', 'Wallet', 'Deposit', 'Withdrawal', 'Verification', 'Tasks'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    faqCategoryFilter === cat
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.map(faq => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-white hover:text-amber-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px]">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-900 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TELEGRAM BOT INTEGRATION TAB */}
      {activeTab === 'telegram' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Telegram Customer Support Bot</h3>
                <p className="text-xs text-slate-400">Receive instant deposit approvals, withdrawal alerts & 24/7 support via Telegram.</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bot Webhook Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-amber-400">Deposit & Payment Alerts</h4>
              <p className="text-slate-400 text-[11px]">Instant notifications sent when your bKash or Nagad deposit TxID is verified.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-400">Withdrawal Confirmation</h4>
              <p className="text-slate-400 text-[11px]">Receive real-time updates when payout transfers to your mobile account.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-purple-400">Official Channel Broadcasts</h4>
              <p className="text-slate-400 text-[11px]">Stay updated on new sponsor task releases and daily bonus campaigns.</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Official Support Bot Handle</p>
              <p className="text-xs text-blue-400 font-mono">@SponsorEarnOfficialBot</p>
            </div>

            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Connect Telegram Bot</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

