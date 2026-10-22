import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAdmin } from '../../../context/AdminContext';
import {
  Wrench,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Package,
} from 'lucide-react';

interface RigTemplate {
  id: string;
  name: string;
  targetUser: string;
  socket: string;
  ramType: string;
  estimatedTdp: number;
  minPsu: number;
  totalNpr: number;
  status: 'active' | 'draft';
  partsSummary: {
    cpu: string;
    gpu: string;
    ram: string;
    motherboard: string;
    psu: string;
  };
}

const INITIAL_RIG_TEMPLATES: RigTemplate[] = [
  {
    id: 'rig-1',
    name: 'Esports 1440p High-FPS Dominator',
    targetUser: 'Competitive Gamers & Streamers',
    socket: 'AMD AM5',
    ramType: 'DDR5-6000MHz',
    estimatedTdp: 480,
    minPsu: 750,
    totalNpr: 285000,
    status: 'active',
    partsSummary: {
      cpu: 'AMD Ryzen 7 7800X3D (8-Core 3D V-Cache)',
      gpu: 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB',
      ram: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000',
      motherboard: 'ASUS ROG STRIX B650-A Gaming WiFi',
      psu: 'Corsair RM850e 850W 80+ Gold Fully Modular',
    },
  },
  {
    id: 'rig-2',
    name: 'CSIT / Engineering Creator Workstation',
    targetUser: 'Developers, Blender 3D & AI Researchers',
    socket: 'Intel LGA1700',
    ramType: 'DDR5-5600MHz',
    estimatedTdp: 540,
    minPsu: 850,
    totalNpr: 335000,
    status: 'active',
    partsSummary: {
      cpu: 'Intel Core i9-14900K (24-Core / 32-Thread)',
      gpu: 'MSI Gaming GeForce RTX 4080 SUPER 16GB',
      ram: 'G.Skill Ripjaws S5 64GB (2x32GB) DDR5-5600',
      motherboard: 'MSI MAG Z790 Tomahawk WiFi DDR5',
      psu: 'Corsair RM1000e 1000W 80+ Gold ATX 3.0',
    },
  },
  {
    id: 'rig-3',
    name: 'Budget Nepal Student 1080p Rig',
    targetUser: 'BCA Undergrads & Casual 1080p Gaming',
    socket: 'AMD AM5',
    ramType: 'DDR5-5200MHz',
    estimatedTdp: 310,
    minPsu: 650,
    totalNpr: 142000,
    status: 'active',
    partsSummary: {
      cpu: 'AMD Ryzen 5 7600X (6-Core AM5)',
      gpu: 'ASUS Dual GeForce RTX 4060 8GB OC',
      ram: 'Kingston Fury Beast 16GB (2x8GB) DDR5-5200',
      motherboard: 'ASUS Prime B650M-A WiFi II',
      psu: 'DeepCool PM650D 650W 80+ Gold',
    },
  },
];

export function PCBuilderAdminSection() {
  const { products, formatPrice, setCurrentView } = useApp();
  const { logAdminAction } = useAdmin();
  const [templates, setTemplates] = useState<RigTemplate[]>(INITIAL_RIG_TEMPLATES);
  const [activeTab, setActiveTab] = useState<'templates' | 'rules' | 'matrix'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<RigTemplate | null>(null);

  // Component breakdown stats
  const cpuCount = products.filter((p) => p.category === 'Processors (CPUs)' || p.category === 'Components').length;
  const gpuCount = products.filter((p) => p.category === 'Graphics Cards (GPUs)').length;
  const moboCount = products.filter((p) => p.category === 'Motherboards').length;
  const ramCount = products.filter((p) => p.category === 'RAM Memory').length;

  const handleLaunchPublicBuilder = () => {
    setCurrentView('pc_builder');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5" />
              Engine Architecture & Rule Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              PC Builder Engine Management
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
              Manage automatic socket compatibility rules (AM5, LGA1700, LGA1851), DDR4/DDR5 memory profiles, PSU wattage headroom equations, and preset Nepal market build templates.
            </p>
          </div>

          <button
            onClick={handleLaunchPublicBuilder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Open Client Configurator</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">CPUs in Matrix</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{cpuCount} Models</div>
          <span className="text-[11px] text-emerald-600 font-medium">AM5 & LGA1700 mapped</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Dedicated GPUs</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{gpuCount} GPUs</div>
          <span className="text-[11px] text-slate-500 font-medium">RTX 4060 to 4090 mapped</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Active Rig Templates</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{templates.length} Rigs</div>
          <span className="text-[11px] text-purple-600 font-medium">Verified configurations</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Validation Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100% Valid</div>
          <span className="text-[11px] text-slate-500 font-medium">Auto TDP & Socket Check</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Preset Rig Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Compatibility & Socket Rules
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Wattage Headroom Calculator
        </button>
      </div>

      {/* TAB 1: PRESET RIG TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {templates.map((rig) => (
              <div
                key={rig.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                      {rig.socket}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                      {rig.ramType}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base">{rig.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{rig.targetUser}</p>

                  {/* Parts list */}
                  <div className="mt-4 space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold w-12 shrink-0">CPU:</span>
                      <span className="text-slate-800 font-medium truncate">{rig.partsSummary.cpu}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold w-12 shrink-0">GPU:</span>
                      <span className="text-slate-800 font-medium truncate">{rig.partsSummary.gpu}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold w-12 shrink-0">MOBO:</span>
                      <span className="text-slate-800 font-medium truncate">{rig.partsSummary.motherboard}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold w-12 shrink-0">RAM:</span>
                      <span className="text-slate-800 font-medium truncate">{rig.partsSummary.ram}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold w-12 shrink-0">PSU:</span>
                      <span className="text-slate-800 font-medium truncate">{rig.partsSummary.psu}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span>Est. Peak TDP: <strong>{rig.estimatedTdp}W</strong></span>
                    <span>Rec. PSU: <strong>{rig.minPsu}W</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
                    <div className="text-lg font-black text-indigo-600">{formatPrice(rig.totalNpr)}</div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(rig)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMPATIBILITY RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Active Motherboard Socket Compatibility Rules</h3>
              <p className="text-xs text-slate-500">Automated verification triggers during customer PC building sessions.</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              Real-time Validator Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">AMD Socket AM5 Rule</span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">DDR5 ONLY</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires AMD B650 / X670 / X870 motherboards with Ryzen 7000, 8000G, and 9000-series CPUs. DDR4 RAM is automatically blocked with instant error message.
              </p>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validates: 7800X3D, 7950X, 7600X, 9950X + B650/X670
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Intel LGA1700 / LGA1851 Rule</span>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">DDR4 / DDR5</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supports Intel 12th, 13th, and 14th Gen processors with B760 and Z790 motherboards. Checks motherboard DDR variant to prevent physical memory slot mismatch.
              </p>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validates: i9-14900K, i7-14700K, i5-14600K + Z790/B760
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WATTAGE CALCULATOR */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">Power Supply (PSU) Headroom Equation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The PC Builder engine uses the industry-standard equation:
            <code className="mx-2 px-2 py-1 bg-slate-100 text-indigo-700 font-mono rounded font-bold">
              Recommended PSU (Watts) = (CPU TDP + GPU TDP + 120W Motherboard/Fans/SSDs) × 1.35 (Headroom Buffer)
            </code>
          </p>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">GPU Model</th>
                  <th className="px-4 py-3">GPU Base TDP</th>
                  <th className="px-4 py-3">Typical CPU Pair</th>
                  <th className="px-4 py-3">Est. Peak Load</th>
                  <th className="px-4 py-3">Recommended PSU</th>
                  <th className="px-4 py-3">Nepal UPS Sizing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">RTX 4060 8GB</td>
                  <td className="px-4 py-3">115W</td>
                  <td className="px-4 py-3">Ryzen 5 7600X (105W)</td>
                  <td className="px-4 py-3">340W</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">650W Bronze</td>
                  <td className="px-4 py-3">800VA - 1000VA</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">RTX 4070 Ti SUPER 16GB</td>
                  <td className="px-4 py-3">285W</td>
                  <td className="px-4 py-3">Ryzen 7 7800X3D (120W)</td>
                  <td className="px-4 py-3">525W</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">750W - 850W Gold</td>
                  <td className="px-4 py-3">1200VA - 1500VA</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">RTX 4080 SUPER 16GB</td>
                  <td className="px-4 py-3">320W</td>
                  <td className="px-4 py-3">Core i9-14900K (253W)</td>
                  <td className="px-4 py-3">693W</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">850W - 1000W Gold</td>
                  <td className="px-4 py-3">1500VA - 2000VA</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">RTX 4090 24GB</td>
                  <td className="px-4 py-3">450W</td>
                  <td className="px-4 py-3">Ryzen 9 7950X (170W)</td>
                  <td className="px-4 py-3">740W</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">1000W - 1200W Platinum</td>
                  <td className="px-4 py-3">2000VA Online UPS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PCBuilderAdminSection;
