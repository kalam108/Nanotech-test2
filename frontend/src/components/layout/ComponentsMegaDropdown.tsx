import React, { useEffect } from 'react';
import {
  Cpu,
  Monitor,
  CircuitBoard,
  MemoryStick,
  Database,
  Plug,
  Box,
  Fan,
  Wifi,
  ArrowRight,
  Wrench,
} from 'lucide-react';

interface ComponentCategoryItem {
  id: string;
  name: string;
  targetCategory: string;
  subtitle: string;
  icon: React.ElementType;
}

interface ComponentsMegaDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string;
  onSelectCategory: (categoryName: string) => void;
  onSelectTag: (searchQuery: string) => void;
  onOpenPcBuilder: () => void;
}

const COMPONENT_ITEMS: ComponentCategoryItem[] = [
  // Column 1
  {
    id: 'processors',
    name: 'Processors',
    targetCategory: 'Processors (CPU)',
    subtitle: 'Intel, AMD Ryzen',
    icon: Cpu,
  },
  // Column 2
  {
    id: 'graphics_cards',
    name: 'Graphics cards',
    targetCategory: 'Graphics Cards (GPU)',
    subtitle: 'RTX, Radeon',
    icon: Monitor,
  },
  // Column 3
  {
    id: 'motherboards',
    name: 'Motherboards',
    targetCategory: 'Motherboards',
    subtitle: 'B760, B650, Z790',
    icon: CircuitBoard,
  },
  // Column 1
  {
    id: 'ram',
    name: 'RAM',
    targetCategory: 'RAM / Memory',
    subtitle: 'DDR4, DDR5',
    icon: MemoryStick,
  },
  // Column 2
  {
    id: 'storage',
    name: 'Storage',
    targetCategory: 'SSD & Storage',
    subtitle: 'SSD, HDD',
    icon: Database,
  },
  // Column 3
  {
    id: 'power_supply',
    name: 'Power supply',
    targetCategory: 'Power Supply (PSU)',
    subtitle: '550W to 1000W',
    icon: Plug,
  },
  // Column 1
  {
    id: 'cabinets',
    name: 'Cabinets',
    targetCategory: 'PC Cases',
    subtitle: 'ATX, Micro-ATX',
    icon: Box,
  },
  // Column 2
  {
    id: 'cooling',
    name: 'Cooling',
    targetCategory: 'CPU Coolers',
    subtitle: 'Air, liquid, fans',
    icon: Fan,
  },
  // Column 3
  {
    id: 'networking',
    name: 'Networking',
    targetCategory: 'Networking',
    subtitle: 'Wi-Fi, routers',
    icon: Wifi,
  },
];

const POPULAR_TAGS = ['RTX 4060', 'Ryzen 5 7600', '16GB DDR5'];

export function ComponentsMegaDropdown({
  isOpen,
  onClose,
  activeCategory = '',
  onSelectCategory,
  onSelectTag,
  onOpenPcBuilder,
}: ComponentsMegaDropdownProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (targetCategory: string) => {
    onSelectCategory(targetCategory);
    onClose();
  };

  const handlePopularClick = (tag: string) => {
    onSelectTag(tag);
    onClose();
  };

  const handleBuildPcClick = () => {
    onOpenPcBuilder();
    onClose();
  };

  return (
    <div
      className="fixed sm:absolute left-3 sm:-left-36 md:-left-48 lg:-left-24 top-[148px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-[680px] md:w-[760px] lg:w-[820px] max-w-[820px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-4 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 select-none text-slate-800"
      role="region"
      aria-label="Components Menu"
      onClick={e => e.stopPropagation()}
    >
      {/* Top Body: 3-column category grid on the left + PC Builder helper card on the right */}
      <div className="flex flex-col md:flex-row gap-5 lg:gap-7">
        {/* Left: 3x3 Grid of Component Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1">
          {COMPONENT_ITEMS.map(item => {
            const IconComp = item.icon;
            const isSelected =
              activeCategory.toLowerCase().includes(item.name.toLowerCase()) ||
              activeCategory.toLowerCase().includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.targetCategory)}
                className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-orange-50/80 text-orange-600'
                    : 'hover:bg-slate-50 hover:text-orange-600 text-slate-800'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'text-orange-500 bg-orange-100/70'
                      : 'text-slate-500 group-hover:text-orange-500 group-hover:bg-orange-50'
                  }`}
                >
                  <IconComp className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-bold tracking-tight truncate transition-colors ${
                      isSelected
                        ? 'text-orange-600'
                        : 'text-slate-800 group-hover:text-orange-600'
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-400 font-normal truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Sidebar: "Not sure what fits?" Card */}
        <div className="md:w-56 lg:w-60 shrink-0 md:border-l md:border-slate-100 md:pl-5 lg:pl-6 flex flex-col justify-between pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div>
            {/* Tool / Wrench Icon */}
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 mb-2.5">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>

            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Not sure what fits?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pick parts step by step. We check compatibility.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBuildPcClick}
            className="mt-4 md:mt-auto w-full py-2.5 px-4 rounded-lg border border-orange-500 text-orange-600 hover:text-white hover:bg-orange-500 font-bold text-xs sm:text-sm text-center transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            Build my PC
          </button>
        </div>
      </div>

      {/* Bottom Bar: Popular tags on left, All components on right */}
      <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Popular Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Popular:</span>
          {POPULAR_TAGS.map((tag, idx) => (
            <React.Fragment key={tag}>
              <button
                type="button"
                onClick={() => handlePopularClick(tag)}
                className="font-semibold text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {tag}
              </button>
              {idx < POPULAR_TAGS.length - 1 && (
                <span className="text-slate-300 font-light">,</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right: All Components link */}
        <button
          type="button"
          onClick={() => handleItemClick('Components')}
          className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ml-auto"
        >
          <span>All components</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
