import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NanoTechLogo } from '../components/brand/NanoTechLogo';
import { StoreLocationMap } from '../components/location/StoreLocationMap';
import {
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Store,
  Cpu,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ExternalLink,
  Award,
  Send,
} from 'lucide-react';

export function AboutPage() {
  const { setCurrentView } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-700 font-sans">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center">
          <NanoTechLogo size="xl" variant="emblem" glow={true} />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          Official Hardware & Custom PC Solutions
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500">Nanotech Solution</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Nanotech Solution is your premier high-performance computer hardware provider, custom PC builder, and verified technology retailer located in Itahari, Nepal.
        </p>
      </div>

      {/* Official Headquarters Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              Main Store & Workshop
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Nanotech Solution Flagship Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Serving tech enthusiasts, gamers, content creators, and businesses with authentic components, genuine warranties, and professional diagnostic support.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/9779852055346"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href="tel:9762379999"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition active:scale-95"
              >
                <Phone className="w-4 h-4 text-indigo-300" />
                Call 9762379999
              </a>
            </div>
          </div>

          {/* Quick Details Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 space-y-3.5 text-xs text-slate-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Store Address</strong>
                <span>Itahari-6, National Galli, Sunsari, Nepal</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Contact Number</strong>
                <span>+977 9762379999</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Official WhatsApp</strong>
                <span>+977 9852055346</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Email Address</strong>
                <span>ntsolution68@gmail.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Store Hours</strong>
                <span className="text-xs text-slate-300">
                  Sun–Wed & Fri: 8:00 AM – 7:00 PM<br />
                  Thu: 9:00 AM – 7:00 PM<br />
                  <span className="text-amber-400 font-bold">Saturday: CLOSED (Weekly Holiday)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Directory and Social Badges */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
          <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block mb-3">
            Official Online Profiles & Mapping Directories
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href="https://yandex.com/maps/org/nanotech_solution/103214591764/?ll=87.276747%2C26.668157&z=15"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition flex items-center gap-2.5 text-xs font-semibold"
            >
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">Y</span>
              <div className="truncate">
                <span className="block font-bold">Yandex Maps</span>
                <span className="text-[10px] text-slate-300">Org #103214591764</span>
              </div>
            </a>

            <a
              href="https://www.cybo.com/NP/itahari-chok/computer-stores"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition flex items-center gap-2.5 text-xs font-semibold"
            >
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">C</span>
              <div className="truncate">
                <span className="block font-bold">Cybo Directory</span>
                <span className="text-[10px] text-slate-300">Itahari Computer Stores</span>
              </div>
            </a>

            <a
              href="https://www.facebook.com/ntsith/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition flex items-center gap-2.5 text-xs font-semibold"
            >
              <span className="w-6 h-6 rounded-lg bg-[#1877F2] text-white font-black text-xs flex items-center justify-center shrink-0">f</span>
              <div className="truncate">
                <span className="block font-bold">Facebook Page</span>
                <span className="text-[10px] text-slate-300">fb.com/ntsith</span>
              </div>
            </a>

            <a
              href="https://www.instagram.com/nanotech_it_solution/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition flex items-center gap-2.5 text-xs font-semibold"
            >
              <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">IG</span>
              <div className="truncate">
                <span className="block font-bold">Instagram</span>
                <span className="text-[10px] text-slate-300">@nanotech_it_solution</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Location Map & Live Weather Panel */}
      <StoreLocationMap />

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-xs hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">100% Genuine Hardware</h3>
          <p className="text-slate-500 leading-relaxed">
            All graphics cards, processors, motherboards, and gaming accessories are sourced directly from authorized importers with valid manufacturer warranty.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-xs hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Custom Rig Assembly</h3>
          <p className="text-slate-500 leading-relaxed">
            Precision cable management, optimized airflow dynamics, custom liquid-cooling loops, and rigorous multi-hour stress testing for maximum stability.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-xs hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Direct Customer Care</h3>
          <p className="text-slate-500 leading-relaxed">
            Personalized advice, instant WhatsApp consultation, and fast warranty RMA assistance directly from our Itahari workshop.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { addToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('success', 'Message sent! Nanotech Solution team will get back to you shortly.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5 text-indigo-600" />
          Get in Touch
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Contact <span className="text-indigo-600">Nanotech Solution</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Need hardware recommendations, custom PC quote, or warranty help? Visit our store or reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Store Address Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Store Location</span>
                <h4 className="text-sm font-bold text-slate-900">Itahari-6, National Galli</h4>
              </div>
            </div>
            <p className="text-xs text-slate-500 pl-13">
              National Galli, Itahari-6, Sunsari District, Koshi Province, Nepal.
            </p>
          </div>

          {/* WhatsApp Direct Card */}
          <a
            href="https://wa.me/9779852055346"
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-50/80 hover:bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-xs flex items-center justify-between group transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Direct WhatsApp</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  +977 9852055346
                </h4>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Phone Call Card */}
          <a
            href="tel:9762379999"
            className="bg-blue-50/80 hover:bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-xs flex items-center justify-between group transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-blue-800 tracking-wider">Hotline / Contact No.</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                  9762379999
                </h4>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Email Card */}
          <a
            href="mailto:ntsolution68@gmail.com"
            className="bg-purple-50/80 hover:bg-purple-50 border border-purple-200 p-5 rounded-2xl shadow-xs flex items-center justify-between group transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-purple-800 tracking-wider">Official Gmail</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                  ntsolution68@gmail.com
                </h4>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Business Hours Detailed Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Store Hours & Schedule</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Itahari Time
              </span>
            </div>

            <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2.5">
              <div className="flex justify-between items-center text-slate-300">
                <span>Sunday</span>
                <span className="font-semibold text-white">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Monday</span>
                <span className="font-semibold text-white">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Tuesday</span>
                <span className="font-semibold text-white">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Wednesday</span>
                <span className="font-semibold text-white">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-amber-300 font-medium">Thursday</span>
                <span className="font-semibold text-amber-300">9:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Friday</span>
                <span className="font-semibold text-white">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-lg">
                <span>Saturday</span>
                <span>CLOSED (Weekly Holiday)</span>
              </div>
            </div>
          </div>

          {/* Social Profiles & Online Business Directories */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2.5">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
              Official Profiles & Directories
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="https://yandex.com/maps/org/nanotech_solution/103214591764/?ll=87.276747%2C26.668157&z=15"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold flex items-center gap-2 transition group"
              >
                <span className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-black text-[10px]">Y</span>
                <span className="truncate">Yandex Maps</span>
              </a>

              <a
                href="https://www.cybo.com/NP/itahari-chok/computer-stores"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold flex items-center gap-2 transition group"
              >
                <span className="w-5 h-5 rounded bg-sky-600 text-white flex items-center justify-center font-black text-[10px]">C</span>
                <span className="truncate">Cybo Directory</span>
              </a>

              <a
                href="https://www.facebook.com/ntsith/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold flex items-center gap-2 transition group"
              >
                <span className="w-5 h-5 rounded bg-[#1877F2] text-white flex items-center justify-center font-black text-[10px]">f</span>
                <span className="truncate">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/nanotech_it_solution/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold flex items-center gap-2 transition group"
              >
                <span className="w-5 h-5 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px]">IG</span>
                <span className="truncate">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Thank You for Reaching Out!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your message has been sent to the Nanotech Solution engineering desk. We will respond to <strong>{formData.email || 'your email'}</strong> or call you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', message: '' });
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Raju Khadka"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.name@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">How Can We Help You? *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the hardware you need, custom PC specifications, or inquiry details..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Nanotech Solution</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Map & Live Store Intelligence */}
      <div className="pt-8 border-t border-slate-200">
        <StoreLocationMap />
      </div>
    </div>
  );
}

export function HelpPage() {
  const faqs = [
    {
      q: 'Where is Nanotech Solution physically located in Nepal?',
      a: 'Our flagship store and hardware service workshop is located at Itahari-6, National Galli, Sunsari, Nepal. You can visit us in person or reach us at 9762379999 / WhatsApp: 9852055346.',
    },
    {
      q: 'Do you deliver computer components outside of Itahari?',
      a: 'Yes! We provide safe antistatic courier delivery across all 7 provinces in Nepal (Kathmandu, Pokhara, Biratnagar, Dharan, Chitwan, Butwal, etc.) with insured tracking.',
    },
    {
      q: 'How do I claim official manufacturer warranty?',
      a: 'All items purchased from Nanotech Solution come with genuine importer warranty cards and VAT bills. You can bring defective parts to our store in Itahari-6 or ship them to us for RMA processing.',
    },
    {
      q: 'Can Nanotech Solution build custom gaming PCs and workstations?',
      a: 'Yes! We configure custom liquid-cooled gaming rigs, 3D rendering workstations, and budget esports builds. Contact us via WhatsApp (9852055346) or phone (9762379999) for free configuration advice.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-slate-500">Everything you need to know about buying, custom builds, and hardware support</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7.5">{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Quick Contact Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-slate-900 text-sm">Still have questions?</h4>
          <p className="text-slate-600">Our Itahari hardware support team is ready to assist you.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:9762379999"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition"
          >
            Call 9762379999
          </a>
          <a
            href="https://wa.me/9779852055346"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
