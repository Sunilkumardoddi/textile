import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard, ArrowLeft, Calendar, Factory, BarChart3, Percent, CheckCircle,
    AlertTriangle, ArrowUpRight, Download, Shield, Package, TrendingUp,
    ChevronRight, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// ─── Static helpers ───────────────────────────────────────────────────────────

const PLAN_META = {
    mfr_basic:       { name: 'Basic',          color: 'blue',   icon: Factory,   ordersLimit: 10 },
    mfr_professional:{ name: 'Professional',   color: 'emerald',icon: BarChart3, ordersLimit: null },
    mfr_commission:  { name: 'Pay-Per-Order',  color: 'amber',  icon: Percent,   ordersLimit: null },
};

const COLOR_MAP = {
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

const MOCK_USAGE = {
    orders_accepted: 8,
    batches_created: 14,
    shipments_dispatched: 6,
    docs_uploaded: 31,
    commission_earned_usd: 4200,
    commission_owed_usd: 126,
};

const MOCK_INVOICES = [
    { id: 'INV-2027-M04', date: '2027-04-01', amount: 79,  status: 'paid',    description: 'Professional Plan — April 2027' },
    { id: 'INV-2027-M03', date: '2027-03-01', amount: 79,  status: 'paid',    description: 'Professional Plan — March 2027' },
    { id: 'INV-2027-M02', date: '2027-02-01', amount: 79,  status: 'paid',    description: 'Professional Plan — February 2027' },
    { id: 'INV-2027-COM', date: '2027-04-15', amount: 126, status: 'pending', description: 'Commission — April 2027 (3% × $4,200)' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManufacturerBillingDashboard() {
    const navigate = useNavigate();
    const [sub, setSub] = useState(null);
    const [showCancel, setShowCancel] = useState(false);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('subscription'));
            if (stored && stored.role === 'manufacturer') {
                setSub(stored);
            } else {
                setSub({
                    planId: 'mfr_professional',
                    planName: 'Professional',
                    role: 'manufacturer',
                    cycle: 'monthly',
                    price: '$79/mo',
                    startedAt: '2027-01-01T00:00:00.000Z',
                    nextBillingDate: '2027-05-01T00:00:00.000Z',
                    status: 'active',
                });
            }
        } catch {
            setSub({
                planId: 'mfr_professional',
                planName: 'Professional',
                role: 'manufacturer',
                cycle: 'monthly',
                price: '$79/mo',
                startedAt: '2027-01-01T00:00:00.000Z',
                nextBillingDate: '2027-05-01T00:00:00.000Z',
                status: 'active',
            });
        }
    }, []);

    if (!sub) return null;

    const meta = PLAN_META[sub.planId] ?? PLAN_META.mfr_professional;
    const c = COLOR_MAP[meta.color];
    const PlanIcon = meta.icon;
    const isCommission = sub.cycle === 'commission' || sub.planId === 'mfr_commission';
    const nextDate = sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
    const startDate = new Date(sub.startedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const handleCancel = () => {
        const updated = { ...sub, status: 'cancelled' };
        localStorage.setItem('subscription', JSON.stringify(updated));
        setSub(updated);
        setShowCancel(false);
        toast.success('Subscription cancelled. Access continues until end of billing period.');
    };

    const handleUpgrade = () => {
        navigate('/subscribe', { state: { role: 'manufacturer', isNew: false } });
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/manufacturer')}
                        className="text-slate-400 hover:text-white">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-blue-400" />
                            Billing & Subscription
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5">Manage your plan, usage and invoices</p>
                    </div>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleUpgrade}
                >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {sub.planId === 'mfr_commission' ? 'Switch to Monthly' : 'Upgrade Plan'}
                </Button>
            </div>

            {/* Current Plan Card */}
            <div className={`rounded-2xl border p-6 mb-6 ${c.bg} ${c.border}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
                            <PlanIcon className={`h-7 w-7 ${c.text}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">{meta.name} Plan</h2>
                                <Badge className={`${c.badge} border text-xs`}>
                                    {sub.status === 'active' ? 'Active' : 'Cancelled'}
                                </Badge>
                                {sub.cycle && (
                                    <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs capitalize">
                                        {sub.cycle}
                                    </Badge>
                                )}
                            </div>
                            <p className={`text-sm mt-1 ${c.text}`}>
                                {isCommission ? sub.price : `${sub.price} · Renews ${nextDate}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Active since {startDate}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sub.status === 'active' && (
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white"
                                onClick={handleUpgrade}>
                                Change Plan
                            </Button>
                        )}
                        {sub.status === 'active' && (
                            <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                onClick={() => setShowCancel(true)}>
                                Cancel Plan
                            </Button>
                        )}
                        {sub.status === 'cancelled' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleUpgrade}>
                                Reactivate
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: 'Orders Accepted',
                        value: `${MOCK_USAGE.orders_accepted}${meta.ordersLimit ? ` / ${meta.ordersLimit}` : ''}`,
                        icon: Package,
                        color: 'blue',
                        progress: meta.ordersLimit ? (MOCK_USAGE.orders_accepted / meta.ordersLimit) * 100 : null,
                    },
                    {
                        label: 'Batches Created',
                        value: MOCK_USAGE.batches_created,
                        icon: Factory,
                        color: 'emerald',
                        progress: null,
                    },
                    {
                        label: 'Shipments Out',
                        value: MOCK_USAGE.shipments_dispatched,
                        icon: TrendingUp,
                        color: 'amber',
                        progress: null,
                    },
                    ...(isCommission ? [{
                        label: 'Commission Owed',
                        value: `$${MOCK_USAGE.commission_owed_usd}`,
                        icon: DollarSign,
                        color: 'amber',
                        progress: null,
                    }] : [{
                        label: 'Docs Uploaded',
                        value: MOCK_USAGE.docs_uploaded,
                        icon: Shield,
                        color: 'blue',
                        progress: null,
                    }]),
                ].map(({ label, value, icon: Icon, color, progress }) => {
                    const sc = COLOR_MAP[color];
                    return (
                        <Card key={label} className="bg-slate-800 border-slate-700">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${sc.bg}`}>
                                        <Icon className={`h-4 w-4 ${sc.text}`} />
                                    </div>
                                    <p className="text-xs text-slate-400">{label}</p>
                                </div>
                                <p className="text-xl font-bold text-white">{value}</p>
                                {progress !== null && (
                                    <Progress value={progress} className="mt-2 h-1.5" />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Commission Summary (commission plan only) */}
            {isCommission && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Percent className="h-5 w-5 text-amber-400" />
                        Commission Summary — April 2027
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Orders Accepted', value: MOCK_USAGE.orders_accepted },
                            { label: 'Total Order Value', value: `$${MOCK_USAGE.commission_earned_usd.toLocaleString()}` },
                            { label: 'Commission (3%)', value: `$${MOCK_USAGE.commission_owed_usd}` },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Billing Info + Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-400" />
                            Billing Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Billing cycle', value: isCommission ? 'Commission (per order)' : sub.cycle === 'yearly' ? 'Annual' : 'Monthly' },
                            { label: 'Current plan', value: `${meta.name} — ${sub.price}` },
                            ...(nextDate && !isCommission ? [{ label: 'Next billing date', value: nextDate }] : []),
                            ...(isCommission ? [{ label: 'Commission rate', value: '3% per accepted order' }] : []),
                            { label: 'Payment method', value: '•••• •••• •••• 4242' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">{label}</span>
                                <span className="text-white">{value}</span>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-2 border-slate-600 text-slate-300 hover:text-white">
                            <CreditCard className="h-4 w-4 mr-2" /> Update Payment Method
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Shield className="h-5 w-5 text-slate-400" />
                            Your Plan Includes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mb-4">
                            {(sub.planId !== 'mfr_basic'
                                ? ['Unlimited orders', 'Full production tracking', 'Traceability ESS reporting', 'Higg FEM certifications', 'Advanced analytics', 'Priority support']
                                : ['Up to 10 orders/month', 'Factory profile listing', 'Basic batch management', 'Document uploads', 'Email support']
                            ).map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        {sub.planId === 'mfr_basic' && (
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                                onClick={handleUpgrade}>
                                Upgrade for more features <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invoice History */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                        <Download className="h-5 w-5 text-slate-400" />
                        Invoice History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {MOCK_INVOICES.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <div>
                                    <p className="text-white text-sm font-medium">{inv.description}</p>
                                    <p className="text-xs text-slate-400">{inv.id} · {new Date(inv.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-semibold">${inv.amount}</span>
                                    <Badge className={inv.status === 'paid'
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs'
                                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs'}>
                                        {inv.status}
                                    </Badge>
                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Cancel Dialog */}
            {showCancel && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-white font-semibold">Cancel Subscription?</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Your access will continue until the end of the current billing period.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 border-slate-600 text-slate-300"
                                onClick={() => setShowCancel(false)}>
                                Keep Plan
                            </Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleCancel}>
                                Cancel Plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
