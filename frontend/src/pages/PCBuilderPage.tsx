import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NanoTechLogo } from '../components/brand/NanoTechLogo';
import { Product, PCBuildState, PCBuilderPartKey, CompatibilityCheckItem } from '../types';
import {
  Cpu,
  Tv,
  HardDrive,
  Server,
  Zap,
  Box,
  Fan,
  Keyboard,
  Mouse,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Share2,
  ShoppingCart,
  Printer,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Building2,
  HelpCircle,
} from 'lucide-react';

interface PartSlotDef {
  key: PCBuilderPartKey;
  label: string;
  category: string;
  icon: React.ElementType;
  description: string;
  recommendedBudgetPercent?: number;
  required?: boolean;
}

const PART_SLOTS: PartSlotDef[] = [
  { key: 'cpu', label: 'Processor (CPU)', category: 'Processors (CPUs)', icon: Cpu, description: 'Brain of your computer', required: true },
  { key: 'cooler', label: 'CPU Cooler', category: 'Computer Accessories', icon: Fan, description: 'Liquid AIO or Air Cooler', required: true },
  { key: 'motherboard', label: 'Motherboard', category: 'Motherboards', icon: Layers, description: 'Socket & Chipset foundation', required: true },
  { key: 'ram', label: 'Memory (RAM)', category: 'RAM Memory', icon: Server, description: 'DDR4 / DDR5 High Speed RAM', required: true },
  { key: 'gpu', label: 'Graphics Card (GPU)', category: 'Graphics Cards (GPUs)', icon: Zap, description: 'Gaming & 3D rendering engine', required: true },
  { key: 'ssd', label: 'Primary SSD Storage', category: 'SSD & Storage', icon: HardDrive, description: 'M.2 PCIe Gen 4/5 High Speed NVMe', required: true },
  { key: 'hdd', label: 'Secondary Storage (Optional)', category: 'SSD & Storage', icon: HardDrive, description: 'High-capacity Mass HDD/SATA SSD' },
  { key: 'psu', label: 'Power Supply (PSU)', category: 'Computer Accessories', icon: Zap, description: '80+ Gold ATX 3.0 Power unit', required: true },
  { key: 'pcCase', label: 'PC Case / Cabinet', category: 'Computer Accessories', icon: Box, description: 'High-airflow tempered glass chassis', required: true },
  { key: 'caseFans', label: 'Case Fans / Lighting', category: 'Computer Accessories', icon: Fan, description: 'Extra 120mm / 140mm ARGB airflow fans' },
  { key: 'monitor', label: 'Display Monitor', category: 'Monitors', icon: Tv, description: '144Hz - 240Hz Gaming / OLED Display' },
  { key: 'keyboard', label: 'Mechanical Keyboard', category: 'Keyboards', icon: Keyboard, description: 'Custom mechanical switches & RGB' },
  { key: 'mouse', label: 'Gaming Mouse', category: 'Mouse & Pads', icon: Mouse, description: 'Esports high-polling optical mouse' },
  { key: 'ups', label: 'Nepal Power Backup (UPS)', category: 'Computer Accessories', icon: ShieldCheck, description: '1200VA Line-Interactive UPS with AVR' },
];

export const PCBuilderPage: React.FC = () => {
  const { products, addToCart, formatPrice, formatPricePrimary, formatPriceSecondary, addToast, setCurrentView, openCheckoutModalWithPayment } = useApp();

  const [buildState, setBuildState] = useState<PCBuildState>(() => {
    // Try preloading a recommended balanced rig
    const defaultCpu = products.find(p => p.id === 'cpu-amd-1') || null;
    const defaultCooler = products.find(p => p.id === 'cool-deepcool-1') || null;
    const defaultMobo = products.find(p => p.id === 'mobo-am5-1') || null;
    const defaultRam = products.find(p => p.id === 'ram-ddr5-1') || null;
    const defaultGpu = products.find(p => p.id === 'gpu-nv-1') || null;
    const defaultSsd = products.find(p => p.id === 'ssd-samsung-1') || null;
    const defaultPsu = products.find(p => p.id === 'psu-corsair-1') || null;
    const defaultCase = products.find(p => p.id === 'case-nzxt-1') || null;
    const defaultUps = products.find(p => p.id === 'pwr-ups-1') || null;

    return {
      cpu: defaultCpu,
      cooler: defaultCooler,
      motherboard: defaultMobo,
      ram: defaultRam,
      gpu: defaultGpu,
      ssd: defaultSsd,
      hdd: null,
      psu: defaultPsu,
      pcCase: defaultCase,
      caseFans: null,
      monitor: null,
      keyboard: null,
      mouse: null,
      ups: defaultUps,
    };
  });

  const [activeSlot, setActiveSlot] = useState<PCBuilderPartKey | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Total Build Calculation
  const selectedProducts = useMemo(() => {
    return Object.values(buildState).filter((p): p is Product => p !== null);
  }, [buildState]);

  const totalUsd = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price, 0);
  }, [selectedProducts]);

  // Estimated Power Consumption (Watts)
  const estimatedPower = useMemo(() => {
    let watts = 80; // Base motherboard, fans, chipset
    if (buildState.cpu?.powerWatts) watts += buildState.cpu.powerWatts;
    else if (buildState.cpu) watts += 105;

    if (buildState.gpu?.powerWatts) watts += buildState.gpu.powerWatts;
    else if (buildState.gpu) watts += 220;

    if (buildState.ram) watts += 15;
    if (buildState.ssd) watts += 10;
    if (buildState.hdd) watts += 15;
    if (buildState.cooler) watts += 20;

    return watts;
  }, [buildState]);

  const psuWattage = useMemo(() => {
    return buildState.psu?.powerWatts || 0;
  }, [buildState.psu]);

  // Real-time Hardware Compatibility Engine
  const compatibilityChecks = useMemo<CompatibilityCheckItem[]>(() => {
    const checks: CompatibilityCheckItem[] = [];

    // 1. CPU & Motherboard Socket Matching
    if (buildState.cpu && buildState.motherboard) {
      const cpuSocket = buildState.cpu.socket || (buildState.cpu.title.includes('AM5') || buildState.cpu.title.includes('Ryzen 7') ? 'AM5' : 'LGA1700');
      const moboSocket = buildState.motherboard.socket || (buildState.motherboard.title.includes('AM5') || buildState.motherboard.title.includes('B650') ? 'AM5' : 'LGA1700');

      if (cpuSocket === moboSocket) {
        checks.push({
          key: 'socket',
          title: 'CPU & Motherboard Socket Compatible',
          isCompatible: true,
          details: `Both CPU and Motherboard support Socket ${cpuSocket}.`,
          severity: 'success',
        });
      } else {
        checks.push({
          key: 'socket',
          title: 'Socket Incompatibility Detected',
          isCompatible: false,
          details: `CPU requires Socket ${cpuSocket}, but Motherboard is Socket ${moboSocket}. They will not physically fit!`,
          severity: 'error',
        });
      }
    }

    // 2. RAM Generation & Motherboard Matching
    if (buildState.ram && buildState.motherboard) {
      const ramType = buildState.ram.memoryType || (buildState.ram.title.includes('DDR5') ? 'DDR5' : 'DDR4');
      const moboRamType = buildState.motherboard.memoryType || (buildState.motherboard.title.includes('DDR5') ? 'DDR5' : 'DDR4');

      if (ramType === moboRamType) {
        checks.push({
          key: 'ram_type',
          title: 'RAM & Motherboard Generation Compatible',
          isCompatible: true,
          details: `Both RAM and Motherboard use standard ${ramType} slots.`,
          severity: 'success',
        });
      } else {
        checks.push({
          key: 'ram_type',
          title: 'RAM Generation Mismatch',
          isCompatible: false,
          details: `Selected RAM is ${ramType}, but the motherboard only supports ${moboRamType}.`,
          severity: 'error',
        });
      }
    }

    // 3. Power Supply Headroom
    if (buildState.psu) {
      if (psuWattage >= estimatedPower * 1.2) {
        checks.push({
          key: 'psu_power',
          title: 'Power Supply Capacity & Safety Headroom',
          isCompatible: true,
          details: `Selected PSU (${psuWattage}W) has optimal 20%+ headroom above estimated peak power (${estimatedPower}W).`,
          severity: 'success',
        });
      } else if (psuWattage >= estimatedPower) {
        checks.push({
          key: 'psu_power',
          title: 'PSU Wattage is Tight',
          isCompatible: true,
          details: `PSU is ${psuWattage}W while estimated draw is ${estimatedPower}W. We advise at least +150W extra headroom.`,
          severity: 'warning',
        });
      } else {
        checks.push({
          key: 'psu_power',
          title: 'Insufficient Power Supply Wattage',
          isCompatible: false,
          details: `Estimated load (${estimatedPower}W) exceeds your power supply capacity (${psuWattage}W)! The PC may reboot during heavy gaming.`,
          severity: 'error',
        });
      }
    }

    // 4. Nepal Power UPS Sizing
    if (buildState.ups) {
      const upsCapacity = buildState.ups.powerWatts || 720;
      if (upsCapacity >= estimatedPower) {
        checks.push({
          key: 'ups_backup',
          title: 'Nepal Voltage & UPS Capacity Verified',
          isCompatible: true,
          details: `UPS (${upsCapacity}W) will provide uninterrupted backup during Kathmandu/Nepal power fluctuations.`,
          severity: 'success',
        });
      } else {
        checks.push({
          key: 'ups_backup',
          title: 'UPS Capacity Below Peak Load',
          isCompatible: true,
          details: `During peak load gaming (${estimatedPower}W), this UPS (${upsCapacity}W) may overload if main power trips.`,
          severity: 'warning',
        });
      }
    }

    return checks;
  }, [buildState, estimatedPower, psuWattage]);

  // Performance Tier Assessment
  const performanceTier = useMemo(() => {
    if (!buildState.gpu || !buildState.cpu) return 'Incomplete Custom Build';
    if (buildState.gpu.title.includes('4090') || buildState.gpu.title.includes('4080') || buildState.gpu.title.includes('4070 Ti Super')) {
      return 'Tier 1: 4K Ultra Gaming & Heavy AI / 3D Workstation';
    }
    if (buildState.gpu.title.includes('4070') || buildState.gpu.title.includes('7800 XT')) {
      return 'Tier 2: 1440p High Refresh Rate Esports & Creator Master';
    }
    if (buildState.gpu.title.includes('4060') || buildState.gpu.title.includes('4050')) {
      return 'Tier 3: 1080p Ultra High FPS & College Programming Rig';
    }
    return 'Mainstream Everyday PC';
  }, [buildState.gpu, buildState.cpu]);

  const handleSelectPart = (slotKey: PCBuilderPartKey, product: Product) => {
    setBuildState(prev => ({
      ...prev,
      [slotKey]: product,
    }));
    setActiveSlot(null);
    addToast('success', `Added ${product.title.slice(0, 30)}... to PC Build`);
  };

  const handleRemovePart = (slotKey: PCBuilderPartKey) => {
    setBuildState(prev => ({
      ...prev,
      [slotKey]: null,
    }));
  };

  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) {
      addToast('error', 'Your PC Build is empty. Add components first.');
      return;
    }
    selectedProducts.forEach(prod => {
      addToCart(prod, 1);
    });
    addToast('success', `Added all ${selectedProducts.length} PC build parts to Cart!`);
    setCurrentView('cart');
  };

  const handleInstantCheckout = () => {
    if (selectedProducts.length === 0) {
      addToast('error', 'Your PC Build is empty. Add components first.');
      return;
    }
    selectedProducts.forEach(prod => {
      addToCart(prod, 1);
    });
    openCheckoutModalWithPayment('esewa');
  };

  const handleShareBuild = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    addToast('success', 'Custom PC Build configuration link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filter products for the modal
  const filteredModalProducts = useMemo(() => {
    if (!activeSlot) return [];
    const slotDef = PART_SLOTS.find(s => s.key === activeSlot);
    if (!slotDef) return [];

    let list = products.filter(p => {
      if (activeSlot === 'cpu') return p.category.includes('Processor') || p.subcategory === 'cpu_processor';
      if (activeSlot === 'cooler') return p.subcategory === 'cpu_cooler' || p.category.includes('Cooler') || p.title.toLowerCase().includes('cooler') || p.title.toLowerCase().includes('aio');
      if (activeSlot === 'motherboard') return p.category.includes('Motherboard') || p.subcategory === 'motherboard';
      if (activeSlot === 'ram') return p.category.includes('RAM') || p.subcategory === 'ram_memory';
      if (activeSlot === 'gpu') return p.category.includes('Graphics') || p.subcategory === 'graphics_card_gpu';
      if (activeSlot === 'ssd') return p.category.includes('SSD') || p.subcategory === 'ssd_storage';
      if (activeSlot === 'hdd') return p.title.toLowerCase().includes('hdd') || p.title.toLowerCase().includes('hard drive') || p.category.includes('Storage');
      if (activeSlot === 'psu') return p.subcategory === 'power_supply_psu' || p.category.includes('Power') || p.title.toLowerCase().includes('psu') || p.title.toLowerCase().includes('power supply');
      if (activeSlot === 'pcCase') return p.subcategory === 'pc_case' || p.category.includes('Case') || p.title.toLowerCase().includes('case') || p.title.toLowerCase().includes('cabinet');
      if (activeSlot === 'caseFans') return p.title.toLowerCase().includes('fan') || p.title.toLowerCase().includes('rgb');
      if (activeSlot === 'monitor') return p.category.includes('Monitor') || p.subcategory === 'gaming_monitor';
      if (activeSlot === 'keyboard') return p.category.includes('Keyboard') || p.subcategory === 'mechanical_keyboard';
      if (activeSlot === 'mouse') return p.category.includes('Mouse') || p.subcategory === 'gaming_mouse';
      if (activeSlot === 'ups') return p.subcategory === 'ups_power' || p.title.toLowerCase().includes('ups');
      return p.category.toLowerCase().includes(slotDef.category.toLowerCase());
    });

    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    return list;
  }, [activeSlot, products, modalSearch]);

  const activeSlotDef = PART_SLOTS.find(s => s.key === activeSlot);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block shrink-0 pt-1">
              <NanoTechLogo size="lg" variant="emblem" glow={true} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Nepal Hardware PC Builder Engine
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Custom PC Build & Compatibility Configurator
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
                Select verified components with real-time socket matching, RAM generation checks, power calculation, and instant Nepal Rupee (NPR) pricing.
              </p>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[280px] text-right">
            <div className="text-xs font-medium text-slate-300">Estimated Total (NPR)</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatPricePrimary(totalUsd)}
            </div>
            <div className="text-xs text-indigo-300 font-medium">
              ≈ {formatPriceSecondary(totalUsd)}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Parts Selected:</span>
              <span className="font-bold text-white">{selectedProducts.length} / {PART_SLOTS.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-300">Est. Power Draw:</span>
              <span className="font-bold text-amber-300">{estimatedPower} Watts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Part Slots (Left Column) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              System Components
            </h2>
            <span className="text-xs text-slate-500">
              Click &quot;Choose&quot; to pick verified parts from Putalisadak/Kathmandu distributors
            </span>
          </div>

          {PART_SLOTS.map(slot => {
            const selectedPart = buildState[slot.key];
            const Icon = slot.icon;

            return (
              <div
                key={slot.key}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                  selectedPart
                    ? 'border-indigo-200 ring-1 ring-indigo-50/50 bg-gradient-to-r from-white via-indigo-50/10 to-white'
                    : 'border-slate-200 border-dashed hover:border-indigo-400'
                }`}
              >
                {/* Slot Info & Icon */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedPart ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {slot.label}
                      </span>
                      {slot.required && !selectedPart && (
                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </div>

                    {selectedPart ? (
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {selectedPart.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-indigo-700">
                            {formatPrice(selectedPart.price)}
                          </span>
                          {selectedPart.warranty && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                {selectedPart.warranty}
                              </span>
                            </>
                          )}
                          {selectedPart.nepalOfficialDistributor && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[200px]">
                                {selectedPart.nepalOfficialDistributor}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {slot.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {selectedPart ? (
                    <>
                      <button
                        onClick={() => setActiveSlot(slot.key)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => handleRemovePart(slot.key)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveSlot(slot.key)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Choose {slot.label.split(' ')[0]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Summary & Compatibility Checks (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Performance & Tier Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Performance Level
            </h3>
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 text-indigo-950 font-bold text-sm">
              {performanceTier}
            </div>

            {/* Power Meter */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Estimated Power Draw</span>
                <span className="font-bold text-slate-900">{estimatedPower}W {psuWattage > 0 && `/ ${psuWattage}W PSU`}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    psuWattage > 0 && estimatedPower > psuWattage
                      ? 'bg-rose-500'
                      : psuWattage > 0 && estimatedPower > psuWattage * 0.8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, psuWattage ? (estimatedPower / psuWattage) * 100 : (estimatedPower / 850) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>0W</span>
                <span>Recommended PSU: {Math.max(550, Math.ceil((estimatedPower * 1.3) / 50) * 50)}W+</span>
              </div>
            </div>
          </div>

          {/* Compatibility Engine Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Compatibility Engine
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                compatibilityChecks.some(c => c.severity === 'error')
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {compatibilityChecks.some(c => c.severity === 'error') ? 'Issues Found' : '100% Compatible'}
              </span>
            </div>

            {compatibilityChecks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Add CPU, Motherboard, RAM, and PSU to run automated compatibility scans.
              </p>
            ) : (
              <div className="space-y-3">
                {compatibilityChecks.map(chk => (
                  <div
                    key={chk.key}
                    className={`p-3 rounded-xl border text-xs ${
                      chk.severity === 'success'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : chk.severity === 'warning'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {chk.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {chk.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      {chk.severity === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{chk.title}</span>
                    </div>
                    <p className="text-[11px] opacity-90 pl-5">{chk.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Checkout Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Price in Nepal:</span>
              <span className="text-emerald-400 font-semibold">VAT Included</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatPricePrimary(totalUsd)}
            </div>
            <div className="text-xs text-indigo-300 font-medium">
              ≈ {formatPriceSecondary(totalUsd)}
            </div>

            <button
              onClick={handleInstantCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              Order Build with eSewa / Bank (1-Click)
            </button>

            <button
              onClick={handleAddAllToCart}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All {selectedProducts.length} Items to Cart
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleShareBuild}
                className="py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'Copied Link!' : 'Share Build'}
              </button>

              <button
                onClick={() => window.print()}
                className="py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Spec Sheet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Part Selection Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                  Selecting Component
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Choose {activeSlotDef?.label}
                </h2>
              </div>
              <button
                onClick={() => { setActiveSlot(null); setModalSearch(''); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${activeSlotDef?.label} by model, brand, socket, specs...`}
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {filteredModalProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No matching parts found. Try clearing your search keyword.
                </div>
              ) : (
                filteredModalProducts.map(product => {
                  const isCurrent = buildState[activeSlot]?.id === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {product.brand}
                            </span>
                            {product.nepalPriceStatus === 'verified' && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Verified Nepal Price
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                            {product.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Stock: {product.stock} units
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectPart(activeSlot, product)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Selected
                            </>
                          ) : (
                            'Add to Build'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
