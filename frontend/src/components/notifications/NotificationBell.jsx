import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Settings, Loader2, AlertTriangle, Info, Package, ClipboardCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationsAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const POLL_INTERVAL = 30000; // 30 seconds

const eventIcon = (event) => {
    if (event?.includes('po')) return <Package className="h-4 w-4 text-blue-400" />;
    if (event?.includes('audit')) return <ClipboardCheck className="h-4 w-4 text-amber-400" />;
    if (event?.includes('shipment')) return <Truck className="h-4 w-4 text-cyan-400" />;
    if (event?.includes('compliance') || event?.includes('certificate')) return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    return <Info className="h-4 w-4 text-slate-400" />;
};

const priorityDot = (priority) => {
    const map = { critical: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-slate-500' };
    return <span className={`w-2 h-2 rounded-full shrink-0 ${map[priority] || map.low}`} />;
};

const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const fetchCount = useCallback(async () => {
        try {
            const res = await notificationsAPI.getUnreadCount();
            setUnreadCount(res.data.count || 0);
        } catch {
            // silent — don't break the UI if notifications are down
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationsAPI.getAll({ limit: 20 });
            setNotifications(res.data || []);
            const unread = (res.data || []).filter(n => n.status === 'sent' || n.status === 'pending').length;
            setUnreadCount(unread);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll unread count every 30 s
    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchCount]);

    // Fetch full list when panel opens
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsAPI.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDismiss = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsAPI.dismiss(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification dismissed');
        } catch {
            toast.error('Failed to dismiss');
        }
    };

    const visible = notifications.filter(n => n.status !== 'dismissed');

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white"
                onClick={() => setOpen(o => !o)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Panel */}
            {open && (
                <div className="absolute right-0 top-10 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col max-h-[520px]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-teal-400" />
                            <span className="font-semibold text-white text-sm">Notifications</span>
                            {unreadCount > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{unreadCount} new</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" /> All read
                                </button>
                            )}
                            <button
                                onClick={() => { setOpen(false); navigate('/dashboard/notifications/preferences'); }}
                                className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700"
                            >
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                            </div>
                        ) : visible.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Bell className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            visible.map(n => {
                                const isUnread = n.status === 'sent' || n.status === 'pending';
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group ${isUnread ? 'bg-teal-500/5' : ''}`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {eventIcon(n.event)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    {priorityDot(n.priority)}
                                                    <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-slate-300'} leading-tight`}>
                                                        {n.title}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-slate-500 shrink-0">{timeAgo(n.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            {isUnread && (
                                                <button onClick={(e) => handleMarkRead(n.id, e)} className="p-1 text-slate-500 hover:text-teal-400 rounded" title="Mark read">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button onClick={(e) => handleDismiss(n.id, e)} className="p-1 text-slate-500 hover:text-red-400 rounded" title="Dismiss">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-slate-700 flex justify-between items-center">
                        <button
                            onClick={() => { setOpen(false); navigate('/dashboard/notifications'); }}
                            className="text-xs text-teal-400 hover:text-teal-300"
                        >
                            View all notifications
                        </button>
                        <button
                            onClick={() => notificationsAPI.sendTest('in_app').then(() => { toast.success('Test sent!'); fetchNotifications(); }).catch(() => toast.error('Failed'))}
                            className="text-xs text-slate-500 hover:text-slate-300"
                        >
                            Send test
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
