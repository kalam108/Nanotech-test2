import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Package,
  Store,
  ShoppingBag,
  AlertTriangle,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setAdminSubView,
  } = useAdmin();

  if (!isOpen) return null;

  const handleNotificationClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.linkSubView) {
      setAdminSubView(n.linkSubView);
      onClose();
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'seller':
        return <Store className="w-4 h-4 text-purple-400" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'budget_warning':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'report':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12141a] border-l border-amber-500/20 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d0e12]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  Admin Alerts Center
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">Real-time system events and alerts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Bar */}
          <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 text-[11px]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={clearNotifications}
              className="text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1.5 text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-3 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">No active alerts right now.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 group ${
                    n.isRead
                      ? 'bg-transparent hover:bg-slate-850/50 opacity-75'
                      : 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          n.isRead ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {n.linkSubView && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-amber-400 hover:underline">
                        View in {n.linkSubView} →
                      </span>
                    )}
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#0a0b0e] border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500">
              NanoTech Automated Monitoring & Diagnostics Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
