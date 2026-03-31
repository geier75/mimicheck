import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from './NotificationContext.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span data-testid="notif-badge" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[11px] leading-[18px] text-white bg-red-600 rounded-full text-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Benachrichtigungen</span>
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Leeren</button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">Keine Benachrichtigungen</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex items-start gap-3 py-3">
              <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-slate-300' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm truncate">{n.title}</div>
                <div className="text-xs text-slate-600 truncate">{n.message}</div>
                <div className="text-[11px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.read && (
                <button data-testid={`notif-read-${n.id}`} onClick={() => markAsRead(n.id)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Gelesen
                </button>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
