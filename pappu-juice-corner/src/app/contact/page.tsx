"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Metadata } from "next";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: settings } = useSWR("/api/settings", fetcher);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields.");
    }
    setSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7faf3] pt-20 md:pt-24 pb-16 md:pb-24 font-body">
      {/* Hero */}
      <section className="px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-[#52634f] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 shadow-sm">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4 md:mb-6">
            We&apos;d Love to <span className="text-primary italic font-serif">Hear From You</span>
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
            Whether it&apos;s a question about our juices, a delivery concern, or just to say hello — we&apos;re all ears.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6 md:space-y-8">
            
            <div className="bg-[#e9eee5] rounded-[1.5rem] p-6 md:p-8 border border-[#dce4d5]">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6 tracking-tight">Quick Reach</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d1ecb4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#1b4321] text-[18px]">mail</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5c6359] mb-1">Email</p>
                    <a href={`mailto:${settings?.contact?.email || "hello@pappujuice.com"}`} className="text-[14px] font-semibold text-[#1b4321] hover:underline">
                      {settings?.contact?.email || "hello@pappujuice.com"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#fbdfc6] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#8f4e00] text-[18px]">call</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5c6359] mb-1">Phone</p>
                    <a href={`tel:${settings?.contact?.phone?.replace(/\s/g, "") || "+919876543210"}`} className="text-[14px] font-semibold text-[#1b4321] hover:underline">
                      {settings?.contact?.phone || "+91 98765 43210"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#e4ebdd] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#40493d] text-[18px]">location_on</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5c6359] mb-1">Visit Us</p>
                    <p className="text-[14px] font-medium text-on-surface leading-relaxed whitespace-pre-line">
                      {settings?.contact?.address || "120 Juice Lane, Fresh Market\nHyderabad, Telangana 500001"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#a3f69c] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#005312] text-[18px]">schedule</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5c6359] mb-1">Hours</p>
                    <p className="text-[14px] font-medium text-on-surface leading-relaxed whitespace-pre-line">
                      {settings?.contact?.hours || "Mon – Sat: 6:00 AM – 10:00 PM\nSun: 7:00 AM – 9:00 PM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Shortcut */}
            <div className="bg-[#1b4321] rounded-[1.5rem] p-6 md:p-8 text-white">
              <h3 className="text-lg font-bold font-headline mb-3 tracking-tight">Common Questions</h3>
              <p className="text-[#a3f69c] text-sm font-medium leading-relaxed mb-5">
                Most delivery and order questions are answered in our FAQ.
              </p>
              <div className="space-y-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold flex items-center justify-between py-2 border-b border-white/10">
                    How long does delivery take?
                    <span className="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="text-[#a3f69c] text-sm pt-2 pb-3 leading-relaxed">Free scheduled delivery arrives by 7 AM. Instant delivery takes 20–60 minutes.</p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold flex items-center justify-between py-2 border-b border-white/10">
                    Can I cancel my order?
                    <span className="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="text-[#a3f69c] text-sm pt-2 pb-3 leading-relaxed">Orders can be cancelled within 5 minutes of placing. After prep begins, cancellation isn&apos;t possible.</p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold flex items-center justify-between py-2">
                    Are your juices truly organic?
                    <span className="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="text-[#a3f69c] text-sm pt-2 pb-3 leading-relaxed">Yes! 100% certified organic produce from local farms within a 50-mile radius.</p>
                </details>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-sm border border-surface-container">
              <h3 className="text-xl md:text-2xl font-bold font-headline text-on-surface mb-6 md:mb-8 tracking-tight">Send a Message</h3>
              
              <div className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full bg-[#f2f5ee] border-none rounded-xl px-4 md:px-5 py-3.5 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface placeholder:text-[#8ba38d] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-[#f2f5ee] border-none rounded-xl px-4 md:px-5 py-3.5 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface placeholder:text-[#8ba38d] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#f2f5ee] border-none rounded-xl px-4 md:px-5 py-3.5 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all appearance-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Issue</option>
                    <option value="delivery">Delivery Question</option>
                    <option value="product">Product Inquiry</option>
                    <option value="wholesale">Wholesale / Partnership</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full bg-[#f2f5ee] border-none rounded-xl px-4 md:px-5 py-3.5 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface placeholder:text-[#8ba38d] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1b4321] text-white py-4 rounded-full font-bold text-[14px] shadow-md hover:bg-primary transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
