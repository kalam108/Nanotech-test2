import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  Globe,
  Save,
  CheckCircle2,
  Image,
  Megaphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';

export function ContentManagementSection() {
  const { contentConfig, updateContentConfig, logAdminAction } = useAdmin();
  const { addToast } = useApp();

  const [announcementText, setAnnouncementText] = useState(contentConfig.announcementBar.text);
  const [announcementEnabled, setAnnouncementEnabled] = useState(contentConfig.announcementBar.enabled);
  const [announcementLink, setAnnouncementLink] = useState(contentConfig.announcementBar.link);

  const [heroHeading, setHeroHeading] = useState(contentConfig.heroSection.heading);
  const [heroSubheading, setHeroSubheading] = useState(contentConfig.heroSection.subheading);
  const [heroBadge, setHeroBadge] = useState(contentConfig.heroSection.badge);
  const [heroBgImage, setHeroBgImage] = useState(contentConfig.heroSection.backgroundImage);
  const [heroCtaText, setHeroCtaText] = useState(contentConfig.heroSection.primaryCtaText);

  const [promoTitle, setPromoTitle] = useState(contentConfig.promoBanner.title);
  const [promoSubtitle, setPromoSubtitle] = useState(contentConfig.promoBanner.subtitle);
  const [promoCode, setPromoCode] = useState(contentConfig.promoBanner.discountCode);
  const [promoPercent, setPromoPercent] = useState(contentConfig.promoBanner.discountPercent);
  const [promoEnabled, setPromoEnabled] = useState(contentConfig.promoBanner.enabled);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateContentConfig({
      announcementBar: {
        enabled: announcementEnabled,
        text: announcementText,
        link: announcementLink,
      },
      heroSection: {
        heading: heroHeading,
        subheading: heroSubheading,
        badge: heroBadge,
        backgroundImage: heroBgImage,
        primaryCtaText: heroCtaText,
      },
      promoBanner: {
        enabled: promoEnabled,
        title: promoTitle,
        subtitle: promoSubtitle,
        discountCode: promoCode,
        discountPercent: promoPercent,
      },
    });

    logAdminAction('Updated Storefront CMS', 'cms', 'Updated storefront hero banners, promo codes, and announcement');
    addToast('success', 'Storefront content changes published live!');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400" />
            Storefront CMS &amp; Content Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control over homepage banners, flash promotional announcements, and marketing hero copy.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Publish Live Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Module 1: Top Announcement Bar */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Announcement Ticker Bar</h3>
                <p className="text-[11px] text-slate-400">Header banner visible across all customer pages</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAnnouncementEnabled(!announcementEnabled)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300"
            >
              <span>{announcementEnabled ? 'Enabled' : 'Disabled'}</span>
              {announcementEnabled ? (
                <ToggleRight className="w-7 h-7 text-amber-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Announcement Message
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Link Action</label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Hero Section */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Homepage Hero Showcase</h3>
              <p className="text-[11px] text-slate-400">Main headline, badge and call-to-action button</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Main Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Subheading Paragraph
              </label>
              <textarea
                rows={2}
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Eyebrow Badge Text
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Call to Action Label
              </label>
              <input
                type="text"
                value={heroCtaText}
                onChange={(e) => setHeroCtaText(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Background Art URL
              </label>
              <input
                type="url"
                value={heroBgImage}
                onChange={(e) => setHeroBgImage(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Flash Promo Campaign Banner */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Special Promo Campaign Banner</h3>
                <p className="text-[11px] text-slate-400">Discount voucher codes and campaign banners</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPromoEnabled(!promoEnabled)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300"
            >
              <span>{promoEnabled ? 'Active' : 'Paused'}</span>
              {promoEnabled ? (
                <ToggleRight className="w-7 h-7 text-amber-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Campaign Title</label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Coupon Code</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono font-bold uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                value={promoPercent}
                onChange={(e) => setPromoPercent(Number(e.target.value))}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Subtitle</label>
              <input
                type="text"
                value={promoSubtitle}
                onChange={(e) => setPromoSubtitle(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save &amp; Publish Storefront Config</span>
          </button>
        </div>
      </form>
    </div>
  );
}
