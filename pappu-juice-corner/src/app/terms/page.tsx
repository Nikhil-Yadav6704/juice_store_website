import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Pappu Juice Corner services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7faf3] pt-20 md:pt-24 pb-16 md:pb-24 font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <Link href="/" className="text-sm text-[#5c6359] font-medium hover:text-[#1b4321] transition-colors mb-4 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">1. Acceptance of Terms</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              By accessing and using the Pappu Juice Corner website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">2. Services</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-3">
              Pappu Juice Corner provides cold-pressed juice products and delivery services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
            </p>
            <ul className="list-disc list-inside text-on-surface-variant text-[15px] leading-relaxed space-y-2">
              <li>All orders are subject to product availability</li>
              <li>Delivery times are estimates and may vary based on demand</li>
              <li>Prices are subject to change without prior notice</li>
              <li>Promotional offers may be modified or discontinued at any time</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">3. User Accounts</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">4. Orders & Payments</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-3">
              By placing an order, you agree to pay the listed price plus any applicable delivery fees and taxes. All payments are processed securely.
            </p>
            <ul className="list-disc list-inside text-on-surface-variant text-[15px] leading-relaxed space-y-2">
              <li>Orders cannot be cancelled once preparation has begun</li>
              <li>Refunds are processed within 5–7 business days</li>
              <li>We accept all major credit/debit cards and UPI payments</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">5. Delivery</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              We offer three delivery tiers: Scheduled (free), Instant (within 60 minutes), and Super Instant (within 20 minutes). Delivery availability depends on your location and current demand. We are not liable for delays caused by factors beyond our control.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">6. Intellectual Property</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              All content on this website — including text, images, logos, and designs — is owned by Pappu Juice Corner and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">7. Limitation of Liability</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              Pappu Juice Corner shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">8. Contact</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@pappujuice.com" className="text-primary font-semibold hover:underline">legal@pappujuice.com</a> or visit our{" "}
              <Link href="/contact" className="text-primary font-semibold hover:underline">Contact page</Link>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
