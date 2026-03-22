"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      toast.error("Error loading settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: string, field: string, value: string | number) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">data_usage</span>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 font-body max-w-5xl mx-auto w-full">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface font-headline tracking-tight">Global Settings</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Manage website content and dynamic pricing</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-[#005312] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6 md:space-y-8">
        
        {/* Home & Hero Settings */}
        <section className="bg-white rounded-[1.5rem] p-5 md:p-8 shadow-sm border border-surface-container">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <span className="material-symbols-outlined text-primary">home</span>
            <h2 className="text-lg md:text-xl font-bold font-headline">Home Page</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Hero Title</label>
              <input
                type="text"
                value={settings.home?.heroTitle || ""}
                onChange={(e) => handleChange("home", "heroTitle", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Hero Subtitle</label>
              <textarea
                rows={3}
                value={settings.home?.heroSubtitle || ""}
                onChange={(e) => handleChange("home", "heroSubtitle", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface resize-none"
              />
            </div>
          </div>
        </section>

        {/* About Page Settings */}
        <section className="bg-white rounded-[1.5rem] p-5 md:p-8 shadow-sm border border-surface-container">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <span className="material-symbols-outlined text-primary">info</span>
            <h2 className="text-lg md:text-xl font-bold font-headline">About Page</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Story Title</label>
              <input
                type="text"
                value={settings.about?.title || ""}
                onChange={(e) => handleChange("about", "title", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Story Content</label>
              <textarea
                rows={5}
                value={settings.about?.content || ""}
                onChange={(e) => handleChange("about", "content", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Heritage Title (Bottom)</label>
              <input
                type="text"
                value={settings.about?.heroTitle || ""}
                onChange={(e) => handleChange("about", "heroTitle", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
          </div>
        </section>

        {/* Delivery & Pricing Settings */}
        <section className="bg-white rounded-[1.5rem] p-5 md:p-8 shadow-sm border border-surface-container">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <h2 className="text-lg md:text-xl font-bold font-headline">Delivery Pricing & Tax</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Instant Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={settings.delivery?.instantPrice ?? ""}
                onChange={(e) => handleChange("delivery", "instantPrice", parseFloat(e.target.value))}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Super Instant Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={settings.delivery?.superInstantPrice ?? ""}
                onChange={(e) => handleChange("delivery", "superInstantPrice", parseFloat(e.target.value))}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tax Rate (e.g. 0.02 for 2%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.delivery?.taxRate ?? ""}
                onChange={(e) => handleChange("delivery", "taxRate", parseFloat(e.target.value))}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
          </div>
        </section>

        {/* Contact Settings */}
        <section className="bg-white rounded-[1.5rem] p-5 md:p-8 shadow-sm border border-surface-container">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <span className="material-symbols-outlined text-primary">contact_support</span>
            <h2 className="text-lg md:text-xl font-bold font-headline">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Store Email</label>
              <input
                type="email"
                value={settings.contact?.email || ""}
                onChange={(e) => handleChange("contact", "email", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Store Phone</label>
              <input
                type="text"
                value={settings.contact?.phone || ""}
                onChange={(e) => handleChange("contact", "phone", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Address (Use \n for new lines)</label>
              <textarea
                rows={3}
                value={settings.contact?.address || ""}
                onChange={(e) => handleChange("contact", "address", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Working Hours (Use \n for new lines)</label>
              <textarea
                rows={3}
                value={settings.contact?.hours || ""}
                onChange={(e) => handleChange("contact", "hours", e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface resize-none"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
