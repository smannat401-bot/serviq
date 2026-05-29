const fs = require('fs');

try {
  let content = fs.readFileSync('src/components/modals/BookingModal.tsx', 'utf8');

  const newStr = `<div className="flex justify-between font-bold text-lg text-brand-black dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Total Estimate</span>
                    <span>~ {basePrice.includes('/hr') ? \`\${basePrice.split('/')[0]} + $12.50\` : \`$\${parseInt(basePrice.replace(/\\D/g, '')) + 12.50}\`}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-brand-electricBlue/10 border border-brand-electricBlue/30 p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-brand-electricBlue rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2">Trust Wallet Protection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your payment of <span className="font-bold text-brand-black dark:text-white">{basePrice.includes('/hr') ? \`\${basePrice.split('/')[0]} + $12.50\` : \`$\${parseInt(basePrice.replace(/\\D/g, '')) + 12.50}\`}</span> will be held securely in the SERVIC Trust Wallet. 
                </p>
                <div className="mt-4 bg-white dark:bg-brand-black p-4 rounded-xl text-left shadow-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-brand-black dark:text-white mb-2">How it works:</p>
                  <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
                    <li>You pay now, money is held by platform.</li>
                    <li>Worker completes the job.</li>
                    <li>You provide the 4-digit code to release payment.</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-brand-black dark:text-white">Booking Confirmed!</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your professional has been notified. You can track this booking in your dashboard.
              </p>
            </motion.div>`;

  let parts = content.split('<CheckCircle size={40} />');
  if(parts.length > 1) {
     let p1 = parts[0];
     let idx = p1.lastIndexOf('<div className="flex justify-between font-bold text-lg');
     if(idx !== -1) {
        let head = p1.substring(0, idx);
        let tail = parts[1];
        let tailIdx = tail.indexOf('</motion.div>');
        if(tailIdx !== -1) {
           let after = tail.substring(tailIdx + '</motion.div>'.length);
           let finalStr = head + newStr + after;
           fs.writeFileSync('src/components/modals/BookingModal.tsx', finalStr);
           console.log('Patched successfully!');
        } else { console.log('Tail not found'); }
     } else { console.log('Head not found'); }
  } else {
     console.log('Pattern not found');
  }
} catch (e) {
  console.error(e);
}
