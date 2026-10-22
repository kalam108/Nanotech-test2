import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

interface CustomerReview {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  status: 'published' | 'pending' | 'flagged';
  likes: number;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  { id: 'rev_1', productName: 'NVIDIA GeForce RTX 4090 OC', customerName: 'Aarav Sharma', rating: 5, date: 'Aug 14, 2026', comment: 'Absolute beast for 4K raytracing gaming and Blender rendering. Stable temps with custom liquid cooler!', status: 'published', likes: 14 },
  { id: 'rev_2', productName: 'Intel Core i9-14900KS', customerName: 'David Miller', rating: 4, date: 'Aug 13, 2026', comment: 'Blazing fast single core speeds. Make sure to pair with minimum 360mm AIO cooler.', status: 'published', likes: 8 },
  { id: 'rev_3', productName: 'Corsair Vengeance 64GB DDR5', customerName: 'Pooja Thapa', rating: 5, date: 'Aug 12, 2026', comment: 'Enabled XMP profile 1 immediately on ROG Strix motherboard with zero stability issues.', status: 'published', likes: 5 },
  { id: 'rev_4', productName: 'Samsung 990 PRO 2TB NVMe', customerName: 'Anil Gurung', rating: 2, date: 'Aug 11, 2026', comment: 'Packaging box was slightly dented upon delivery although SSD was working.', status: 'pending', likes: 1 },
];

export function ReviewsSection() {
  const { logAdminAction } = useAdmin();
  const { addToast } = useApp();
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'flagged'>('all');
  const [search, setSearch] = useState('');

  const filteredReviews = reviewsList.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string) => {
    setReviewsList(reviewsList.map((r) => (r.id === id ? { ...r, status: 'published' } : r)));
    logAdminAction('Approved Review', 'review', `Approved review ID ${id}`);
    addToast('success', 'Customer review approved for public display.');
  };

  const handleDelete = (id: string) => {
    setReviewsList(reviewsList.filter((r) => r.id !== id));
    logAdminAction('Deleted Review', 'review', `Removed review ID ${id}`);
    addToast('info', 'Review removed.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Customer Reviews &amp; Rating Moderation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor product feedback, verify buyer purchases, and moderate ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'published', 'pending', 'flagged'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-[#FDD835] text-slate-950 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or customer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900">{rev.productName}</span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-800">{rev.customerName}</span>
                  <span>•</span>
                  <span>{rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    rev.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : rev.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {rev.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{rev.likes} found helpful</span>
              </div>

              <div className="flex items-center gap-2">
                {rev.status !== 'published' && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[11px] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
