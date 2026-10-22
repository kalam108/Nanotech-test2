import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, CheckCheck, Store, User, ShoppingCart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import { getProductWhatsAppUrl } from '../../data/shopContact';

export function ChatView() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    currentUser,
    products,
    addToCart,
    setCurrentView,
    setSelectedProductId,
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];
  const referencedProduct = activeConversation ? products.find(p => p.id === activeConversation.productId) : null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, inputContent.trim());
    setInputContent('');
  };

  const quickQuestions = [
    'Is local pickup available today?',
    'Is the price firm or negotiable?',
    'Does it include original packaging?',
    'Can you provide warranty details?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Website Buyer & Seller Messaging
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct secure communication for NanoTech hardware listings
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Conversation List */}
        <div className={`${mobileShowThread ? 'hidden md:flex' : 'flex'} border-r border-slate-200 bg-slate-50/50 flex-col`}>
          <div className="p-4 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setMobileShowThread(true);
                  }}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    activeConversation?.id === conv.id ? 'bg-indigo-50/60' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <img
                    src={conv.productImage}
                    alt={conv.productTitle}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{conv.sellerName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-indigo-600 truncate mt-0.5">{conv.productTitle}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active messages yet. Contact any seller from a product detail page!
              </div>
            )}
          </div>
        </div>

        {/* Message Thread Window */}
        <div className={`${mobileShowThread ? 'flex' : 'hidden md:flex'} md:col-span-2 flex-col bg-white`}>
          {activeConversation ? (
            <>
              {/* Product Context Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-200 shrink-0"
                    title="Back to Conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeConversation.productImage}
                    alt={activeConversation.productTitle}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 cursor-pointer"
                    onClick={() => {
                      if (referencedProduct) {
                        setSelectedProductId(referencedProduct.id);
                        setCurrentView('product_detail');
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <h4
                      className="text-xs font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => {
                        if (referencedProduct) {
                          setSelectedProductId(referencedProduct.id);
                          setCurrentView('product_detail');
                        }
                      }}
                    >
                      {activeConversation.productTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Seller: <strong className="text-slate-800">{activeConversation.sellerName}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">${activeConversation.productPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getProductWhatsAppUrl(
                      referencedProduct || {
                        title: activeConversation.productTitle,
                        price: activeConversation.productPrice,
                      }
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Chat with shop owner directly on WhatsApp (9852055346)"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline">WhatsApp Owner (9852055346)</span>
                  </a>

                  {referencedProduct && (
                    <button
                      onClick={() => addToCart(referencedProduct, 1)}
                      className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="text-center my-2">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                    NanoTech Secured Marketplace Chat
                  </span>
                </div>

                {activeMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#4f46e5] text-white font-medium rounded-br-none shadow-xs'
                            : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80 mb-1">{msg.senderName}</div>
                        <div>{msg.content}</div>
                        <div className="text-[9px] text-right mt-1 opacity-80 flex items-center justify-end gap-1">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Questions */}
              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 pl-2">
                  Quick Offer:
                </span>
                {quickQuestions.map((qq, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(activeConversation.id, qq)}
                    className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {qq}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type message to seller..."
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  className="flex-1 bg-white text-slate-900 placeholder-slate-400 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputContent.trim()}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white p-3 rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
