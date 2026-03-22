import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pappu Juice Corner collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">1. Information We Collect</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-3">
              We collect information you provide directly when you create an account, place an order, or contact us:
            </p>
            <ul className="list-disc list-inside text-on-surface-variant text-[15px] leading-relaxed space-y-2">
              <li><strong>Personal Info:</strong> Name, email address, phone number</li>
              <li><strong>Delivery Info:</strong> Street address, delivery instructions</li>
              <li><strong>Payment Info:</strong> Payment method details (processed securely via third-party providers)</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, and device information</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-on-surface-variant text-[15px] leading-relaxed space-y-2">
              <li>Processing and fulfilling your juice orders</li>
              <li>Communicating order status and delivery updates</li>
              <li>Improving our products, services, and website experience</li>
              <li>Sending promotional offers and newsletters (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">3. Data Protection</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including encrypted data transmission (SSL/TLS), secure password hashing, and restricted access to personal data. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">4. Cookies</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. We do not use third-party tracking cookies for advertising purposes. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">5. Third-Party Services</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              We may share necessary information with trusted third-party services for payment processing, delivery logistics, and analytics. These partners are bound by their own privacy policies and are not permitted to use your data for other purposes.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">6. Your Rights</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-on-surface-variant text-[15px] leading-relaxed space-y-2">
              <li>Access and review your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of promotional communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">7. Data Retention</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide services. Order history is kept for up to 3 years for quality and legal purposes. You may request deletion at any time.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4">8. Contact Us</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              For privacy-related inquiries, please email{" "}
              <a href="mailto:privacy@pappujuice.com" className="text-primary font-semibold hover:underline">privacy@pappujuice.com</a> or visit our{" "}
              <Link href="/contact" className="text-primary font-semibold hover:underline">Contact page</Link>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
