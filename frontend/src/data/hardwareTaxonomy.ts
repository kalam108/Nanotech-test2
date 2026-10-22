import React from 'react';
import {
  Cpu,
  Keyboard,
  Laptop,
  Monitor,
  Cable,
  Wifi,
  Printer,
  HardDrive,
  Zap,
  Gamepad2,
  Wrench,
  Server,
  Layers,
  Box,
} from 'lucide-react';

export interface SubcategoryItem {
  id: string;
  name: string;
  keywords: string[];
}

export interface HardwareCategoryTaxonomy {
  id: string;
  number: number;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  description: string;
  subcategories: SubcategoryItem[];
}

export const HARDWARE_TAXONOMY: HardwareCategoryTaxonomy[] = [
  {
    id: 'hardware_accessories',
    number: 1,
    name: 'Hardware & Accessories',
    slug: 'hardware-accessories',
    icon: Box,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    description: 'Complete hardware systems, computer peripherals, accessories, and components',
    subcategories: [
      { id: 'desktop_computers', name: 'Desktop Computers', keywords: ['desktop', 'pc', 'all-in-one', 'workstation', 'rig', 'tower'] },
      { id: 'laptops_portables', name: 'Laptops & Portables', keywords: ['laptop', 'notebook', 'ultrabook', 'macbook', 'gaming laptop'] },
      { id: 'peripherals', name: 'Computer Peripherals', keywords: ['keyboard', 'mouse', 'webcam', 'headset', 'mic', 'speakers'] },
      { id: 'cables_docks', name: 'Cables & Docks', keywords: ['cable', 'adapter', 'dock', 'hub', 'hdmi', 'usb-c'] },
      { id: 'power_backup', name: 'Power & Backup', keywords: ['ups', 'surge protector', 'power strip', 'battery'] },
      { id: 'storage_media', name: 'Storage & Media', keywords: ['ssd', 'external drive', 'flash drive', 'sd card'] },
    ],
  },
  {
    id: 'components',
    number: 2,
    name: 'Computer Components',
    slug: 'computer-components',
    icon: Cpu,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    description: 'Core PC components, processors, motherboards, GPUs, power, and chassis',
    subcategories: [
      { id: 'cpu', name: 'Processors (CPU)', keywords: ['cpu', 'processor', 'ryzen', 'intel core', 'ultra 9', '9800x3d', '7800x3d', '14700k'] },
      { id: 'motherboards', name: 'Motherboards', keywords: ['motherboard', 'mainboard', 'b650', 'x870', 'z790', 'z890', 'am5', 'lga'] },
      { id: 'ram', name: 'RAM / Memory', keywords: ['ram', 'memory', 'ddr4', 'ddr5', 'trident', 'vengeance', 'dominator'] },
      { id: 'gpu', name: 'Graphics Cards (GPU)', keywords: ['gpu', 'graphics card', 'geforce', 'rtx', 'radeon', 'rx 7900', '4090', '4080', '4070'] },
      { id: 'ssd', name: 'SSD', keywords: ['ssd', 'nvme', 'm.2', 'gen4', 'gen5', '990 pro', 'sn850x', 't705'] },
      { id: 'hdd', name: 'HDD', keywords: ['hdd', 'hard drive', 'barracuda', 'ironwolf', 'wd blue', 'wd red'] },
      { id: 'psu', name: 'Power Supply (PSU)', keywords: ['psu', 'power supply', 'rm1000x', 'rm850e', 'seasonic', 'vertex', 'atx 3.0', 'modular'] },
      { id: 'pc_cases', name: 'PC Cases', keywords: ['case', 'cabinet', 'chassis', 'o11', 'h9 flow', 'h5 flow', 'fractal north'] },
      { id: 'cpu_coolers', name: 'CPU Coolers', keywords: ['cooler', 'aio', 'liquid cooler', 'nh-d15', 'kraken', 'galahad', 'ls720'] },
      { id: 'case_fans', name: 'Case Fans', keywords: ['fan', 'argb fan', '120mm', '140mm', 'sl-inf', 'silent wings'] },
      { id: 'thermal_paste', name: 'Thermal Paste', keywords: ['thermal paste', 'thermal grease', 'kryonaut', 'mx-4', 'nt-h1'] },
      { id: 'sound_cards', name: 'Sound Cards', keywords: ['sound card', 'sound blaster', 'dac', 'audio card'] },
      { id: 'nic', name: 'Network Interface Cards (NIC)', keywords: ['nic', 'network card', 'pci wifi', '10g lan', '2.5g nic'] },
      { id: 'capture_cards', name: 'Capture Cards', keywords: ['capture card', 'cam link', 'elgato 4k', 'avermedia'] },
      { id: 'optical_drives', name: 'Optical Drives', keywords: ['dvd drive', 'blu-ray', 'optical drive', 'external writer'] },
    ],
  },
  {
    id: 'computer_accessories',
    number: 3,
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    icon: Keyboard,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    description: 'Keyboards, mice, webcams, audio gear, and desktop utility accessories',
    subcategories: [
      { id: 'keyboard', name: 'Keyboard', keywords: ['keyboard', 'mechanical keyboard', 'wooting', 'keychron'] },
      { id: 'mouse', name: 'Mouse', keywords: ['mouse', 'superlight', 'viper v3', 'deathadder', 'g502'] },
      { id: 'mouse_pad', name: 'Mouse Pad', keywords: ['mouse pad', 'desk mat', 'artisan', 'qck', 'speed pad'] },
      { id: 'webcam', name: 'Webcam', keywords: ['webcam', 'brio', 'c920', 'facecam', '4k streaming cam'] },
      { id: 'headphones', name: 'Headphones', keywords: ['headphones', 'hd 660s2', 'studio headphones', 'audiophile'] },
      { id: 'headsets', name: 'Headsets', keywords: ['headset', 'arctis nova', 'cloud ii', 'blackshark'] },
      { id: 'speakers', name: 'Speakers', keywords: ['speakers', 'desktop audio', 'edifier', 'audioengine', 'soundbar'] },
      { id: 'microphones', name: 'Microphones', keywords: ['microphone', 'shure sm7', 'yeti', 'quadcast', 'wave 3'] },
      { id: 'usb_hub', name: 'USB Hub', keywords: ['usb hub', 'multiport hub', 'usb splitter', 'powered hub'] },
      { id: 'laptop_stand', name: 'Laptop Stand', keywords: ['laptop stand', 'aluminum stand', 'vertical stand', 'riser'] },
      { id: 'monitor_stand', name: 'Monitor Stand', keywords: ['monitor stand', 'desk shelf', 'monitor riser'] },
      { id: 'docking_station', name: 'Docking Station', keywords: ['docking station', 'caldigit ts4', 'thunderbolt dock'] },
      { id: 'card_reader', name: 'Card Reader', keywords: ['card reader', 'sd reader', 'cfexpress reader', 'micro sd adapter'] },
      { id: 'usb_flash_drive', name: 'USB Flash Drive', keywords: ['flash drive', 'pen drive', 'usb drive', 'thumb drive'] },
      { id: 'stylus_pen', name: 'Stylus Pen', keywords: ['stylus', 'apple pencil', 'wacom pen', 'touch pen'] },
    ],
  },
  {
    id: 'laptops_computers',
    number: 4,
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    icon: Laptop,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    badgeBg: 'bg-sky-100 text-sky-800',
    description: 'Gaming laptops, ultra-portables, MacBooks, chargers, batteries, and parts',
    subcategories: [
      { id: 'laptops', name: 'Laptops', keywords: ['laptop', 'macbook', 'legion', 'zenbook', 'zephyrus', 'nitro', 'yoga', 'aspire'] },
      { id: 'laptop_chargers', name: 'Laptop Chargers', keywords: ['laptop charger', 'power adapter', 'type-c charger', 'gan 100w', 'magsafe'] },
      { id: 'laptop_batteries', name: 'Laptop Batteries', keywords: ['laptop battery', 'replacement battery', 'li-ion pack'] },
      { id: 'laptop_keyboards', name: 'Laptop Keyboards', keywords: ['laptop keyboard', 'replacement keyboard', 'backlit keyboard'] },
      { id: 'laptop_screens', name: 'Laptop Screens', keywords: ['laptop screen', 'lcd panel', 'oled replacement', '144hz screen'] },
      { id: 'laptop_hinges', name: 'Laptop Hinges', keywords: ['laptop hinge', 'hinge repair', 'screen bracket'] },
      { id: 'laptop_cooling_pads', name: 'Laptop Cooling Pads', keywords: ['cooling pad', 'laptop cooler', 'turbofan', 'cooler master'] },
      { id: 'laptop_bags', name: 'Laptop Bags', keywords: ['laptop bag', 'backpack', 'messenger bag', 'tech backpack'] },
      { id: 'laptop_sleeves', name: 'Laptop Sleeves', keywords: ['laptop sleeve', 'neoprene sleeve', 'protective case'] },
      { id: 'laptop_docking_stations', name: 'Laptop Docking Stations', keywords: ['laptop dock', 'type-c dock', 'universal hub'] },
    ],
  },
  {
    id: 'monitors_displays',
    number: 5,
    name: 'Monitors & Displays',
    slug: 'monitors-displays',
    icon: Monitor,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    badgeBg: 'bg-violet-100 text-violet-800',
    description: 'High refresh gaming monitors, curved displays, 4K panels, and monitor arms',
    subcategories: [
      { id: 'led_monitors', name: 'LED Monitors', keywords: ['led monitor', 'full hd monitor', 'office monitor'] },
      { id: 'ips_monitors', name: 'IPS Monitors', keywords: ['ips monitor', 'color accurate', 'srgb 99%'] },
      { id: 'gaming_monitors', name: 'Gaming Monitors', keywords: ['gaming monitor', 'ultragear', 'odyssey', '144hz', '240Hz', '0.03ms'] },
      { id: 'curved_monitors', name: 'Curved Monitors', keywords: ['curved monitor', '1000r', '1500r', 'ultrawide', '49 inch'] },
      { id: '4k_monitors', name: '4K Monitors', keywords: ['4k monitor', 'uhd', '3840x2160', 'creator monitor'] },
      { id: 'portable_monitors', name: 'Portable Monitors', keywords: ['portable monitor', 'type-c portable', '15.6 usb-c display'] },
      { id: 'monitor_arms', name: 'Monitor Arms', keywords: ['monitor arm', 'gas spring mount', 'desk mount arm', 'dual arm'] },
      { id: 'display_adapters', name: 'Display Adapters', keywords: ['display adapter', 'hdmi to dp', 'type-c to hdmi', 'active adapter'] },
    ],
  },
  {
    id: 'cables_adapters',
    number: 6,
    name: 'Cables & Adapters',
    slug: 'cables-adapters',
    icon: Cable,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-800',
    description: 'High-speed video, data, networking, and power interconnect cables',
    subcategories: [
      { id: 'hdmi_cables', name: 'HDMI Cables', keywords: ['hdmi cable', 'hdmi 2.1', 'ultra high speed', '4k 120hz', '8k'] },
      { id: 'vga_cables', name: 'VGA Cables', keywords: ['vga cable', 'd-sub', 'male to male vga'] },
      { id: 'displayport_cables', name: 'DisplayPort Cables', keywords: ['displayport', 'dp 1.4', 'dp 2.1', 'vesa certified'] },
      { id: 'usb_c_cables', name: 'USB-C Cables', keywords: ['usb-c cable', 'thunderbolt 4', '100w pd', 'usb4'] },
      { id: 'usb_a_cables', name: 'USB-A Cables', keywords: ['usb-a cable', 'usb 3.0 cable', 'printer cable usb a-b'] },
      { id: 'ethernet_lan_cables', name: 'Ethernet / LAN Cables', keywords: ['ethernet cable', 'cat6', 'cat7', 'cat8', 'patch cord', 'rj45'] },
      { id: 'sata_cables', name: 'SATA Cables', keywords: ['sata cable', 'sata iii', 'sata power cable', 'data cable 6gbps'] },
      { id: 'power_cables', name: 'Power Cables', keywords: ['power cable', 'desktop power cord', 'iec c13', 'ac power cord'] },
      { id: 'usb_adapters', name: 'USB Adapters', keywords: ['usb adapter', 'usb 3.0 to usb-c', 'angle adapter'] },
      { id: 'otg_adapters', name: 'OTG Adapters', keywords: ['otg adapter', 'type-c otg', 'micro usb otg'] },
      { id: 'type_c_adapters', name: 'Type-C Adapters', keywords: ['type-c adapter', 'usb-c to aux', 'usb-c to ethernet'] },
      { id: 'hdmi_converters', name: 'HDMI Converters', keywords: ['hdmi converter', 'vga to hdmi', 'hdmi to av', 'displayport to hdmi'] },
      { id: 'audio_cables', name: 'Audio Cables', keywords: ['audio cable', '3.5mm aux', 'optical audio', 'rca cable'] },
      { id: 'extension_cables', name: 'Extension Cables', keywords: ['extension cable', 'usb extension', 'headphone extension'] },
    ],
  },
  {
    id: 'networking_devices',
    number: 7,
    name: 'Networking Devices',
    slug: 'networking-devices',
    icon: Wifi,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    description: 'Routers, mesh Wi-Fi, switches, access points, and structured cabling',
    subcategories: [
      { id: 'wifi_routers', name: 'Wi-Fi Routers', keywords: ['wifi router', 'wi-fi 6', 'wi-fi 7', 'gigabit router', 'archer'] },
      { id: 'modems', name: 'Modems', keywords: ['modem', 'fiber ont', 'adsl modem', 'gpon'] },
      { id: 'network_switches', name: 'Network Switches', keywords: ['network switch', 'gigabit switch', 'poe switch', 'managed switch', '8-port'] },
      { id: 'access_points', name: 'Access Points', keywords: ['access point', 'omada', 'unifi', 'ceiling ap'] },
      { id: 'wifi_extenders', name: 'Wi-Fi Extenders', keywords: ['wifi extender', 'range extender', 'repeater'] },
      { id: 'mesh_wifi_systems', name: 'Mesh Wi-Fi Systems', keywords: ['mesh wifi', 'deco x50', 'deco', 'zenwifi', 'whole home'] },
      { id: 'network_cards', name: 'Network Cards', keywords: ['network card', 'pci network adapter', 'intel i225', 'wi-fi 6e pcie'] },
      { id: 'lan_adapters', name: 'LAN Adapters', keywords: ['lan adapter', 'usb to ethernet', 'type-c to rj45'] },
      { id: 'ethernet_connectors', name: 'Ethernet Connectors', keywords: ['rj45 connector', 'cat6 rj45', 'pass through plug'] },
      { id: 'patch_panels', name: 'Patch Panels', keywords: ['patch panel', '24 port patch panel', 'cat6 patch panel'] },
      { id: 'network_cabinets', name: 'Network Cabinets', keywords: ['network cabinet', 'server rack 9u', 'wall mount rack'] },
      { id: 'fiber_optic_accessories', name: 'Fiber Optic Accessories', keywords: ['fiber optic', 'patch cord sc', 'sfp module', 'fiber media converter'] },
    ],
  },
  {
    id: 'printers_scanners',
    number: 8,
    name: 'Printers & Scanners',
    slug: 'printers-scanners',
    icon: Printer,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    description: 'EcoTank printers, laser printers, multifunction units, and document scanners',
    subcategories: [
      { id: 'inkjet_printers', name: 'Inkjet Printers', keywords: ['inkjet printer', 'color inkjet', 'photo printer'] },
      { id: 'laser_printers', name: 'Laser Printers', keywords: ['laser printer', 'laserjet', 'hp m404dn', 'monochrome laser'] },
      { id: 'all_in_one_printers', name: 'All-in-One Printers', keywords: ['all-in-one printer', 'ecotank l3250', 'canon mf3010', 'print scan copy'] },
      { id: 'document_scanners', name: 'Document Scanners', keywords: ['document scanner', 'canon p-215ii', 'flatbed scanner', 'adf scanner'] },
      { id: 'barcode_printers', name: 'Barcode Printers', keywords: ['barcode printer', 'thermal barcode', 'pos printer', 'tsc'] },
      { id: 'label_printers', name: 'Label Printers', keywords: ['label printer', 'shipping label printer', 'dymo', 'brother p-touch'] },
      { id: 'ink_cartridges', name: 'Ink Cartridges', keywords: ['ink cartridge', 'ecotank ink bottle', 'epson 003', 'canon ink'] },
      { id: 'toner_cartridges', name: 'Toner Cartridges', keywords: ['toner cartridge', 'laser toner', 'hp 88a', 'canon 325'] },
      { id: 'printer_drums', name: 'Printer Drums', keywords: ['printer drum', 'opc drum', 'imaging unit'] },
      { id: 'printer_cables', name: 'Printer Cables', keywords: ['printer cable', 'usb a-to-b', 'parallel to usb'] },
    ],
  },
  {
    id: 'storage_devices',
    number: 9,
    name: 'Storage Devices',
    slug: 'storage-devices',
    icon: HardDrive,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    description: 'High-speed NVMe SSDs, external backup drives, SD cards, and enclosures',
    subcategories: [
      { id: 'external_ssd', name: 'External SSD', keywords: ['external ssd', 'portable ssd', 'samsung t7', 'sandisk extreme'] },
      { id: 'external_hdd', name: 'External HDD', keywords: ['external hdd', 'portable hard drive', 'wd elements', 'seagate backup plus'] },
      { id: 'usb_flash_drives', name: 'USB Flash Drives', keywords: ['flash drive', 'pendrive', 'sandisk ultra', 'kingston datatraveler'] },
      { id: 'sd_cards', name: 'SD Cards', keywords: ['sd card', 'full size sd', 'uhs-ii', 'prograde', 'camera sd'] },
      { id: 'microsd_cards', name: 'MicroSD Cards', keywords: ['microsd', 'micro sd card', 'sandisk extreme pro', 'samsung evo plus'] },
      { id: 'memory_card_readers', name: 'Memory Card Readers', keywords: ['card reader', 'usb-c card reader', 'high speed sd reader'] },
      { id: 'ssd_enclosures', name: 'SSD Enclosures', keywords: ['ssd enclosure', 'nvme enclosure', 'm.2 to usb', 'thunderbolt enclosure'] },
      { id: 'hdd_enclosures', name: 'HDD Enclosures', keywords: ['hdd enclosure', '2.5 inch sata case', '3.5 inch hard drive dock'] },
      { id: 'nas_storage', name: 'NAS Storage', keywords: ['nas storage', 'synology nas', 'network attached storage', 'qnap'] },
      { id: 'portable_storage_drives', name: 'Portable Storage Drives', keywords: ['portable drive', 'rugged drive', 'lacie rugged'] },
    ],
  },
  {
    id: 'power_protection',
    number: 10,
    name: 'Power & Protection',
    slug: 'power-protection',
    icon: Zap,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    description: 'UPS battery backup, modular power supplies, stabilizers, and surge guards',
    subcategories: [
      { id: 'ups', name: 'UPS', keywords: ['ups', 'prolink', '1200va', 'line interactive ups', 'power backup', 'apc ups'] },
      { id: 'surge_protectors', name: 'Surge Protectors', keywords: ['surge protector', 'spike guard', 'belkin surge', 'surge strip'] },
      { id: 'power_strips', name: 'Power Strips', keywords: ['power strip', 'multi-outlet', 'smart power strip'] },
      { id: 'extension_boards', name: 'Extension Boards', keywords: ['extension board', 'universal sockets extension', 'heavy duty board'] },
      { id: 'voltage_stabilizers', name: 'Voltage Stabilizers', keywords: ['voltage stabilizer', 'automatic voltage regulator', 'avr'] },
      { id: 'laptop_power_adapters', name: 'Laptop Power Adapters', keywords: ['laptop power adapter', 'universal laptop charger', '65w adapter'] },
      { id: 'desktop_power_cables', name: 'Desktop Power Cables', keywords: ['desktop power cable', 'kettle cord', '3 pin power cord'] },
      { id: 'replacement_batteries', name: 'Replacement Batteries', keywords: ['replacement battery', 'ups battery 12v', 'smf battery'] },
      { id: 'inverters', name: 'Inverters', keywords: ['inverter', 'pure sine wave inverter', 'home ups'] },
      { id: 'backup_power_systems', name: 'Backup Power Systems', keywords: ['backup power', 'power station', 'portable generator battery'] },
    ],
  },
  {
    id: 'gaming_accessories',
    number: 11,
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    icon: Gamepad2,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    description: 'Rapid trigger keyboards, esports mice, headsets, controllers, and chairs',
    subcategories: [
      { id: 'gaming_keyboards', name: 'Gaming Keyboards', keywords: ['gaming keyboard', 'wooting 60he', 'keychron q1', 'rapid trigger'] },
      { id: 'gaming_mice', name: 'Gaming Mice', keywords: ['gaming mouse', 'superlight 2', 'viper v3 pro', 'esports mouse'] },
      { id: 'gaming_headsets', name: 'Gaming Headsets', keywords: ['gaming headset', 'arctis nova pro', 'hyperx cloud', 'surround sound'] },
      { id: 'gaming_controllers', name: 'Gaming Controllers', keywords: ['controller', 'gamepad', 'xbox controller', 'dualsense', '8bitdo'] },
      { id: 'gaming_mouse_pads', name: 'Gaming Mouse Pads', keywords: ['gaming mouse pad', 'artisan zero', 'cloth pad', 'cordura mat'] },
      { id: 'gaming_chairs', name: 'Gaming Chairs', keywords: ['gaming chair', 'secretlab', 'ergonomic gaming chair', 'lumbar support'] },
      { id: 'gaming_desks', name: 'Gaming Desks', keywords: ['gaming desk', 'rgb desk', 'height adjustable desk', 'corner desk'] },
      { id: 'streaming_microphones', name: 'Streaming Microphones', keywords: ['streaming microphone', 'shure sm7db', 'elgato wave', 'hyperx'] },
      { id: 'rgb_lighting', name: 'RGB Lighting', keywords: ['rgb light', 'lightbar', 'argb led strip', 'philips hue light'] },
      { id: 'game_capture_cards', name: 'Game Capture Cards', keywords: ['game capture', 'elgato hd60 x', '4k capture', 'stream capture'] },
    ],
  },
  {
    id: 'server_enterprise_hardware',
    number: 12,
    name: 'Server & Enterprise Hardware',
    slug: 'server-enterprise-hardware',
    icon: Server,
    color: 'text-slate-700 bg-slate-100 border-slate-300',
    badgeBg: 'bg-slate-200 text-slate-800',
    description: 'Rackmount servers, ECC server memory, enterprise SSDs, and server racks',
    subcategories: [
      { id: 'rack_servers', name: 'Rack Servers', keywords: ['rack server', '1u server', '2u server', 'poweredge', 'proliant'] },
      { id: 'tower_servers', name: 'Tower Servers', keywords: ['tower server', 'dell t40', 'lenovo thinksystem'] },
      { id: 'server_ram', name: 'Server RAM', keywords: ['server ram', 'ecc ram', 'ecc registered ddr5', 'rdimm'] },
      { id: 'server_ssds', name: 'Server SSDs', keywords: ['server ssd', 'enterprise ssd', 'u.2 nvme', 'samsung pm9a3', 'intel d7'] },
      { id: 'server_hdds', name: 'Server HDDs', keywords: ['server hdd', 'sas hard drive', 'seagate exos', 'wd ultrastar', '16tb hdd'] },
      { id: 'raid_controllers', name: 'RAID Controllers', keywords: ['raid controller', 'lsi mega-raid', 'broadcom raid', 'sas hba'] },
      { id: 'server_power_supplies', name: 'Server Power Supplies', keywords: ['server psu', 'redundant psu', 'hot swap power supply'] },
      { id: 'rack_cabinets', name: 'Rack Cabinets', keywords: ['rack cabinet', '42u server rack', 'server enclosure'] },
      { id: 'kvm_switches', name: 'KVM Switches', keywords: ['kvm switch', 'rackmount kvm', 'hdmi kvm', 'ip kvm'] },
      { id: 'server_cooling_fans', name: 'Server Cooling Fans', keywords: ['server fan', 'high cfm fan', 'delta fan', 'hotswap fan'] },
    ],
  },
];

/**
 * Intelligent helper to match any product to a selected category or subcategory
 */
export function matchProductToCategory(product: any, categoryFilter: string): boolean {
  if (!categoryFilter || categoryFilter === 'all') return true;
  if (!product) return false;

  const target = categoryFilter.toLowerCase().trim();
  const pCat = (product.category || '').toLowerCase().trim();
  const pSub = (product.subcategory || '').toLowerCase().trim();
  const pTitle = (product.title || '').toLowerCase().trim();
  const pBrand = (product.brand || '').toLowerCase().trim();
  const pDesc = (product.description || '').toLowerCase().trim();

  // If filter is "Hardware & Accessories", matches any computer hardware/accessory
  if (target === 'hardware & accessories' || target === 'hardware-accessories' || target === 'hardware') {
    return true;
  }

  // Direct exact/contains string matching
  if (pCat === target || pCat.includes(target) || target.includes(pCat)) return true;
  if (pSub === target || pSub.includes(target) || target.includes(pSub)) return true;

  // Search through taxonomy categories
  const matchedTax = HARDWARE_TAXONOMY.find(
    cat =>
      cat.name.toLowerCase() === target ||
      cat.id.toLowerCase() === target ||
      cat.slug.toLowerCase() === target ||
      (target.includes('component') && cat.id === 'components') ||
      (target.includes('laptop') && cat.id === 'laptops_computers') ||
      (target.includes('monitor') && cat.id === 'monitors_displays') ||
      (target.includes('cable') && cat.id === 'cables_adapters') ||
      (target.includes('network') && cat.id === 'networking_devices') ||
      (target.includes('printer') && cat.id === 'printers_scanners') ||
      (target.includes('storage') && cat.id === 'storage_devices') ||
      (target.includes('power') && cat.id === 'power_protection') ||
      (target.includes('gaming') && cat.id === 'gaming_accessories') ||
      (target.includes('server') && cat.id === 'server_enterprise_hardware')
  );

  if (matchedTax) {
    if (pCat.includes(matchedTax.name.toLowerCase()) || matchedTax.name.toLowerCase().includes(pCat)) {
      return true;
    }
    const allKeywords = matchedTax.subcategories.flatMap(s => s.keywords);
    if (allKeywords.some(kw => pCat.includes(kw) || pSub.includes(kw) || pTitle.includes(kw) || pDesc.includes(kw))) {
      return true;
    }
  }

  // Check if target is a subcategory in any taxonomy
  for (const cat of HARDWARE_TAXONOMY) {
    const sub = cat.subcategories.find(
      s => s.name.toLowerCase() === target || s.id.toLowerCase() === target
    );
    if (sub) {
      if (pSub.includes(sub.name.toLowerCase()) || pTitle.includes(sub.name.toLowerCase())) return true;
      if (sub.keywords.some(kw => pCat.includes(kw) || pSub.includes(kw) || pTitle.includes(kw) || pDesc.includes(kw))) {
        return true;
      }
    }
  }

  // Common quick shortcuts
  if (target.includes('cpu') || target.includes('processor')) {
    return pCat.includes('cpu') || pCat.includes('processor') || pTitle.includes('ryzen') || pTitle.includes('intel') || pTitle.includes('processor');
  }
  if (target.includes('gpu') || target.includes('graphic')) {
    return pCat.includes('gpu') || pCat.includes('graphic') || pTitle.includes('rtx') || pTitle.includes('radeon') || pTitle.includes('geforce');
  }
  if (target.includes('ram') || target.includes('memory')) {
    return pCat.includes('ram') || pCat.includes('memory') || pTitle.includes('ddr4') || pTitle.includes('ddr5') || pTitle.includes('trident');
  }
  if (target.includes('motherboard')) {
    return pCat.includes('motherboard') || pTitle.includes('b650') || pTitle.includes('z790') || pTitle.includes('am5');
  }
  if (target.includes('storage') || target.includes('ssd') || target.includes('hard drive') || target.includes('hdd')) {
    return pCat.includes('storage') || pCat.includes('ssd') || pCat.includes('nvme') || pTitle.includes('ssd') || pTitle.includes('barracuda');
  }
  if (target.includes('laptop')) {
    return pCat.includes('laptop') || pTitle.includes('macbook') || pTitle.includes('legion') || pTitle.includes('zenbook');
  }
  if (target.includes('desktop')) {
    return pCat.includes('desktop') || pTitle.includes('pc') || pTitle.includes('rig');
  }

  return false;
}
