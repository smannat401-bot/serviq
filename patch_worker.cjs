const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/WorkerDashboard.tsx', 'utf8');

  // Add handleUpdateStatus
  if(!content.includes('const handleUpdateStatus =')) {
    content = content.replace(
      'const handleAcceptBooking = async (bookingId: string) => {',
      `const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(\`\${API_URL}/api/bookings/\${bookingId}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchBookings();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {`
    );
  }

  // Add wallet tab icon
  if(!content.includes("{ id: 'wallet', label: 'Wallet & Earnings'")) {
    content = content.replace(
      "{ id: 'overview', label: 'Overview', icon: Briefcase },",
      "{ id: 'overview', label: 'Overview', icon: Briefcase },\n                { id: 'wallet', label: 'Wallet & Earnings', icon: DollarSign },"
    );
  }

  // Update button logic
  const oldButtons = `) : booking.status === 'Accepted' ? (
                            <>
                              <button onClick={() => setSelectedBookingForCompletion(booking._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-green-500/20">
                                <CheckCircle size={16} /> Mark Complete
                              </button>
                              <a href={\`tel:\${booking.client?.phone || '0000000000'}\`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-xl text-sm font-bold shadow-lg transition-colors">
                                <Phone size={16} className="text-brand-gold" /> Call Client
                              </a>
                            </>`;

  const newButtons = `) : booking.status === 'Accepted' ? (
                            <>
                            <button onClick={() => handleUpdateStatus(booking._id, 'On The Way')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-blue-500/20">
                              <CheckCircle size={16} /> On My Way
                            </button>
                              <a href={\`tel:\${booking.client?.phone || '0000000000'}\`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-xl text-sm font-bold shadow-lg transition-colors">
                                <Phone size={16} className="text-brand-gold" /> Call Client
                              </a>
                            </>
                          ) : booking.status === 'On The Way' ? (
                            <button onClick={() => handleUpdateStatus(booking._id, 'Working')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white text-yellow-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-yellow-500/20">
                              <Briefcase size={16} /> Start Working
                            </button>
                          ) : booking.status === 'Working' ? (
                            <button onClick={() => handleUpdateStatus(booking._id, 'Waiting For Code')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-purple-500/20">
                              <CheckCircle size={16} /> Finish Job
                            </button>
                          ) : booking.status === 'Waiting For Code' ? (
                            <button onClick={() => setSelectedBookingForCompletion(booking._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-green-500/20">
                              <CheckCircle size={16} /> Enter Code
                            </button>`;

  if(content.includes(oldButtons)) {
    content = content.replace(oldButtons, newButtons);
  }

  // Also I need to add Wallet content view, let's inject it before {activeTab === 'calendar'
  const walletView = `
            {activeTab === 'wallet' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Available Balance</h3>
                    <p className="text-4xl font-bold text-brand-black dark:text-white">\${user.walletBalance?.toFixed(2) || '0.00'}</p>
                    <button className="mt-4 w-full py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                      Withdraw Funds
                    </button>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Total Earnings (All Time)</h3>
                    <p className="text-4xl font-bold text-brand-black dark:text-white">\${bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released').reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">75% of total job cost</p>
                  </div>
                </div>
              </motion.div>
            )}
            `;

  if(!content.includes("activeTab === 'wallet'")) {
    content = content.replace("{activeTab === 'calendar' &&", walletView + "\n            {activeTab === 'calendar' &&");
  }

  fs.writeFileSync('src/pages/WorkerDashboard.tsx', content);
  console.log('WorkerDashboard patched successfully');
} catch (e) {
  console.error(e);
}
