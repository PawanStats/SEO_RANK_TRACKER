import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, 
  ArrowUpRight, ArrowDownRight, Minus, Search, Globe, 
  ChevronRight, AlertCircle, Loader2 
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
        toast.success('Keyword tracking initialized!');

        // Poll server for completion status
        const id = tempTracking._id;
        const pollInterval = setInterval(async () => {
          try {
            const check = await api.get(`/api/rank/${id}`);
            if (check.data.tracking.status !== 'checking') {
              clearInterval(pollInterval);
              // Update state with finalized crawled values
              setKeywords((prev) =>
                prev.map((k) => (k._id === id ? check.data.tracking : k))
              );
              toast.success(`Tracking complete for "${check.data.tracking.keyword}"!`);
            }
          } catch (err: any) {
            console.error(err);
            clearInterval(pollInterval);
          }
        }, 3000);
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
      const response = await api.put(`/api/rank/${id}/toggle`);
      if (response.data.success) {
        setKeywords((prev) =>
          prev.map((k) =>
            k._id === id ? { ...k, active: response.data.tracking.active } : k
          )
        );
        toast.success(response.data.tracking.active ? 'Daily auto-tracking active' : 'Daily auto-tracking paused');
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
      const response = await api.delete(`/api/rank/${id}`);
      if (response.data.success) {
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Rank Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor keyword listings on search engines and competitor dynamics.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={20} />
          Track New Keyword
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No keywords monitored</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Start adding optimization keywords matching target web configurations to generate organic indexes.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4">Keyword Details</th>
                <th className="px-6 py-4">Target Destination</th>
                <th className="px-6 py-4 text-center">Google Position</th>
                <th className="px-6 py-4 text-center">Variance</th>
                <th className="px-6 py-4 text-center">Best Rank</th>
                <th className="px-6 py-4 text-center">Automation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {keywords.map((k) => (
                <tr key={k._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                  {/* Keyword info */}
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                    <div className="flex flex-col">
                      <span>{k.keyword}</span>
                      <span className="text-xs text-gray-400 font-normal mt-0.5">Added {new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  
                  {/* Destination Domain */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-gray-400" />
                      <span>{k.domain}</span>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-6 py-4 text-center font-semibold">
                    {k.status === 'checking' ? (
                      <div className="flex items-center justify-center gap-1 text-amber-500">
                        <Loader2 className="animate-spin" size={14} />
                        <span className="text-xs font-medium">Checking</span>
                      </div>
                    ) : k.currentPosition ? (
                      <span className="text-base text-gray-900 dark:text-white">{k.currentPosition}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 font-normal text-xs">Not Ranked</span>
                    )}
                  </td>

                  {/* Position Change / Variance */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {k.positionChange > 0 ? (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          <ArrowUpRight size={14} /> {k.positionChange}
                        </span>
                      ) : k.positionChange < 0 ? (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                          <ArrowDownRight size={14} /> {Math.abs(k.positionChange)}
                        </span>
                      ) : (
                        <span className="text-gray-400"><Minus size={14} /></span>
                      )}
                    </div>
                  </td>

                  {/* Best Position */}
                  <td className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400">
                    {k.bestPosition || '--'}
                  </td>

                  {/* Active Toggle Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleToggle(k._id)}
                        className="text-gray-400 hover:text-indigo-600 transition"
                      >
                        {k.active ? (
                          <ToggleRight size={28} className="text-indigo-600" />
                        ) : (
                          <ToggleLeft size={28} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Custom Route and Utility Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleRefresh(k._id)}
                        disabled={refreshingId === k._id || k.status === 'checking'}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition disabled:opacity-40"
                        title="Recrawl Status"
                      >
                        <RefreshCw size={16} className={refreshingId === k._id ? 'animate-spin' : ''} />
                      </button>

                      <button
                        onClick={() => handleDelete(k._id)}
                        disabled={deletingId === k._id}
                        className="text-gray-400 hover:text-red-500 transition disabled:opacity-40"
                        title="Delete Tracker"
                      >
                        <Trash2 size={16} />
                      </button>

                      <Link
                        to={`/rank/${k._id}`}
                        className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium transition"
                      >
                        View History
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Keyword Overlay Modal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 relative">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Add Keyword</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Initialize tracking indexing targets using autonomous rendering clusters.</p>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Target Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g., full stack project deployment"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="e.g., greatstack.dev"
                  value={newURL}
                  onChange={(e) => setNewURL(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              {addError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setAddError('');
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {isAdding && <Loader2 size={16} className="animate-spin" />}
                  {isAdding ? 'Initializing...' : 'Start Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}