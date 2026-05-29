export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold text-brand-black dark:text-white mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: October 2023</p>
          
          <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">1. User Data Protection</h2>
              <p>SERVIQ takes your privacy seriously. We only collect the personal information necessary to provide our home services marketplace functionality. This includes your name, contact information, service address, and necessary payment details. We employ industry-standard encryption protocols to protect your data both in transit and at rest.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">2. Payment Security & Trust Wallet</h2>
              <p>Financial transactions on SERVIQ are protected by our proprietary Trust Wallet escrow system. Payment information is securely processed through our PCI-DSS compliant partners (e.g., Razorpay/Stripe). SERVIQ does not store your full credit card numbers on our servers. Funds are held in escrow and only released upon cryptographic verification via the 4-digit code provided by the client.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">3. Information Storage</h2>
              <p>Your profile data, booking history, and reviews are stored securely in our cloud infrastructure. Workers' uploaded ID proofs are used strictly for identity verification purposes and are stored with advanced encryption. You have the right to request the deletion of your account and associated personal data at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">4. Data Handling Rules</h2>
              <p>We do not sell your personal data to third-party marketers. Information is only shared between a Client and a Worker when a booking is confirmed, and only to the extent necessary to complete the service (e.g., sharing the service address with the assigned plumber). We may analyze anonymized usage data to improve our platform's algorithms and user experience.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">5. Worker Responsibility & Performance</h2>
              <p>Workers are responsible for professional conduct and adherence to platform booking rules. Cancellation history is tracked permanently in the worker's profile. Repeated cancellations may lead to account suspension as per our platform integrity policy.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
