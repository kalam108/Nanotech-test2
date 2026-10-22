import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRBAC } from '../../context/RBACContext';
import { useTranslation } from '../../i18n/useTranslation';
import { LanguageToggle } from './LanguageToggle';
import { NanoTechLogo } from '../brand/NanoTechLogo';
import {
  Shield,
  ShieldCheck,
  Search,
  Truck,
  Headphones,
  RotateCcw,
  Heart,
  Send,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';

export function Footer() {
  const { setCurrentView, setFilters, categories, addToast, openDashboardHub } = useApp();
  const { navigate: rbacNavigate } = useRBAC();
  const { t, isNepali } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('error', isNepali ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    addToast('success', isNepali ? 'न्यानोटेक सोलुसनमा सदस्यता लिनुभएकोमा धन्यवाद!' : 'Subscribed to Nanotech Solution deals and hardware drops!');
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-slate-200 text-slate-600 text-sm relative overflow-hidden font-sans">
      {/* Value Proposition Banners - Glossy Cards */}
      <div className="border-b border-slate-200/80 bg-slate-50/50 py-10">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glossy-card glossy-card-hover p-5 rounded-2xl flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm">{t('verifiedHardware')}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('verifiedHardwareDesc')}</p>
            </div>
          </div>

          <div className="glossy-card glossy-card-hover p-5 rounded-2xl flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm">{t('nationwideShipping')}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('nationwideShippingDesc')}</p>
            </div>
          </div>

          <div className="glossy-card glossy-card-hover p-5 rounded-2xl flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100/70 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm">{t('customBuildSupport')}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('customBuildSupportDesc')}</p>
            </div>
          </div>

          <div className="glossy-card glossy-card-hover p-5 rounded-2xl flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100/70 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm">{t('techConcierge')}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('techConciergeDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center group text-left focus:outline-none cursor-pointer"
          >
            <NanoTechLogo size="lg" variant="horizontal" />
          </button>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            <strong>Nanotech Solution</strong> — {isNepali 
              ? 'नेपालको उत्कृष्ट कम्प्युटर मार्केटप्लेस, गेमिङ पीसी, कस्टम कम्प्युटर निर्माण, ग्राफिक्स कार्ड र प्रमाणित हार्डवेयर।'
              : 'High-performance computer marketplace, gaming PCs, custom builds, graphics cards, mechanical keyboards, and verified electronics in Nepal.'}
          </p>

          {/* Quick Contact Badges */}
          <div className="space-y-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{t('locationItahari')}, Sunsari, Nepal</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isNepali ? 'सम्पर्क:' : 'Contact:'} <a href="tel:9762379999" className="font-semibold text-slate-900 hover:text-indigo-600">9762379999</a></span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp: <a href="https://wa.me/9779852055346" target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-emerald-600">9852055346</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{isNepali ? 'इमेल:' : 'Email:'} <a href="mailto:ntsolution68@gmail.com" className="font-semibold text-slate-900 hover:text-purple-600">ntsolution68@gmail.com</a></span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600">
                <strong className="text-slate-900">{isNepali ? 'आइत–बुध र शुक्र:' : 'Sun–Wed & Fri:'}</strong> 8:00 AM – 7:00 PM<br />
                <strong className="text-slate-900">{isNepali ? 'बिही:' : 'Thu:'}</strong> 9:00 AM – 7:00 PM | <span className="text-rose-600 font-bold">{isNepali ? 'शनि: बन्द' : 'Sat: CLOSED'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="pt-2 space-y-2">
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder={isNepali ? 'इमेल प्रविष्ट गर्नुहोस्...' : 'Enter email for hardware drops...'}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full transition-all"
              />
              <button
                type="submit"
                className="glossy-pill-btn text-white font-bold p-2.5 rounded-xl transition-all shrink-0 cursor-pointer"
                title="Subscribe"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {isNepali ? 'तपाईं सदस्यतामा सामेल हुनुभयो!' : "You're subscribed to Nanotech Solution weekly deals!"}
              </p>
            )}
          </form>
        </div>

        {/* Categories */}
        <div>
          <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">
            {isNepali ? 'हार्डवेयर श्रेणीहरू' : 'Hardware Categories'}
          </h5>
          <ul className="space-y-2.5 text-xs">
            {categories.slice(0, 6).map(c => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: c.name }));
                    setCurrentView('products');
                  }}
                  className="hover:text-indigo-600 text-slate-600 transition-colors text-left cursor-pointer"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Marketplace */}
        <div>
          <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">
            {isNepali ? 'मार्केटप्लेस' : 'Marketplace'}
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button onClick={() => setCurrentView('products')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('allProducts')}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('pc_builder')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {isNepali ? 'कस्टम पीसी बिल्डर' : 'Custom PC Builder'}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('stores')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('stores')}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('orders')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('myOrders')}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('sell')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('sellHardware')}
              </button>
            </li>
            <li>
              <button
                onClick={openDashboardHub}
                className="hover:text-indigo-600 text-indigo-600 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="View and switch between all 6 live dashboards"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isNepali ? 'सबै ड्यासबोर्डहरू' : 'All Dashboards'}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">
            Nanotech Solution
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button onClick={() => setCurrentView('about')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('about')}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('contact')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {isNepali ? 'सम्पर्क तथा सहयोग' : 'Contact & Support Desk'}
              </button>
            </li>
            <li>
              <a href="https://wa.me/9779852055346" target="_blank" rel="noreferrer" className="hover:text-emerald-600 text-slate-600 transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp: 9852055346
              </a>
            </li>
            <li>
              <a href="tel:9762379999" className="hover:text-blue-600 text-slate-600 transition-colors flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {isNepali ? 'फोन:' : 'Call:'} 9762379999
              </a>
            </li>
            <li>
              <button onClick={() => setCurrentView('help')} className="hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer">
                {t('needHelp')}
              </button>
            </li>
          </ul>
        </div>

        {/* Verified Directory & Profiles */}
        <div>
          <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">
            {isNepali ? 'आधिकारिक प्रोफाइलहरू' : 'Official Profiles'}
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a
                href="https://yandex.com/maps/org/nanotech_solution/103214591764/?ll=87.276747%2C26.668157&z=15"
                target="_blank"
                rel="noreferrer"
                className="hover:text-red-600 text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span className="w-4 h-4 rounded bg-red-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">Y</span>
                <span>Yandex Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://www.cybo.com/NP/itahari-chok/computer-stores"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-600 text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span className="w-4 h-4 rounded bg-sky-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">C</span>
                <span>Cybo Directory</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/ntsith/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span className="w-4 h-4 rounded bg-[#1877F2] text-white font-black text-[9px] flex items-center justify-center shrink-0">f</span>
                <span>Facebook @ntsith</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/nanotech_it_solution/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-600 text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span className="w-4 h-4 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">IG</span>
                <span>Instagram Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 py-6 bg-slate-50/80">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nanotech Solution. {t('locationItahari')}. {isNepali ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</p>
          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => rbacNavigate('/search')}
              className="text-[11px] text-slate-500 hover:text-sky-600 transition-colors cursor-pointer flex items-center gap-1 font-medium"
              title="Dedicated User Search URL: /search"
            >
              <Search className="w-3 h-3 text-sky-500" />
              <span>User Search (/search)</span>
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => rbacNavigate('/admin')}
              className="text-[11px] text-slate-500 hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1 font-medium"
              title="Dedicated Admin URL: /admin"
            >
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Admin Portal (/admin)</span>
            </button>
            <span className="text-slate-300">·</span>
            <p className="flex items-center gap-1.5">
              {isNepali ? 'नेपालमा निर्मित' : 'Engineered for Nepal with'} <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
