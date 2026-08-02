import React, { useState } from 'react';
import { NoticeBanner } from '../types';
import { 
  X, 
  Megaphone, 
  Pin, 
  Calendar, 
  User, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Bell,
  Sparkles,
  Layers,
  ExternalLink
} from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: NoticeBanner[];
  initialNoticeId?: string | null;
  initialMode?: 'detail' | 'list';
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  notices,
  initialNoticeId = null,
  initialMode = 'detail'
}) => {
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(
    initialNoticeId || (notices.length > 0 ? notices[0].id : null)
  );
  const [viewMode, setViewMode] = useState<'detail' | 'list'>(
    initialMode || (initialNoticeId ? 'detail' : 'list')
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'announcement' | 'notice'>('all');

  if (!isOpen) return null;

  // Active notice item
  const currentNotice = notices.find(n => n.id === selectedNoticeId) || notices[0];

  // Filtered notices for "View All" list
  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.adminName && n.adminName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'pinned') return n.isPinned;
    if (filterType === 'announcement') return n.type === 'announcement';
    if (filterType === 'notice') return n.type === 'notice' || n.type === 'banner';
    return true;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {viewMode === 'detail' && notices.length > 1 ? (
              <button
                onClick={() => setViewMode('list')}
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                title="View All Notices"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                {viewMode === 'detail' ? 'Notice Details' : 'Notices & Announcements'}
                {viewMode === 'list' && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    {notices.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {viewMode === 'detail' 
                  ? 'Official update from platform administration' 
                  : 'Search & browse all system announcements'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'detail' && (
              <button
                onClick={() => setViewMode('list')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                View All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* DETAIL VIEW MODE */}
          {viewMode === 'detail' && currentNotice && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Optional Banner Image */}
              {currentNotice.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center">
                  <img 
                    src={currentNotice.imageUrl} 
                    alt={currentNotice.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {currentNotice.isPinned && (
                    <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                      <Pin className="w-3.5 h-3.5 fill-slate-950" />
                      Pinned Notice
                    </div>
                  )}
                </div>
              )}

              {/* Title & Status Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {currentNotice.isPinned && !currentNotice.imageUrl && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-300" />
                      Pinned
                    </span>
                  )}
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {currentNotice.type || 'Notice'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Verified Official
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentNotice.title}
                </h2>

                {/* Metadata info strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Published by: <strong className="text-slate-200">{currentNotice.adminName || 'System Admin'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{formatDate(currentNotice.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Full Description / Content Body */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                {currentNotice.content}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setViewMode('list')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  View All Announcements ({notices.length})
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                >
                  Close Notice
                </button>
              </div>

            </div>
          )}

          {/* LIST VIEW MODE ("View All Notices") */}
          {viewMode === 'list' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Search Bar & Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search notices by title, content, or publisher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    All ({notices.length})
                  </button>
                  <button
                    onClick={() => setFilterType('pinned')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 ${
                      filterType === 'pinned'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    Pinned ({notices.filter(n => n.isPinned).length})
                  </button>
                  <button
                    onClick={() => setFilterType('announcement')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      filterType === 'announcement'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    Announcements
                  </button>
                  <button
                    onClick={() => setFilterType('notice')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      filterType === 'notice'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    General Notices
                  </button>
                </div>
              </div>

              {/* Notice Cards List */}
              {filteredNotices.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No notices found</p>
                  <p className="text-xs text-slate-600">Try adjusting your search term or filter options.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotices.map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => {
                        setSelectedNoticeId(notice.id);
                        setViewMode('detail');
                      }}
                      className="group bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex gap-4 items-start"
                    >
                      {/* Banner thumbnail if available */}
                      {notice.imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 hidden sm:block">
                          <img 
                            src={notice.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {notice.isPinned && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5 fill-amber-300" />
                              PINNED
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                            {notice.type || 'Notice'}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-auto">
                            {formatDate(notice.createdAt)}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {notice.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {notice.content}
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span>By: {notice.adminName || 'System Admin'}</span>
                          <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                            Read Full Notice <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
