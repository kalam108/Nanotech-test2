import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { HardwareAIRobotIcon } from '../layout/HardwareAIRobotIcon';
import { requestAIAdvice } from '../../lib/serverClient';
import {
  Bot,
  Send,
  Sparkles,
  X,
  ChevronRight,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface AIProductAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProduct?: Product;
  structuredDetails?: {
    whyBuy: string;
    whoShouldBuy: string;
    whoShouldAvoid: string;
    valueRating: string;
    upgradePotential: string;
    nepalSource: string;
  };
}

export function AIProductAdvisor({ isOpen, onClose }: AIProductAdvisorProps) {
  const { products, formatPrice, setSelectedProductId, setCurrentView, openAddToCartModal } = useApp();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Namaste! I am your Nepal Computer & Laptop Market Intelligence AI. Tell me your budget in NPR (e.g. "under 1.5 Lakhs", "under 80,000"), your college/profession (BCA, CS, Gaming, Video Editing, AI/ML), and I will give you verified Nepal hardware recommendations with authorized distributor pricing.',
    },
  ]);

  if (!isOpen) return null;

  const samplePrompts = [
    'Best laptop for BCA student under 80000 NPR',
    'Gaming laptop with RTX under 150000 NPR',
    'Best AI & programming laptop (Copilot+ / MacBook)',
    'Can I run RTX 4070 Ti Super on 750W PSU in Nepal?',
    'Best 240Hz Gaming Monitor in Nepal',
  ];

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    const userMsg: MessageItem = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      // 1. Fetch live response from backend Express server
      const backendResponse = await requestAIAdvice(query);
      const serverAdvice = backendResponse.result || '';

      // 2. Intelligent Nepal catalog matching
      const q = query.toLowerCase();
      let matchedProduct: Product | undefined;
      let why = '';
      let whoBuy = '';
      let whoAvoid = '';
      let value = '9.5 / 10';
      let upgrade = '';
      let source = '';

      if (q.includes('bca') || q.includes('student') || q.includes('60000') || q.includes('70000') || q.includes('80000') || q.includes('under 80')) {
        matchedProduct = products.find(p => p.id === 'lap-stud-1') || products.find(p => p.subcategory === 'student_laptop');
        why = 'Equipped with a 10-core Core i5 processor, 16GB dual-channel RAM, and metal top lid at only NPR 67,000. Easily handles C++, Java, Python, VS Code, and database labs.';
        whoBuy = 'BCA, BSc. CSIT, Engineering students, and office professionals seeking reliable productivity under NPR 75k.';
        whoAvoid = 'Hardcore competitive gamers demanding high-end ray tracing.';
        value = '9.9 / 10 (Highest value in Nepal student tier)';
        upgrade = 'Dual DDR4 slots upgradable to 32GB; M.2 NVMe SSD upgradable to 2TB.';
        source = 'Ocean Computers Nepal / Putalisadak Market Verified';
      } else if (q.includes('game') || q.includes('gaming') || q.includes('150000') || q.includes('1.5') || q.includes('rtx') || q.includes('110000') || q.includes('120000')) {
        matchedProduct = products.find(p => p.id === 'lap-game-2') || products.find(p => p.subcategory === 'gaming_laptop');
        why = 'Featuring NVIDIA GeForce RTX 4050 with DLSS 3 and high-airflow dual-fan thermals. Runs GTA V, Valorant (200+ FPS), Cyberpunk 2077, and Premiere Pro video timelines.';
        whoBuy = 'Gamers, animation students, and developers wanting a dedicated GPU under NPR 110,000.';
        whoAvoid = 'Users who need all-day 15+ hour battery without carrying a charger.';
        value = '9.8 / 10';
        upgrade = 'Dual DDR5 SODIMM slots (up to 32GB) and secondary M.2 Gen4 SSD slot.';
        source = 'Authorized Importer / New Road & Putalisadak';
      } else if (q.includes('ai') || q.includes('copilot') || q.includes('snapdragon') || q.includes('ryzen ai') || q.includes('zenbook') || q.includes('slim')) {
        matchedProduct = products.find(p => p.id === 'lap-ai-1') || products.find(p => p.subcategory === 'ai_copilot_laptop');
        why = 'Equipped with 45 TOPS Qualcomm Hexagon NPU, ultrathin 1.28kg body, 3K PureSight OLED, and revolutionary 22+ hour battery life.';
        whoBuy = 'AI researchers, software architects, corporate executives, and mobile developers.';
        whoAvoid = 'Users requiring niche legacy x86 kernel drivers.';
        value = '9.6 / 10';
        upgrade = 'M.2 PCIe Gen 4 SSD upgradable; 32GB RAM factory integrated.';
        source = 'Megatech Trade Group Lenovo Nepal';
      } else if (q.includes('apple') || q.includes('macbook') || q.includes('mac') || q.includes('m3')) {
        matchedProduct = products.find(p => p.id === 'lap-apple-1') || products.find(p => p.subcategory === 'apple_macbook');
        why = 'Blazing fast Apple Silicon M3, 16GB Unified Memory, zero fan noise, and 18-hour battery. Compiles code instantly and connects to dual external displays.';
        whoBuy = 'iOS / Flutter / React developers, UI/UX designers, and students in the Apple ecosystem.';
        whoAvoid = 'PC gamers needing Windows DirectX 12 native titles.';
        value = '9.4 / 10';
        upgrade = 'Non-upgradable internal RAM/SSD; supports 40Gbps external Thunderbolt 4 storage.';
        source = 'Generation Next Communications (GenNext Nepal) / Oliz Store';
      } else if (q.includes('monitor') || q.includes('240hz') || q.includes('oled') || q.includes('screen')) {
        matchedProduct = products.find(p => p.id === 'mon-lg-1') || products.find(p => p.subcategory === 'gaming_monitor');
        why = 'True OLED infinite contrast, 0.03ms instant pixel response, 240Hz refresh, and factory color calibration with 98.5% DCI-P3.';
        whoBuy = 'Esports competitive gamers, colorists, and video editors.';
        whoAvoid = 'Basic office spreadsheets with static text 24/7.';
        value = '9.3 / 10';
        upgrade = 'Standard VESA 100x100mm mounting.';
        source = 'Chaudhary Group (CG) Electronics Nepal';
      } else if (q.includes('gpu') || q.includes('4070') || q.includes('graphics') || q.includes('psu') || q.includes('750w')) {
        matchedProduct = products.find(p => p.id === 'gpu-nv-1') || products.find(p => p.subcategory === 'graphics_card_gpu');
        why = 'Yes! A quality 750W 80+ Gold PSU has plenty of headroom for the 285W RTX 4070 Ti Super with 16GB VRAM. It delivers flawless 1440p / 4K gaming and fast local AI LLM inference.';
        whoBuy = 'High-end PC builders, 3D artists (Blender/Maya), and AI developers in Nepal.';
        whoAvoid = 'Ultra-compact mini-ITX cases with under 300mm clearance.';
        value = '9.5 / 10';
        upgrade = 'Requires 1x 16-pin 12VHPWR (adapter included).';
        source = 'Nagmani International ASUS Nepal';
      } else {
        matchedProduct = products.find(p => p.isFeatured) || products[0];
        why = 'High performance verified hardware with official Nepal authorized distributor warranty.';
        whoBuy = 'Tech enthusiasts, engineers, and gamers in Nepal.';
        whoAvoid = 'Non-tech everyday browsing users.';
        value = '9.2 / 10';
        upgrade = 'Standard modular components.';
        source = 'Putalisadak & New Road Market Directory';
      }

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: serverAdvice || `Here is the verified hardware market intelligence for "${query}":`,
        recommendedProduct: matchedProduct,
        structuredDetails: {
          whyBuy: why,
          whoShouldBuy: whoBuy,
          whoShouldAvoid: whoAvoid,
          valueRating: value,
          upgradePotential: upgrade,
          nepalSource: source,
        },
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Advisor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-[14px] p-[2px] conic-gradient-360 animate-spin-360 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-[#070b18] rounded-[12px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <HardwareAIRobotIcon className="w-5 h-5 text-indigo-300 relative z-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  Nepal Hardware AI Advisor <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                  <Server className="w-2.5 h-2.5 text-emerald-400" /> Backend
                </span>
              </div>
              <p className="text-[10px] text-indigo-300 font-semibold">
                Market Intelligence & Compatibility Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-semibold rounded-br-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-lg'
                }`}
              >
                <p className="mb-2">{msg.text}</p>

                {/* Structured Recommendation Card */}
                {msg.recommendedProduct && msg.structuredDetails && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-3">
                    <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <img
                        src={msg.recommendedProduct.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150'}
                        alt={msg.recommendedProduct.title}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">
                          {msg.recommendedProduct.brand} • {msg.recommendedProduct.category}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate mt-0.5">
                          {msg.recommendedProduct.title}
                        </h4>
                        <div className="text-emerald-400 font-extrabold text-xs mt-1">
                          {formatPrice(msg.recommendedProduct.price)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-300 shrink-0">Why this product:</span>
                        <span className="text-slate-300">{msg.structuredDetails.whyBuy}</span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-300">Who should buy: </span>
                          <span className="text-slate-300">{msg.structuredDetails.whoShouldBuy}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <ThumbsDown className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-300">Who should avoid: </span>
                          <span className="text-slate-300">{msg.structuredDetails.whoShouldAvoid}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-amber-300 shrink-0">Upgrade Potential:</span>
                        <span className="text-slate-300">{msg.structuredDetails.upgradePotential}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]">
                        <span className="text-slate-400">Value Rating: <strong className="text-white">{msg.structuredDetails.valueRating}</strong></span>
                        <span className="text-indigo-300">{msg.structuredDetails.nepalSource}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => openAddToCartModal(msg.recommendedProduct!, 1)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Buy with eSewa / Bank
                      </button>

                      <button
                        onClick={() => handleProductDetail(msg.recommendedProduct!.id)}
                        className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition"
                      >
                        View Specs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3.5 rounded-2xl text-xs text-indigo-300 flex items-center gap-2.5 border border-indigo-500/30">
                <Cpu className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Searching verified Nepal hardware catalog & benchmarks...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            Popular Nepal Market Queries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sp)}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition text-left truncate max-w-full"
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask: 'Laptop under 1.2 Lakhs for BCA' or 'RTX 4070 in Nepal'..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1 bg-slate-900 text-white text-xs placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
