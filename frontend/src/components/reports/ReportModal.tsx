import React, { useState } from 'react';
import { Product, ReportReason } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ product, isOpen, onClose }: ReportModalProps) {
  const { submitReport } = useApp();
  const [reason, setReason] = useState<ReportReason>('fake_product');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    submitReport('product', product.id, product.title, reason, details.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Report Hardware Listing</h3>
            <p className="text-xs text-slate-500">Flag listing to NanoTech moderation team</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as ReportReason)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="fake_product">Fake / Counterfeit Hardware</option>
              <option value="scam">Suspected Scam or Off-Platform Scam</option>
              <option value="incorrect_info">Misleading Specifications / Condition</option>
              <option value="offensive">Offensive Content or Images</option>
              <option value="duplicate">Duplicate Listing</option>
              <option value="suspicious_seller">Suspicious Seller Activity</option>
              <option value="other">Other Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe what is wrong or why this hardware listing breaks marketplace rules..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl p-3 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Reports are reviewed by platform admins. False reporting may lead to account restrictions.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
