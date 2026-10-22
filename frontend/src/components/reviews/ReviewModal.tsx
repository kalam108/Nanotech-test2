import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ productId, productTitle, isOpen, onClose }: ReviewModalProps) {
  const { addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview(productId, rating, comment.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Write Verified Review</h3>
            <p className="text-xs text-slate-500 truncate max-w-[250px]">{productTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-amber-500 ml-2">{rating} / 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Review Details
            </label>
            <textarea
              rows={4}
              required
              placeholder="How was the hardware condition, seller packaging, and delivery speed?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl p-3 focus:outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Verified Purchase Badge will be attached to your review.</span>
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
              className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
