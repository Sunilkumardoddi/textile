import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Check, X, Zap, Building2, Factory, Star, Shield, ArrowRight,
    TrendingUp, Package, BarChart3, Globe, Headphones, Crown, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PLANS = {
    brand: [
        {
            id: 'brand_starter',
            name: 'Starter',
            icon: Zap,
            color: 'blue',
            monthly: 49,
            yearly: 490,
            commission: null,
            description: 'For growing brands starting their traceability journey',
            highlight: false,
            features: [
                { label: 'Up to 10 POs / month', included: true },
                { label: '5 supplier connections', included: true },
                { label: 'Basic traceability tracking', included: true },
                { label: 'Season management', included: true },
                { label: 'Document uploads', included: true },
                { label: 'AI Style Engine', included: false },
                { label: 'Supply Chain Command Center', included: false },
                { label: 'Audit & compliance tools', included: false },
                { label: 'Advanced analytics', included: false },
                { label: 'Priority support', included: false },
            ]
        },
        {
            id: 'brand_professional',
            name: 'Professional',
            icon: TrendingUp,
            color: 'emerald',
            monthly: 149,
            yearly: 1490,
            commission: null,
            description: 'Full suite for brands scaling sustainable sourcing',
            highlight: true,
            badge: 'Most Popular',
            features: [
                { label: 'Up to 50 POs / month', included: true },
                { label: '25 supplier connections', included: true },
                { label: 'Full traceability suite', included: true },
                { label: 'Season management', included: true },
                { label: 'Document uploads', included: true },
                { label: 'AI Style Engine', included: true },
                { label: 'Supply Chain Command Center', included: true },
                { label: 'Audit & compliance tools', included: true },
                { label: 'Advanced analytics', included: true },
                { label: 'Priority support', included: true },
            ]
        },
        {
            id: 'brand_enterprise',
            name: 'Enterprise',
            icon: Crown,
            color: 'purple',
            monthly: null,
            yearly: null,
            commission: '1.5% of PO value',
            commissionNote: 'No monthly fee. Pay only on sourcing activity.',
            description: 'Unlimited scale with dedicated support and custom integrations',
            highlight: false,
            badge: 'Best Value at Scale',
            features: [
                { label: 'Unlimited POs', included: true },
                { label: 'Unlimited suppliers', included: true },
                { label: 'All Professional features', included: true },
                { label: 'Season management', included: true },
                { label: 'Custom integrations (ERP, PLM)', included: true },
                { label: 'AI Style Engine', included: true },
                { label: 'Supply Chain Command Center', included: true },
                { label: 'Dedicated account manager', included: true },
                { label: 'SLA guarantee', included: true },
                { label: '24/7 premium support', included: true },
            ]
        }
    ],
    manufacturer: [
        {
            id: 'mfr_basic',
            name: 'Basic',
            icon: Factory,
            color: 'blue',
            monthly: 29,
            yearly: 290,
            commission: null,
            description: 'List your factory and start receiving orders',
            highlight: false,
            features: [
                { label: 'Up to 10 orders / month', included: true },
                { label: 'Factory profile listing', included: true },
                { label: 'Basic batch management', included: true },
                { label: 'Document uploads', included: true },
                { label: 'Order accept / reject', included: true },
                { label: 'Full production tracking', included: false },
                { label: 'Traceability ESS reporting', included: false },
                { label: 'Higg FEM certifications', included: false },
                { label: 'Advanced analytics', included: false },
                { label: 'Priority support', included: false },
            ]
        },
        {
            id: 'mfr_professional',
            name: 'Professional',
            icon: BarChart3,
            color: 'emerald',
            monthly: 79,
            yearly: 790,
            commission: null,
            description: 'Full toolkit for manufacturers managing complex production',
            highlight: true,
            badge: 'Most Popular',
            features: [
                { label: 'Unlimited orders', included: true },
                { label: 'Factory profile listing', included: true },
                { label: 'Full batch & production tracking', included: true },
                { label: 'Document uploads', included: true },
                { label: 'Order accept / reject', included: true },
                { label: 'Full production tracking', included: true },
                { label: 'Traceability ESS reporting', included: true },
                { label: 'Higg FEM certifications', included: true },
                { label: 'Advanced analytics', included: true },
                { label: 'Priority support', included: true },
            ]
        },
        {
            id: 'mfr_commission',
            name: 'Pay-Per-Order',
            icon: Percent,
            color: 'amber',
            monthly: null,
            yearly: null,
            commission: '3% per accepted order',
            commissionNote: 'No monthly fee. Only pay when you earn.',
            description: 'Zero upfront cost — scale with your production volume',
            highlight: false,
            badge: 'Zero Risk',
            features: [
                { label: 'Unlimited orders', included: true },
                { label: 'Factory profile listing', included: true },
                { label: 'Full batch & production tracking', included: true },
                { label: 'Document uploads', included: true },
                { label: 'Order accept / reject', included: true },
                { label: 'Full production tracking', included: true },
                { label: 'Traceability ESS reporting', included: true },
                { label: 'Higg FEM certifications', included: true },
                { label: 'Advanced analytics', included: true },
                { label: 'Standard support', included: true },
            ]
        }
    ]
};

const COLOR_MAP = {
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        ring: 'ring-blue-500/50',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        icon: 'text-emerald-400',
        btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        ring: 'ring-emerald-500/60',
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        icon: 'text-purple-400',
        btn: 'bg-purple-600 hover:bg-purple-700 text-white',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        ring: 'ring-purple-500/50',
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        btn: 'bg-amber-600 hover:bg-amber-700 text-white',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        ring: 'ring-amber-500/50',
    },
};

function PlanPrice({ plan, cycle }) {
    if (cycle === 'commission') {
        return (
            <div className="mt-4 mb-6">
                <div className="text-3xl font-bold text-white">
                    {plan.commission ?? '—'}
                </div>
                {plan.commissionNote && (
                    <p className="text-xs text-slate-400 mt-1">{plan.commissionNote}</p>
                )}
                {!plan.commission && plan.monthly && (
                    <p className="text-sm text-slate-500 mt-1">Not available on commission</p>
                )}
            </div>
        );
    }
    if (plan.monthly === null) {
        return (
            <div className="mt-4 mb-6">
                <div className="text-3xl font-bold text-white">{plan.commission}</div>
                <p className="text-xs text-slate-400 mt-1">{plan.commissionNote}</p>
            </div>
        );
    }
    const price = cycle === 'yearly' ? plan.yearly : plan.monthly;
    const perLabel = cycle === 'yearly' ? '/yr' : '/mo';
    const savings = cycle === 'yearly'
        ? Math.round((plan.monthly * 12 - plan.yearly))
        : null;
    return (
        <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-white">${price.toLocaleString()}</span>
            <span className="text-slate-400 ml-1">{perLabel}</span>
            {savings && (
                <div className="text-xs text-emerald-400 mt-1">Save ${savings}/yr vs monthly</div>
            )}
        </div>
    );
}

export default function PricingPage() {
    const navigate = useNavigate();
    const [audience, setAudience] = useState('brand');
    const [cycle, setCycle] = useState('monthly');

    const plans = PLANS[audience];

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Nav */}
            <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-emerald-400" />
                    <span className="text-white font-bold text-lg">TraceLink</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white">Sign In</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="text-center px-6 pt-16 pb-10">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
                    Transparent Pricing
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Simple plans for every stage
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Choose monthly, save with annual billing, or pay nothing upfront on our commission model — scale the way you grow.
                </p>
            </div>

            {/* Audience Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex gap-1">
                    <button
                        onClick={() => setAudience('brand')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${audience === 'brand' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Building2 className="h-4 w-4" /> Brand
                    </button>
                    <button
                        onClick={() => setAudience('manufacturer')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${audience === 'manufacturer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Factory className="h-4 w-4" /> Manufacturer
                    </button>
                </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex gap-1">
                    {[
                        { key: 'monthly', label: 'Monthly' },
                        { key: 'yearly', label: 'Yearly', badge: 'Save ~17%' },
                        { key: 'commission', label: 'Commission' },
                    ].map(({ key, label, badge }) => (
                        <button
                            key={key}
                            onClick={() => setCycle(key)}
                            className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${cycle === key ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {label}
                            {badge && (
                                <span className="text-[10px] bg-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                                    {badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const c = COLOR_MAP[plan.color];
                    const PlanIcon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border p-6 flex flex-col transition-all ${c.bg} ${c.border} ${plan.highlight ? `ring-2 ${c.ring} scale-[1.02]` : ''}`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className={`${c.badge} border text-xs font-semibold px-3 py-1`}>
                                        {plan.badge}
                                    </Badge>
                                </div>
                            )}

                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.bg} border ${c.border}`}>
                                <PlanIcon className={`h-5 w-5 ${c.icon}`} />
                            </div>

                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <p className="text-slate-400 text-sm mt-1">{plan.description}</p>

                            <PlanPrice plan={plan} cycle={cycle} />

                            <Button
                                className={`w-full mb-6 ${c.btn}`}
                                onClick={() => navigate('/register')}
                            >
                                Get started <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>

                            <div className="space-y-2 flex-1">
                                {plan.features.map((f) => (
                                    <div key={f.label} className="flex items-center gap-2 text-sm">
                                        {f.included
                                            ? <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                            : <X className="h-4 w-4 text-slate-600 shrink-0" />}
                                        <span className={f.included ? 'text-slate-200' : 'text-slate-500'}>{f.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FAQ strip */}
            <div className="border-t border-slate-800 px-6 py-12 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white text-center mb-8">Common questions</h2>
                <div className="space-y-6">
                    {[
                        { q: 'How does commission billing work?', a: 'For Brand Enterprise, 1.5% is calculated on the total PO value of each sourcing transaction. For Manufacturer Pay-Per-Order, 3% is deducted from each order value once accepted. No monthly fees apply.' },
                        { q: 'Can I switch plans?', a: 'Yes — upgrade or downgrade at any time from your billing dashboard. Changes take effect immediately and are prorated.' },
                        { q: 'Is there a free trial?', a: 'All monthly and yearly plans include a 14-day free trial. No credit card required.' },
                        { q: 'Do brands and manufacturers need separate accounts?', a: 'Yes. Each role has a separate subscription. A company acting as both brand and manufacturer needs two accounts.' },
                    ].map(({ q, a }) => (
                        <div key={q} className="border-b border-slate-800 pb-6">
                            <h4 className="text-white font-medium mb-2">{q}</h4>
                            <p className="text-slate-400 text-sm">{a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 px-6 py-6 text-center text-slate-500 text-sm">
                © 2027 TraceLink. All rights reserved. &nbsp;·&nbsp;
                <Link to="/login" className="hover:text-slate-300">Sign In</Link> &nbsp;·&nbsp;
                <Link to="/register" className="hover:text-slate-300">Register</Link>
            </div>
        </div>
    );
}
