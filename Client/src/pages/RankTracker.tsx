import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, RefreshCw, Trash2, Search, Globe, 
  AlertCircle, Loader2, Filter, ArrowUpDown, Clock, 
  ExternalLink, Eye, EyeOff, X, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface Competitor {
  domain: string;
  title: string;
  url: string;
  position: number;
}

interface KeywordTracking {
  _id: string;
  keyword: string;
  url: string;
  domain: string;
  currentPosition: number | null;
  currentPage: number | null;
  bestPosition: number | null;
  positionChange: number;
  active: boolean;
  status: 'pending' | 'checking' | 'completed' | 'failed';
  competitors: Competitor[];
  lastChecked: string | null;
  createdAt: string;
}

export default function RankTracker() {
  const { api } = useApp();
  const [keywords, setKeywords] = useState<KeywordTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states for adding new keyword
  const [newKeyword, setNewKeyword] = useState('');
  const [newURL, setNewURL] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  
  // Operational loading states tracking item IDs
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Helper function to get position badge styling
  const getPositionBadge = (position: number | null) => {
    if (!position) return { class: 'bg-muted text-muted-foreground' };
    if (position === 1) return { class: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' };
    if (position <= 3) return { class: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' };
    if (position <= 10) return { class: 'bg-green-500/20 text-green-700 dark:text-green-400' };
    return { class: 'bg-orange-500/20 text-orange-700 dark:text-orange-400' };
  };

  // Helper function to get position change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return { icon: <ArrowUpRight size={14} />, text: `+${change}`, class: 'text-green-600 dark:text-green-400' };
    } else if (change < 0) {
      return { icon: <ArrowDownRight size={14} />, text: `${change}`, class: 'text-red-600 dark:text-red-400' };
    }
    return { icon: null, text: 'No change', class: 'text-muted-foreground' };
  };

  // Compute processed data based on filters and sort
  const processedData = keywords
    .filter((kw) => {
      const matchesSearch = 
        kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kw.domain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && kw.active) ||
        (statusFilter === 'paused' && !kw.active);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank_asc':
          return (a.currentPosition || 999) - (b.currentPosition || 999);
        case 'rank_desc':
          return (b.currentPosition || 999) - (a.currentPosition || 999);
        case 'change':
          return b.positionChange - a.positionChange;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Fetch all keywords on load
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/rank/list');
      if (response.data.success) {
        setKeywords(response.data.keywords);
      }
    } catch (error) {
      console.error('Failed to fetch keywords', error);
      toast.error('Could not load tracked keywords.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  // Handle adding a keyword & starting background polling
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newURL.trim()) return;

    setIsAdding(true);
    setAddError('');

    try {
      const response = await api.post('/api/rank/add', {
        keyword: newKeyword.trim().toLowerCase(),
        url: newURL.trim()
      });

      if (response.data.success) {
        // Optimistically add item with "checking" status to list
        const tempTracking = response.data.tracking;
        setKeywords((prev) => [tempTracking, ...prev]);
        setNewKeyword('');
        setNewURL('');
        setIsModalOpen(false);
        toast.success('Keyword tracking initialized! This may take up to 2-3 minutes...');

        // Poll server for completion status
        const id = tempTracking._id;
        let pollCount = 0;
        const maxPolls = 120; // 10 minutes max (120 * 5 seconds)
        
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const check = await api.get(`/api/rank/${id}`);
            if (check.data.tracking.status !== 'checking') {
              clearInterval(pollInterval);
              // Update state with finalized crawled values
              setKeywords((prev) =>
                prev.map((k) => (k._id === id ? check.data.tracking : k))
              );
              if (check.data.tracking.status === 'completed') {
                toast.success(`✅ Tracking complete! Position: #${check.data.tracking.currentPosition || 'N/A'}`);
              } else if (check.data.tracking.status === 'failed') {
                toast.error('❌ Tracking failed. Please try again.');
              }
            } else if (pollCount % 12 === 0) {
              // Show progress every 60 seconds
              toast.loading(`Still tracking... (${pollCount * 5} seconds elapsed)`);
            }
            
            // Stop polling after max attempts
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              toast.error('Tracking took too long. Please refresh to check status.');
            }
          } catch (err: any) {
            console.error('Polling error:', err);
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
            }
          }
        }, 5000); // Poll every 5 seconds instead of 3
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add keyword');
      toast.error('Error starting keyword tracker.');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle manual tracking re-verification
  const handleRefresh = async (id: string) => {
    setRefreshingId(id);
    try {
      await api.post(`/api/rank/${id}/refresh`);
      
      // Update targeted status instantly to showing loader inline
      setKeywords((prev) =>
        prev.map((k) => (k._id === id ? { ...k, status: 'checking' } : k))
      );

      // Poll completion status
      const pollInterval = setInterval(async () => {
        try {
          const check = await api.get(`/api/rank/${id}`);
          if (check.data.tracking.status !== 'checking') {
            clearInterval(pollInterval);
            setKeywords((prev) =>
              prev.map((k) => (k._id === id ? check.data.tracking : k))
            );
            setRefreshingId(null);
            toast.success('Rank status refreshed successfully!');
          }
        } catch (error) {
          console.error(error);
          clearInterval(pollInterval);
          setRefreshingId(null);
        }
      }, 3000);
    } catch (error) {
      console.error('Refresh error', error);
      toast.error('Failed to trigger manual verification.');
      setRefreshingId(null);
    }
  };

  // Handle active/inactive chron configuration toggle
  const handleToggle = async (id: string) => {
    try {
      const res = await api.put(`/api/rank/${id}/toggle`);
      if (res.data.success) {
        setKeywords((prev) =>
          prev.map((k) =>
            k._id === id ? { ...k, active: res.data.tracking.active } : k
          )
        );
        toast.success(res.data.tracking.active ? 'Daily auto-tracking active' : 'Daily auto-tracking paused');
      }
    } catch (error) {
      console.error('Toggle failed', error);
      toast.error('Failed to update automation toggle state.');
    }
  };

  // Handle removing monitored tracking rule
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to stop tracking this keyword?')) return;
    setDeletingId(id);
    try {
      const res = await api.delete(`/api/rank/${id}`);
      if (res.data.success) {
        setKeywords((prev) => prev.filter((k) => k._id !== id));
        toast.success('Keyword tracker removed.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete tracking rule.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
        <div className="min-h-scree pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                            <span className="gradient-text">Rank Tracker</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track your keyword rankings on Google — updated daily.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 self-start" id="add-keyword-btn" style={{ color: "var(--background)" }}>
                        <Plus size={18} />
                        Track Keyword
                    </button>
                </div>

                {/* Filters Row */}
                <div className="mb-6 flex flex-col md:flex-row gap-3" style={{ animationDelay: "100ms" }}>
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
                        <Search size={18} className="text-muted-foreground" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search keywords or domains..." className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1" id="rank-search-input" />
                    </div>

                    <div className="flex gap-3">
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <Filter size={16} className="text-muted-foreground" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-foreground outline-none appearance-none pr-4 cursor-pointer">
                                <option value="all" className="bg-background">
                                    All Status
                                </option>
                                <option value="active" className="bg-background">
                                    Active
                                </option>
                                <option value="paused" className="bg-background">
                                    Paused
                                </option>
                            </select>
                        </div>
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-foreground outline-none appearance-none pr-4 cursor-pointer">
                                <option value="newest" className="bg-background">
                                    Newest First
                                </option>
                                <option value="rank_asc" className="bg-background">
                                    Highest Ranked
                                </option>
                                <option value="rank_desc" className="bg-background">
                                    Lowest Ranked
                                </option>
                                <option value="change" className="bg-background">
                                    Biggest Gain
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Keywords List */}
                {loading ? (
                    <div className="flex items-center justify-center py-30">
                        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Target size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No keywords tracked yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">Add your first keyword and URL to start tracking your Google rankings.</p>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity" style={{ color: "var(--background)" }}>
                            Track Your First Keyword
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3" style={{ animationDelay: "200ms" }}>
                        {processedData.map((kw) => {
                            const posBadge = getPositionBadge(kw.currentPosition);
                            const change = getChangeIndicator(kw.positionChange);

                            return (
                                <div key={kw._id} className={`glass rounded-xl p-5 hover:bg-muted/50 transition-all ${!kw.active ? "opacity-50" : ""}`}>
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Rank badge */}
                                        <div className="flex items-center gap-4 lg:w-32 shrink-0">
                                            {kw.status === "checking" ? (
                                                <div className="w-16 h-16 rounded-xl glass flex items-center justify-center">
                                                    <Loader2 size={24} className="text-primary animate-spin" />
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold ${posBadge.class}`}>{kw.currentPosition ? `#${kw.currentPosition}` : "—"}</div>
                                            )}
                                            {kw.status === "completed" && kw.currentPosition && (
                                                <div className="text-center mt-1">
                                                    <div className={`flex items-center justify-center gap-1 text-sm font-medium ${change.class}`}>
                                                        {change.icon}
                                                        {change.text}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">change</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Link to={`/rank/${kw._id}`} className="text-base font-semibold text-foreground hover:text-primary transition-colors block truncate">
                                                "{kw.keyword}"
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Globe size={12} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground truncate">{kw.domain}</span>
                                                {kw.currentPage && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Page {kw.currentPage}</span>}
                                            </div>
                                            {kw.lastChecked && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                    <Clock size={10} />
                                                    Last checked: {new Date(kw.lastChecked).toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        {kw.status === "completed" && (
                                            <div className="hidden md:flex items-center gap-5">
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-primary">{kw.bestPosition || "—"}</p>
                                                    <p className="text-[10px] text-muted-foreground">Best</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-accent">{kw.competitors?.length || 0}</p>
                                                    <p className="text-[10px] text-muted-foreground">Competitors</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Link to={`/rank/${kw._id}`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all" title="View Details">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button onClick={() => handleRefresh(kw._id)} disabled={refreshingId === kw._id || kw.status === "checking"} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30" title="Refresh Ranking">
                                                <RefreshCw size={16} className={refreshingId === kw._id ? "animate-spin" : ""} />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(kw._id)}
                                                className={`p-2 rounded-lg hover:bg-muted transition-all ${kw.active ? "text-success hover:text-success" : "text-muted-foreground hover:text-foreground"}`}
                                                title={kw.active ? "Pause Tracking" : "Resume Tracking"}
                                            >
                                                {kw.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button onClick={() => handleDelete(kw._id)} disabled={deletingId === kw._id} className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50" title="Delete">
                                                {deletingId === kw._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground">Track New Keyword</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setAddError("");
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {addError && (
                            <div className="mb-4 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label htmlFor="modal-keyword" className="block text-sm font-medium text-foreground mb-1.5">
                                    Keyword
                                </label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-keyword"
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder='e.g., "best seo tools"'
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="modal-url" className="block text-sm font-medium text-foreground mb-1.5">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-url"
                                        type="text"
                                        value={newURL}
                                        onChange={(e) => setNewURL(e.target.value)}
                                        placeholder="e.g., example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-muted-foreground">
                                <p>💡 We'll search Google for your keyword, find your website's position (up to page 5), and track it daily.</p>
                            </div>

                            <button type="submit" disabled={isAdding} className="w-full py-3 rounded-xl bg-primary font-semibold text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50" style={{ color: "var(--background)" }}>
                                {isAdding ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Target size={18} />
                                        Start Tracking
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
