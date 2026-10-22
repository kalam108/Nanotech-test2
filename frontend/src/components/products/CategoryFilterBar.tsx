import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Zap,
  Cpu,
  Laptop,
  Monitor,
  HardDrive,
  Server,
  Keyboard,
  Mouse,
  Headphones,
  Box,
  Fan,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface HardwareCategoryDef {
  id: string;
  label: string;
  categoryFilter: string;
  icon: React.ElementType;
  badge?: string;
  accentColor: string;
  description: string;
}

export const HARDWARE_CATEGORIES: HardwareCategoryDef[] = [
  {
    id: 'all',
    label: 'All Hardware',
    categoryFilter: 'all',
    icon: Layers,
    accentColor: 'from-slate-600 to-slate-900',
    description: 'Explore entire verified stock',
  },
  {
    id: 'gpus',
    label: 'GPUs & Graphics',
    categoryFilter: 'Graphics Cards (GPUs)',
    icon: Zap,
    badge: 'RTX 40 / RX 7000',
    accentColor: 'from-emerald-500 to-teal-700',
    description: 'NVIDIA & AMD gaming and AI cards',
  },
  {
    id: 'cpus',
    label: 'CPUs & Processors',
    categoryFilter: 'Processors (CPUs)',
    icon: Cpu,
    badge: 'Ryzen & Core',
    accentColor: 'from-blue-500 to-indigo-700',
    description: 'Intel 14th Gen & AMD Zen 4/5',
  },
  {
    id: 'laptops',
    label: 'Laptops & MacBooks',
    categoryFilter: 'Laptops',
    icon: Laptop,
    badge: 'Gaming & Workstation',
    accentColor: 'from-indigo-500 to-purple-700',
    description: 'MacBook Pro, ROG, Legion, & ThinkPad',
  },
  {
    id: 'motherboards',
    label: 'Motherboards',
    categoryFilter: 'Motherboards',
    icon: Layers,
    badge: 'AM5 & LGA1700',
    accentColor: 'from-amber-500 to-orange-700',
    description: 'ATX, Micro-ATX, and ITX boards',
  },
  {
    id: 'ram',
    label: 'RAM / Memory',
    categoryFilter: 'RAM Memory',
    icon: Server,
    badge: 'DDR5 & DDR4',
    accentColor: 'from-cyan-500 to-blue-700',
    description: 'High-speed RGB & workstation kits',
  },
  {
    id: 'storage',
    label: 'SSDs & Storage',
    categoryFilter: 'SSD & Storage',
    icon: HardDrive,
    badge: 'NVMe Gen4/5',
    accentColor: 'from-rose-500 to-pink-700',
    description: 'M.2 PCIe SSDs & high capacity drives',
  },
  {
    id: 'desktops',
    label: 'Desktop PCs',
    categoryFilter: 'Desktop PCs',
    icon: Monitor,
    badge: 'Prebuilts & Rigs',
    accentColor: 'from-violet-500 to-purple-800',
    description: 'Custom gaming rigs & studio stations',
  },
  {
    id: 'monitors',
    label: 'Displays & Monitors',
    categoryFilter: 'Monitors',
    icon: Monitor,
    badge: '144Hz–240Hz',
    accentColor: 'from-sky-500 to-blue-800',
    description: 'Fast IPS, 4K UHD, & Curved OLED',
  },
  {
    id: 'keyboards',
    label: 'Keyboards',
    categoryFilter: 'Keyboards',
    icon: Keyboard,
    badge: 'Mechanical',
    accentColor: 'from-fuchsia-500 to-pink-700',
    description: 'Custom mechanical, wireless & RGB',
  },
  {
    id: 'mouse',
    label: 'Mouse & Pads',
    categoryFilter: 'Mouse & Pads',
    icon: Mouse,
    badge: 'Esports',
    accentColor: 'from-emerald-600 to-teal-800',
    description: 'Lightweight sensors & desk mats',
  },
  {
    id: 'audio',
    label: 'Headphones & Audio',
    categoryFilter: 'Headphones & Audio',
    icon: Headphones,
    badge: 'Studio Sound',
    accentColor: 'from-amber-600 to-yellow-800',
    description: 'Spatial 7.1 headsets & noise cancelling',
  },
  {
    id: 'cooling',
    label: 'Coolers & AIO',
    categoryFilter: 'CPU Coolers & AIO',
    icon: Fan,
    badge: 'Liquid & Air',
    accentColor: 'from-cyan-600 to-teal-800',
    description: '360mm AIO liquid coolers & fans',
  },
  {
    id: 'cases',
    label: 'PC Cases / Cabinets',
    categoryFilter: 'PC Cases / Cabinets',
    icon: Box,
    badge: 'Tempered Glass',
    accentColor: 'from-slate-700 to-zinc-900',
    description: 'Dual chamber & panoramic airflow chassis',
  },
];

interface CategoryFilterBarProps {
  activeCategory: string;
  onSelectCategory: (categoryFilter: string) => void;
  productsCountByCategory?: Record<string, number>;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  productsCountByCategory = {},
}) => {
  const isSelected = (cat: HardwareCategoryDef) => {
    if (cat.id === 'all') {
      return !activeCategory || activeCategory === 'all';
    }
    const current = (activeCategory || '').toLowerCase();
    const target = cat.categoryFilter.toLowerCase();
    return current === target || current.includes(cat.id);
  };

  return (
    <div className="w-full space-y-3">
      {/* Horizontal Scrollable Capsule Tabs */}
      <div className="relative">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {HARDWARE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = isSelected(cat);
            const count = productsCountByCategory[cat.id] ?? productsCountByCategory[cat.categoryFilter];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.categoryFilter)}
                className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <span>{cat.label}</span>

                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
