import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NEPAL_BANKS, WALLET_CONFIG, NepalBank } from '../../data/nepalBanks';
import { GlassmorphismMatteCreditCard, CardDetails } from './GlassmorphismMatteCreditCard';
import {
  QrCode,
  Building2,
  Wallet,
  CreditCard,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronDown,
  Info,
  Lock,
} from 'lucide-react';

export type PaymentMethodType = 'esewa' | 'bank_transfer' | 'khalti' | 'fonepay' | 'connect_ips' | 'card' | 'cod';

interface NepalesePaymentGatewayProps {
  amountUSD: number;
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  selectedBank: NepalBank;
  onBankChange: (bank: NepalBank) => void;
  transactionRef: string;
  onTransactionRefChange: (ref: string) => void;
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
  isCardFlipped: boolean;
  onCardFlipChange: (flipped: boolean) => void;
  esewaNumber?: string;
  onEsewaNumberChange?: (val: string) => void;
  khaltiNumber?: string;
  onKhaltiNumberChange?: (val: string) => void;
}

export function NepalesePaymentGateway({
  amountUSD,
  selectedMethod,
  onMethodChange,
  selectedBank,
  onBankChange,
  transactionRef,
  onTransactionRefChange,
  cardDetails,
  onCardDetailsChange,
  isCardFlipped,
  onCardFlipChange,
  esewaNumber = '9801234567',
  onEsewaNumberChange,
  khaltiNumber = '9801234567',
  onKhaltiNumberChange,
}: NepalesePaymentGatewayProps) {
  const { formatPricePrimary, formatPriceSecondary, showDualCurrency, exchangeRate } = useApp();
  const [bankSearch, setBankSearch] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const amountNPR = Math.round(amountUSD * exchangeRate);
  const formattedNPR = `रु ${amountNPR.toLocaleString('en-IN')}`;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredBanks = NEPAL_BANKS.filter(
    b =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.shortName.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Method Selection Pill Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-indigo-600" />
            <span>Select Payment Gateway</span>
          </label>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> 100% Escrow Secured
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* eSewa */}
          <button
            type="button"
            onClick={() => onMethodChange('esewa')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'esewa'
                ? 'bg-gradient-to-br from-emerald-50 to-green-50/80 border-[#60bb46] ring-2 ring-[#60bb46]/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#60bb46] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                  e
                </span>
                <span className="text-xs font-black text-slate-900">eSewa</span>
              </div>
              {selectedMethod === 'esewa' && <CheckCircle2 className="w-4 h-4 text-[#60bb46]" />}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold mt-2">Instant 2% Cashback</p>
          </button>

          {/* Bank Transfer / Multiple Banks */}
          <button
            type="button"
            onClick={() => onMethodChange('bank_transfer')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'bank_transfer'
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-slate-900">Bank Transfer</span>
              </div>
              {selectedMethod === 'bank_transfer' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </div>
            <p className="text-[10px] text-indigo-700 font-semibold mt-2">16+ Commercial Banks</p>
          </button>

          {/* Khalti */}
          <button
            type="button"
            onClick={() => onMethodChange('khalti')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'khalti'
                ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50/80 border-[#5c2d91] ring-2 ring-[#5c2d91]/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#5c2d91] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                  K
                </span>
                <span className="text-xs font-black text-slate-900">Khalti Wallet</span>
              </div>
              {selectedMethod === 'khalti' && <CheckCircle2 className="w-4 h-4 text-[#5c2d91]" />}
            </div>
            <p className="text-[10px] text-purple-700 font-semibold mt-2">1.5% Reward Points</p>
          </button>

          {/* Fonepay QR */}
          <button
            type="button"
            onClick={() => onMethodChange('fonepay')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'fonepay'
                ? 'bg-gradient-to-br from-rose-50 to-red-50/80 border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <QrCode className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-slate-900">Fonepay QR</span>
              </div>
              {selectedMethod === 'fonepay' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
            </div>
            <p className="text-[10px] text-rose-700 font-semibold mt-2">All Nepal Banking Apps</p>
          </button>

          {/* Credit / Debit Card */}
          <button
            type="button"
            onClick={() => onMethodChange('card')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'card'
                ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-400 ring-2 ring-indigo-500/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${selectedMethod === 'card' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-white'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </span>
                <span className={`text-xs font-black ${selectedMethod === 'card' ? 'text-white' : 'text-slate-900'}`}>Card (Visa/MC)</span>
              </div>
              {selectedMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className={`text-[10px] font-semibold mt-2 ${selectedMethod === 'card' ? 'text-indigo-200' : 'text-slate-500'}`}>3D Titanium Matte</p>
          </button>

          {/* Cash on Delivery (COD) */}
          <button
            type="button"
            onClick={() => onMethodChange('cod')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              selectedMethod === 'cod'
                ? 'bg-gradient-to-br from-amber-50 to-orange-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Truck className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-slate-900">Cash on Delivery</span>
              </div>
              {selectedMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-[10px] text-amber-700 font-semibold mt-2">Pay upon Inspection</p>
          </button>
        </div>
      </div>

      {/* METHOD DETAILS CONTAINER */}
      <div className="glossy-card rounded-3xl p-5 border border-slate-200/90 space-y-4">
        {/* 1. eSewa Dedicated Flow */}
        {selectedMethod === 'esewa' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#60bb46] text-white flex items-center justify-center font-black text-base shadow-xs">
                  e
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">eSewa Mobile Wallet Direct</h4>
                  <p className="text-[11px] text-slate-500">Merchant: {WALLET_CONFIG.esewa.merchantName}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 text-[#60bb46] text-[11px] font-extrabold border border-emerald-200">
                Verified eSewa Merchant
              </span>
            </div>

            {/* QR Scan & eSewa ID Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* QR Box */}
              <div className="sm:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center">
                <div className="w-36 h-36 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-2 relative group">
                  {/* Styled QR Visualization */}
                  <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                    <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                    <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                    <rect x="40" y="10" width="8" height="8" />
                    <rect x="52" y="10" width="8" height="8" />
                    <rect x="40" y="25" width="20" height="8" />
                    <rect x="10" y="40" width="8" height="20" />
                    <rect x="25" y="40" width="8" height="8" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="70" y="40" width="8" height="8" />
                    <rect x="85" y="40" width="8" height="20" />
                    <rect x="40" y="70" width="8" height="20" />
                    <rect x="55" y="70" width="8" height="8" />
                    <rect x="70" y="70" width="20" height="8" />
                    <rect x="80" y="85" width="10" height="8" />
                  </svg>
                  <div className="absolute inset-0 bg-[#60bb46]/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-[10px] font-black text-emerald-800 bg-white/90 px-2 py-1 rounded-md shadow-xs">
                      Scan with eSewa
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Scan with eSewa App to pay <strong className="text-slate-900 font-black">{formattedNPR}</strong></p>
              </div>

              {/* Form & Manual Details */}
              <div className="sm:col-span-7 space-y-3">
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs text-slate-700 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-semibold">eSewa Merchant ID:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('9801234567', 'esewa_id')}
                      className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] cursor-pointer hover:bg-emerald-100"
                    >
                      <span>9801234567</span>
                      {copiedField === 'esewa_id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-semibold">Payable Total:</span>
                    <span className="font-black text-slate-900">{formattedNPR}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your eSewa Registered Mobile Number / ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={esewaNumber}
                      onChange={e => onEsewaNumberChange?.(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2.5 pl-8 focus:outline-none focus:border-[#60bb46] focus:ring-1 focus:ring-[#60bb46]"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Transaction Ref / eSewa Code (Optional)</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => onTransactionRefChange(e.target.value)}
                    placeholder="e.g. 05892348"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-[#60bb46]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Multiple Banks / Direct Bank Transfer Flow */}
        {selectedMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Direct Bank Transfer / Mobile Banking</h4>
                  <p className="text-[11px] text-slate-500">Transfer via ConnectIPS, Mobile App or Counter</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold border border-indigo-200">
                16 Commercial Banks Active
              </span>
            </div>

            {/* Bank Selector Dropdown & Grid */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Select Your Preferred Bank:</label>
              
              {/* Active Selected Bank Trigger Card */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full bg-white hover:bg-slate-50 border-2 border-indigo-400 rounded-2xl p-3 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">
                      {selectedBank.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{selectedBank.name}</span>
                        {selectedBank.isPopular && (
                          <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                            Instant Clear
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">Branch: {selectedBank.branch}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isBankDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Bank Selection Dropdown Menu */}
                {isBankDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-3 space-y-2 max-h-64 overflow-y-auto">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={e => setBankSearch(e.target.value)}
                        placeholder="Search bank name (e.g. Nabil, NIC Asia, Global IME, Himalayan...)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      {filteredBanks.map(bank => (
                        <div
                          key={bank.id}
                          onClick={() => {
                            onBankChange(bank);
                            setIsBankDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            selectedBank.id === bank.id ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700">
                              {bank.shortName.slice(0, 3)}
                            </span>
                            <span>{bank.name}</span>
                          </div>
                          {bank.isPopular && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Official Transfer Details & QR Code */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Account Name */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-slate-500 text-[10px] mb-1">
                    <span>Account Name:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedBank.accountName, 'acc_name')}
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copiedField === 'acc_name' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-xs truncate">
                    {selectedBank.accountName}
                  </div>
                </div>

                {/* Account Number */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-slate-500 text-[10px] mb-1">
                    <span>Account Number:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedBank.accountNumber.replace(/\s/g, ''), 'acc_num')}
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copiedField === 'acc_num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Number</span>
                    </button>
                  </div>
                  <div className="font-mono font-black text-indigo-700 text-sm tracking-wide">
                    {selectedBank.accountNumber}
                  </div>
                </div>

                {/* Branch Info */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 text-[10px] block mb-1">Branch Office:</span>
                  <div className="font-semibold text-slate-800 text-xs">
                    {selectedBank.branch}
                  </div>
                </div>

                {/* Mobile Banking App Compatible */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 text-[10px] block mb-1">Direct App Support:</span>
                  <div className="font-semibold text-emerald-700 text-xs flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{selectedBank.mobileApp} / ConnectIPS</span>
                  </div>
                </div>
              </div>

              {/* Transaction Voucher / Ref Code Input */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bank Transfer Reference / Transaction ID / Voucher No:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={e => onTransactionRefChange(e.target.value)}
                    placeholder={`e.g. ${selectedBank.shortName}-TXN-8849102`}
                    className="w-full bg-white border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Paste the reference number from your mobile banking app receipt (Nabil Smart, NIC Asia MoBank, ConnectIPS, etc.)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Khalti Wallet Flow */}
        {selectedMethod === 'khalti' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5c2d91] text-white flex items-center justify-center font-black text-base shadow-xs">
                  K
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Khalti Digital Wallet Direct</h4>
                  <p className="text-[11px] text-slate-500">Merchant: {WALLET_CONFIG.khalti.merchantName}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100/80 text-[#5c2d91] text-[11px] font-extrabold border border-purple-200">
                Khalti Escrow Protected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Khalti Mobile Number</label>
                  <input
                    type="text"
                    value={khaltiNumber}
                    onChange={e => onKhaltiNumberChange?.(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5c2d91]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Khalti MPIN / Transaction Code</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    defaultValue="4829"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5c2d91]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200/80 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Khalti Points & Cash Rewards</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Earn 1.5% Khalti loyalty points on hardware purchases. You will receive an instant push notification on your Khalti app for authorization.
                </p>
                <div className="pt-2 border-t border-purple-200/70 flex justify-between font-bold text-xs">
                  <span>Payable NPR:</span>
                  <span className="text-purple-900 font-black">{formattedNPR}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Fonepay QR Flow */}
        {selectedMethod === 'fonepay' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Fonepay Inter-Bank QR Scan</h4>
                  <p className="text-[11px] text-slate-500">Scan using ANY mobile banking app in Nepal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold border border-rose-200">
                All 30+ Nepal Banks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* QR Render */}
              <div className="sm:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center">
                <div className="w-36 h-36 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-center p-2 relative">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                    <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                    <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                    <rect x="35" y="15" width="10" height="10" />
                    <rect x="55" y="15" width="10" height="10" />
                    <rect x="45" y="45" width="10" height="10" fill="#dc2626" />
                    <rect x="15" y="45" width="10" height="10" />
                    <rect x="75" y="45" width="10" height="10" />
                    <rect x="35" y="75" width="10" height="10" />
                    <rect x="55" y="75" width="10" height="10" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                      FP
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 mt-2 font-bold">Terminal ID: {WALLET_CONFIG.fonepay.terminalId}</span>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80 text-xs text-slate-700 space-y-1.5">
                  <p className="text-[11px] leading-relaxed">
                    Open your bank mobile app (e.g. <strong>NIC Asia MoBank</strong>, <strong>Nabil Smart</strong>, <strong>Global Smart</strong>, <strong>HBL Smart</strong>, <strong>Sanima Sajilo</strong>, <strong>Prabhu Smart</strong>) and tap <strong>Scan to Pay</strong>.
                  </p>
                  <div className="flex justify-between items-center font-bold text-xs pt-1 border-t border-rose-200/60">
                    <span>Payable NPR:</span>
                    <span className="text-rose-700 font-black">{formattedNPR}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fonepay Trace ID / Reference (Optional)</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => onTransactionRefChange(e.target.value)}
                    placeholder="e.g. FP-99481028"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Credit / Debit Card Flow */}
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 3D Glassmorphic Titanium Matte Card
              </span>
              <span className="text-[10px] text-slate-500">Live 3D Flip & Liquid Card Preview</span>
            </div>

            <GlassmorphismMatteCreditCard
              cardDetails={cardDetails}
              onChange={onCardDetailsChange}
              flipped={isCardFlipped}
              onFlip={onCardFlipChange}
              showControls={true}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardDetails.number}
                  onFocus={() => onCardFlipChange(false)}
                  onChange={e => onCardDetailsChange({ ...cardDetails, number: e.target.value })}
                  placeholder="4829 7492 1083 9541"
                  className="w-full bg-white border border-slate-200 font-mono text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardDetails.holder}
                  onFocus={() => onCardFlipChange(false)}
                  onChange={e => onCardDetailsChange({ ...cardDetails, holder: e.target.value.toUpperCase() })}
                  placeholder="ALEXANDER VANCE"
                  className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Expiry</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardDetails.expiry}
                    onFocus={() => onCardFlipChange(false)}
                    onChange={e => onCardDetailsChange({ ...cardDetails, expiry: e.target.value })}
                    placeholder="08/29"
                    className="w-full bg-white border border-slate-200 font-mono text-xs text-slate-900 rounded-xl px-3 py-2.5 text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onFocus={() => onCardFlipChange(true)}
                    onChange={e => onCardDetailsChange({ ...cardDetails, cvv: e.target.value })}
                    placeholder="842"
                    className="w-full bg-white border border-slate-200 font-mono text-xs text-slate-900 rounded-xl px-3 py-2.5 text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Cash on Delivery (COD) Flow */}
        {selectedMethod === 'cod' && (
          <div className="space-y-3 p-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Cash on Delivery / Doorstep Payment</h4>
                <p className="text-[11px] text-slate-500">Pay cash or scan QR upon physical hardware delivery</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1">
              <p>
                Our delivery partner will bring the hardware to your location. You can inspect the package condition, test power on, and pay in Nepali Rupees ({formattedNPR}) in Cash, eSewa, or Fonepay QR directly to the courier.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
