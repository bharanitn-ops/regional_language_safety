import React from 'react';
import { Bell, CheckCheck, ShieldAlert, Zap, Info, X } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    alert: <ShieldAlert className="h-4 w-4 text-rose-400" />,
    success: <Zap className="h-4 w-4 text-emerald-400" />,
    warning: <ShieldAlert className="h-4 w-4 text-amber-400" />,
    info: <Info className="h-4 w-4 text-blue-400" />,
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Safety Intelligence Feed
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No unread safety notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/40 transition-colors ${
                !n.read ? 'bg-blue-950/20' : ''
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                {iconMap[n.type]}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
