import { AlertTriangle } from 'lucide-react';
import SEO from '../components/seo/SEO';


export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <SEO title="Terms of Service" description="Read the terms of service of SERVIQ." url="https://serviq.com/terms" />
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold text-brand-black dark:text-white mb-8">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Please read these terms carefully before using the SERVIQ platform.</p>
          
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h3 className="font-bold text-red-500 flex items-center gap-2 mb-2">
              <AlertTriangle size={20} /> CORE TRUST SYSTEM
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <strong>Clients:</strong> NEVER release your 4-digit verification code to the worker until the job is 100% complete to your satisfaction. <br/><br/>
              <strong>Workers:</strong> NEVER ask for payment outside the platform or request the code before finishing the work. Doing so will result in immediate permanent account suspension.
            </p>
          </div>

          <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">1. Client Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide an accurate description of the problem or Service required.</li>
                <li>Ensure a safe working environment for the professional.</li>
                <li>Only provide the 4-digit verification code when the Service has been successfully rendered.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">2. Worker Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain a high standard of professional conduct and Service quality.</li>
                <li>Arrive at the scheduled time or communicate delays promptly.</li>
                <li>Accept the platform's 18% commission rate deducted automatically from the Trust Wallet.</li>
                <li>Ensure online payment from client is completed via the platform.</li>
                <li>Avoid repeated cancellations to maintain account standing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">3. Payment Terms</h2>
              <p>All payments must be processed through the SERVIQ Trust Wallet system. Clients pay upfront, and the funds are held in escrow. Off-platform cash payments are strictly prohibited and void any platform guarantees or fraud protection.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">4. Cancellation & Refund Policy</h2>
              <p>Clients may cancel a booking for a full refund up to 2 hours before the scheduled time. Cancellations within 2 hours may incur a penalty fee. If a worker fails to show up, the client is entitled to a 100% refund processed automatically from the Trust Wallet.</p>
              <p className="mt-4"><strong>Worker Cancellation Rules:</strong> Worker cancellations are monitored. 5 cancellations trigger a final warning. The 6th cancellation results in an <strong>automatic and permanent Worker ID block</strong>, preventing further access to the dashboard or bookings.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">5. Fraud Protection</h2>
              <p>Our Trust Wallet and 4-digit code system is designed to prevent fraud. Any attempt by users to circumvent this system, manipulate reviews, or engage in deceptive practices will result in legal action and account termination.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
