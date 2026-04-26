import React, { useState, useEffect } from 'react';
import { Bell, Mail, Phone, MessageSquare, Smartphone, MonitorSpeaker, Save, Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { notificationsAPI } from '@/lib/api';
import { toast } from 'sonner';

const CHANNELS = [
    { key: 'email_enabled',    label: 'Email',        icon: Mail,           desc: 'Receive alerts via email', color: 'text-blue-400' },
    { key: 'sms_enabled',      label: 'SMS',          icon: Phone,          desc: 'Text messages to your phone', color: 'text-green-400' },
    { key: 'whatsapp_enabled', label: 'WhatsApp',     icon: MessageSquare,  desc: 'WhatsApp messages', color: 'text-emerald-400' },
    { key: 'push_enabled',     label: 'Push',         icon: Smartphone,     desc: 'Browser / mobile push', color: 'text-purple-400' },
    { key: 'in_app_enabled',   label: 'In-App',       icon: MonitorSpeaker, desc: 'Notification bell in the dashboard', color: 'text-teal-400' },
];

const EVENT_LABELS = {
    po_created:           { label: 'New Purchase Order',        category: 'Purchase Orders' },
    po_accepted:          { label: 'PO Accepted',               category: 'Purchase Orders' },
    po_rejected:          { label: 'PO Rejected',               category: 'Purchase Orders' },
    po_status_changed:    { label: 'PO Status Changed',         category: 'Purchase Orders' },
    audit_assigned:       { label: 'Audit Scheduled',           category: 'Audits' },
    audit_completed:      { label: 'Audit Completed',           category: 'Audits' },
    audit_overdue:        { label: 'Audit Overdue',             category: 'Audits' },
    shipment_dispatched:  { label: 'Shipment Dispatched',       category: 'Shipments' },
    shipment_delayed:     { label: 'Shipment Delayed',          category: 'Shipments' },
    shipment_delivered:   { label: 'Shipment Delivered',        category: 'Shipments' },
    batch_created:        { label: 'Batch Created',             category: 'Production' },
    batch_qc_failed:      { label: 'QC Failed',                 category: 'Production' },
    certificate_expiring: { label: 'Certificate Expiring',      category: 'Compliance' },
    compliance_alert:     { label: 'Compliance Alert',          category: 'Compliance' },
    quality_alert:        { label: 'Quality Alert',             category: 'Quality' },
    new_user_registered:  { label: 'New User Registered',       category: 'System' },
    system_alert:         { label: 'System Alert',              category: 'System' },
};

const CHANNEL_KEYS = ['in_app', 'email', 'sms', 'whatsapp', 'push'];

const DEFAULT_PREFS = {
    email_enabled: true, sms_enabled: false, whatsapp_enabled: false,
    push_enabled: true, in_app_enabled: true,
    events: Object.fromEntries(Object.keys(EVENT_LABELS).map(k => [k, ['in_app', 'email']])),
};

const NotificationPreferences = () => {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testLoading, setTestLoading] = useState(null);

    useEffect(() => {
        notificationsAPI.getPreferences()
            .then(r => setPrefs({ ...DEFAULT_PREFS, ...r.data }))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleGlobal = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

    const toggleEventChannel = (event, channel) => {
        setPrefs(p => {
            const current = p.events?.[event] || [];
            const updated = current.includes(channel)
                ? current.filter(c => c !== channel)
                : [...current, channel];
            return { ...p, events: { ...p.events, [event]: updated } };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await notificationsAPI.updatePreferences(prefs);
            toast.success('Notification preferences saved');
        } catch {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async (channel) => {
        setTestLoading(channel);
        try {
            await notificationsAPI.sendTest(channel);
            toast.success(`Test ${channel} notification sent`);
        } catch {
            toast.error(`Failed to send test ${channel}`);
        } finally {
            setTestLoading(null);
        }
    };

    const categories = [...new Set(Object.values(EVENT_LABELS).map(v => v.category))];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="h-6 w-6 text-teal-400" /> Notification Preferences
                    </h1>
                    <p className="text-slate-400 mt-1">Choose how and when you receive alerts.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Preferences
                </Button>
            </div>

            {/* Global channel toggles */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white text-base">Notification Channels</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enable or disable entire channels. Credentials must be configured by your admin for SMS / WhatsApp / Push.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CHANNELS.map(ch => {
                            const Icon = ch.icon;
                            const enabled = prefs[ch.key];
                            return (
                                <div key={ch.key} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${enabled ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800/50 border-slate-700/50 opacity-60'}`}>
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 ${ch.color}`} />
                                        <div>
                                            <p className="text-sm font-medium text-white">{ch.label}</p>
                                            <p className="text-xs text-slate-500">{ch.desc}</p>
                                        </div>
                                    </div>
                                    <Switch checked={enabled} onCheckedChange={() => toggleGlobal(ch.key)} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Test buttons */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-3">Send a test notification to verify each channel:</p>
                        <div className="flex flex-wrap gap-2">
                            {['in_app', 'email', 'sms', 'whatsapp', 'push'].map(ch => (
                                <Button
                                    key={ch}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                                    onClick={() => handleTest(ch)}
                                    disabled={testLoading === ch}
                                >
                                    {testLoading === ch
                                        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        : <Send className="h-3 w-3 mr-1" />}
                                    Test {ch}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Per-event configuration */}
            {categories.map(category => {
                const events = Object.entries(EVENT_LABELS).filter(([, v]) => v.category === category);
                return (
                    <Card key={category} className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Event</th>
                                            {CHANNEL_KEYS.map(ch => (
                                                <th key={ch} className="text-center text-xs font-medium text-slate-500 pb-2 px-3 capitalize">{ch}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(([eventKey, meta]) => {
                                            const active = prefs.events?.[eventKey] || [];
                                            return (
                                                <tr key={eventKey} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                                    <td className="py-2.5 pr-4 text-slate-300 whitespace-nowrap">{meta.label}</td>
                                                    {CHANNEL_KEYS.map(ch => (
                                                        <td key={ch} className="py-2.5 px-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={active.includes(ch)}
                                                                onChange={() => toggleEventChannel(eventKey, ch)}
                                                                className="w-4 h-4 accent-teal-500 cursor-pointer"
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default NotificationPreferences;
