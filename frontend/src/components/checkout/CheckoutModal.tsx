import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Truck, X, Lock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { NepalesePaymentGateway, PaymentMethodType } from '../payment/NepalesePaymentGateway';
import { CardDetails } from '../payment/GlassmorphismMatteCreditCard';
import { NEPAL_BANKS, NepalBank } from '../../data/nepalBanks';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethod?: PaymentMethodType;
  initialBank?: NepalBank;
}

export function CheckoutModal({
  isOpen,
  onClose,
  initialMethod = 'esewa',
  initialBank = NEPAL_BANKS[0],
}: CheckoutModalProps) {
  const {
    cart,
    createOrder,
    currentUser,
    setCurrentView,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    currency,
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState({
    fullName: currentUser.name || '',
    phone: currentUser.phone || '+977 9801234567',
    email: currentUser.email || 'customer@example.com',
    address: 'Putalisadak, New Road',
    city: 'Kathmandu',
    postalCode: '44600',
    notes: 'Please call before delivery & handle hardware safely',
  });

  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>(initialMethod);
  const [selectedBank, setSelectedBank] = useState<NepalBank>(initialBank);
  const [transactionRef, setTransactionRef] = useState('');
  const [esewaNumber, setEsewaNumber] = useState(currentUser.phone?.replace(/[^0-9]/g, '').slice(-10) || '9801234567');
  const [khaltiNumber, setKhaltiNumber] = useState(currentUser.phone?.replace(/[^0-9]/g, '').slice(-10) || '9801234567');

  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '4829 7492 1083 9541',
    holder: currentUser.name ? currentUser.name.toUpperCase() : 'ALEXANDER VANCE',
    expiry: '08/29',
    cvv: '842',
    theme: 'aurora',
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    if (initialMethod) {
      setPaymentMethodType(initialMethod);
    }
    if (initialBank) {
      setSelectedBank(initialBank);
    }
  }, [initialMethod, initialBank, isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 200 ? 0 : 15;
  const total = subtotal + deliveryFee;

  const getReadablePaymentMethodString = () => {
    switch (paymentMethodType) {
      case 'esewa':
        return `eSewa (ID: ${esewaNumber}${transactionRef ? `, Ref: ${transactionRef}` : ''})`;
      case 'bank_transfer':
        return `Bank Transfer (${selectedBank.name} - ${selectedBank.accountNumber}${transactionRef ? `, Ref: ${transactionRef}` : ''})`;
      case 'khalti':
        return `Khalti Wallet (ID: ${khaltiNumber})`;
      case 'fonepay':
        return `Fonepay QR (Terminal TP-884102${transactionRef ? `, Ref: ${transactionRef}` : ''})`;
      case 'card':
        return `Credit Card (Ending in ${cardDetails.number.slice(-4)})`;
      case 'cod':
        return 'Cash on Delivery (COD)';
      default:
        return 'Online Payment';
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productTitle: item.product.title,
      productImage: item.product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
      price: item.product.price,
      quantity: item.quantity,
      sellerId: item.product.sellerId,
    }));

    createOrder({
      buyerId: currentUser.id,
      buyerName: shipping.fullName,
      buyerEmail: shipping.email,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: getReadablePaymentMethodString(),
      shippingAddress: shipping,
      status: 'pending',
    });

    onClose();
    setCurrentView('orders');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto glossy-glass-shine">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Checkout & Place Order</h3>
            <p className="text-xs text-slate-500">Step {step} of 2 • Escrow Encrypted Hardware Checkout</p>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          {step === 1 ? (
            /* Step 1: Shipping Address */
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" /> Delivery Address & Contact
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number (For Delivery Confirmation)</label>
                  <input
                    type="text"
                    required
                    value={shipping.phone}
                    onChange={e => {
                      setShipping({ ...shipping, phone: e.target.value });
                      const clean = e.target.value.replace(/[^0-9]/g, '').slice(-10);
                      if (clean) {
                        setEsewaNumber(clean);
                        setKhaltiNumber(clean);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={e => setShipping({ ...shipping, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Street Address (Area / Tole)</label>
                <input
                  type="text"
                  required
                  value={shipping.address}
                  onChange={e => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="e.g. Putalisadak, New Road, Kapan, Lalitpur"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Kathmandu / Pokhara / Biratnagar..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={e => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Instructions / Hardware Handling Notes</label>
                <input
                  type="text"
                  value={shipping.notes}
                  onChange={e => setShipping({ ...shipping, notes: e.target.value })}
                  placeholder="Fragile computer components, please call 15 mins prior"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full glossy-pill-btn text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-500/20 mt-4 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Payment Method (eSewa / Bank / Card)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Step 2: Nepalese Payment Gateway & Bank Selection */
            <div className="space-y-5">
              <NepalesePaymentGateway
                amountUSD={total}
                selectedMethod={paymentMethodType}
                onMethodChange={setPaymentMethodType}
                selectedBank={selectedBank}
                onBankChange={setSelectedBank}
                transactionRef={transactionRef}
                onTransactionRefChange={setTransactionRef}
                cardDetails={cardDetails}
                onCardDetailsChange={setCardDetails}
                isCardFlipped={isCardFlipped}
                onCardFlipChange={setIsCardFlipped}
                esewaNumber={esewaNumber}
                onEsewaNumberChange={setEsewaNumber}
                khaltiNumber={khaltiNumber}
                onKhaltiNumberChange={setKhaltiNumber}
              />

              {/* Order Cost Breakdown */}
              <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-slate-800">{formatPricePrimary(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Insured Shipping Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : formatPricePrimary(deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-extrabold text-sm text-slate-900">
                  <span>Total Amount</span>
                  <div className="text-right">
                    <span className="text-indigo-600 text-base font-black">{formatPricePrimary(total)}</span>
                    {showDualCurrency && (
                      <div className="text-[10px] text-slate-500 font-semibold">
                        ≈ {formatPriceSecondary(total)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to Address
                </button>

                <button
                  type="submit"
                  className="flex-[2] glossy-pill-btn text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm Order ({formatPricePrimary(total)})</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
