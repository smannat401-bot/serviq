import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Activity, CheckCircle, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/withdrawals`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/workers`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCancellations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/cancellations`);
      if (res.ok) {
        const data = await res.json();
        setCancellations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchWithdrawals();
    fetchWorkers();
    fetchCancellations();
  }, []);

  const handleWithdrawal = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWithdrawals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockWorker = async (id: string, isBlocked: boolean) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this worker?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/workers/${id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked })
      });
      if (res.ok) {
        fetchWorkers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-[#0B1120] text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-bold text-brand-black dark:text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Platform Revenue</h3>
                <p className="text-3xl font-bold text-brand-black dark:text-white">${(stats.totalRevenue || 0).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">From 25% Trust Wallet commissions.</p>
          </motion.div>

          {/* Transactions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs">Completed Bookings</h3>
                <p className="text-3xl font-bold text-brand-black dark:text-white">{stats.totalTransactions}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Successfully processed payments.</p>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-brand-electricBlue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
          >
            Withdrawal Requests
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'workers' ? 'bg-brand-electricBlue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
          >
            Partner Management
          </button>
          <button
            onClick={() => setActiveTab('cancellations')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'cancellations' ? 'bg-brand-electricBlue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
          >
            Cancellation Logs
          </button>
        </div>

        {activeTab === 'withdrawals' ? (
          <>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Withdrawal Requests</h2>

            <div className="glass-card overflow-hidden">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No withdrawal requests found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Partner</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank Details</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {withdrawals.map((req) => (
                        <tr key={req._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-brand-black dark:text-white">
                            {req.workerId?.name} <br />
                            <span className="text-xs text-gray-500">{req.workerId?.email}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-brand-black dark:text-white">
                            ${(req.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {req.bankDetails?.accountName}<br />
                            {req.bankDetails?.accountNumber}<br />
                            {req.bankDetails?.ifscCode}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {req.status === 'Pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleWithdrawal(req._id, 'Approved')}
                                  className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleWithdrawal(req._id, 'Rejected')}
                                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'workers' ? (
          <>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Worker Management & Monitoring</h2>
            {/* ... existing worker table code ... */}
            <div className="glass-card overflow-hidden">
              {workers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No workers found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Worker</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Skill</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Honour Score</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Cancellations</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {workers.map((worker) => (
                        <tr key={worker._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-brand-black dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue font-bold text-xs">
                                {worker.name?.charAt(0)}
                              </div>
                              <div>
                                {worker.name} <br />
                                <span className="text-xs text-gray-500">{worker.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {worker.skill || 'General'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${worker.honourScore <= 75 ? 'text-red-500' : 'text-green-500'}`}>
                              {worker.honourScore || 100}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${worker.cancellationCount >= 5 ? 'text-red-500' : 'text-brand-black dark:text-white'}`}>
                              {worker.cancellationCount || 0}
                            </span>
                            {worker.honourScore === 75 && <span title="Warning Sent (Score 75)"><AlertCircle size={14} className="inline ml-1 text-orange-500" /></span>}
                            {worker.isBlocked && <span title="Account Blocked"><ShieldAlert size={14} className="inline ml-1 text-red-600" /></span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${worker.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {worker.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleBlockWorker(worker._id, !worker.isBlocked)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${worker.isBlocked
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                }`}
                            >
                              {worker.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Cancellation History & Reasons</h2>
            <div className="glass-card overflow-hidden">
              {cancellations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No cancellation records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Worker</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cancelled By</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {cancellations.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-brand-black dark:text-white">{c.worker?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{c.serviceName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.cancelledBy === 'worker' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                              {c.cancelledBy || 'System'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 italic">
                            "{c.cancellationReason || (c.status === 'Declined' ? 'Declined by worker' : 'No reason provided')}"
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-500">
                            {new Date(c.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
