import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Check, CreditCard, Lock, ChevronRight, Zap, TrendingUp, Crown,
    Factory, BarChart3, Percent, Building2, Globe, ArrowLeft, Shield,
    Star, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Plan definitions ────────────────────────────────────────────────────────

const PLANS = {
    brand: [
        {
            id: 'brand_starter',
            name: 'Starter',
            icon: Zap,
            color: 'blue',
            monthly: 49,
            yearly: 490,
            commissionRate: null,
            features: ['10 POs/month', '5 supplier connections', 'Basic traceability', 'Season management'],
        },
        {
            id: 'brand_professional',
            name: 'Professional',
            icon: TrendingUp,
            color: 'emerald',
            monthly: 149,
            yearly: 1490,
            commissionRate: null,
            badge: 'Most Popular',
            features: ['50 POs/month', '25 supplier connections', 'Full traceability suite', 'AI Style Engine', 'Command Center', 'Audit & compliance'],
        },
        {
            id: 'brand_enterprise',
            name: 'Enterprise',
            icon: Crown,
            color: 'purple',
            monthly: null,
            yearly: null,
            commissionRate: 1.5,
            commissionUnit: '% of PO value',
            badge: 'Best at Scale',
            features: ['Unlimited POs', 'Unlimited suppliers', 'All Professional features', 'Custom integrations', 'Dedicated account manager', '24/7 support'],
        },
    ],
    manufacturer: [
        {
            id: 'mfr_basic',
            name: 'Basic',
            icon: Factory,
            color: 'blue',
            monthly: 29,
            yearly: 290,
            commissionRate: null,
            features: ['10 orders/month', 'Factory profile', 'Basic batch management', 'Document uploads'],
        },
        {
            id: 'mfr_professional',
            name: 'Professional',
            icon: BarChart3,
            color: 'emerald',
            monthly: 79,
            yearly: 790,
            commissionRate: null,
            badge: 'Most Popular',
            features: ['Unlimited orders', 'Full production tracking', 'Traceability ESS', 'Higg FEM certifications', 'Advanced analytics'],
        },
        {
            id: 'mfr_commission',
            name: 'Pay-Per-Order',
            icon: Percent,
            color: 'amber',
            monthly: null,
            yearly: null,
            commissionRate: 3,
            commissionUnit: '% per accepted order',
            badge: 'Zero Risk',
            features: ['Unlimited orders', 'All Professional features', 'No monthly fee', 'Pay only when you earn'],
        },
    ],
};

const COLOR_MAP = {
    blue:    { ring: 'ring-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/40',    icon: 'text-blue-400',    badge: 'bg-blue-500/20 text-blue-300' },
    emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    purple:  { ring: 'ring-purple-500',  bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  icon: 'text-purple-400',  badge: 'bg-purple-500/20 text-purple-300' },
    amber:   { ring: 'ring-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   icon: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300' },
};

function getPlanPrice(plan, cycle) {
    if (plan.commissionRate !== null) return null;
    return cycle === 'yearly' ? plan.yearly : plan.monthly;
}

function formatPrice(plan, cycle) {
    if (plan.commissionRate !== null) {
        return { main: `${plan.commissionRate}%`, sub: plan.commissionUnit };
    }
    const price = getPlanPrice(plan, cycle);
    return { main: `$${price}`, sub: cycle === 'yearly' ? '/yr' : '/mo' };
}

// ─── Card input formatter ─────────────────────────────────────────────────────
function fmtCard(v) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiry(v) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Role comes from router state (post-register) or localStorage (if user is logged in)
    const stateRole = location.state?.role;
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    const role = stateRole || storedUser?.role || 'brand';
    const company = location.state?.company || storedUser?.company_name || 'Your Company';
    const isNew = location.state?.isNew ?? false;

    const plans = PLANS[role] ?? PLANS.brand;

    const [cycle, setCycle] = useState('monthly');
    const [selectedPlanId, setSelectedPlanId] = useState(plans[1]?.id ?? plans[0].id);
    const [step, setStep] = useState('plan'); // 'plan' | 'payment' | 'done'

    const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [cardErrors, setCardErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? plans[0];
    const isCommission = selectedPlan.commissionRate !== null;
    const priceObj = formatPrice(selectedPlan, cycle);

    // If commission plan selected, force cycle label to 'commission'
    const effectiveCycle = isCommission ? 'commission' : cycle;

    const validateCard = () => {
        const errs = {};
        if (!card.name.trim()) errs.name = 'Cardholder name is required';
        const digits = card.number.replace(/\s/g, '');
        if (digits.length < 16) errs.number = 'Enter a valid 16-digit card number';
        if (card.expiry.length < 5) errs.expiry = 'Enter MM/YY';
        if (card.cvv.length < 3) errs.cvv = 'Enter 3-digit CVV';
        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubscribe = async () => {
        if (!validateCard()) return;
        setProcessing(true);
        await new Promise(r => setTimeout(r, 1800));

        const subscription = {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            role,
            cycle: effectiveCycle,
            price: isCommission ? `${selectedPlan.commissionRate}% ${selectedPlan.commissionUnit}` : `$${getPlanPrice(selectedPlan, cycle)}/${cycle === 'yearly' ? 'yr' : 'mo'}`,
            startedAt: new Date().toISOString(),
            nextBillingDate: isCommission ? null : new Date(Date.now() + (cycle === 'yearly' ? 365 : 30) * 86400000).toISOString(),
            status: 'active',
        };
        localStorage.setItem('subscription', JSON.stringify(subscription));

        setProcessing(false);
        setStep('done');
    };

    if (step === 'done') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">You're all set!</h1>
                    <p className="text-slate-400 mb-2">
                        <span className="text-white font-medium">{selectedPlan.name}</span> plan activated for <span className="text-white font-medium">{company}</span>.
                    </p>
                    {isNew && (
                        <p className="text-slate-500 text-sm mb-8">
                            Your account is pending admin approval. You'll receive an email once approved, then you can sign in.
                        </p>
                    )}
                    {!isNew && (
                        <p className="text-slate-500 text-sm mb-8">
                            Your subscription is now active. Head to your billing dashboard to manage it.
                        </p>
                    )}
                    {isNew ? (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                            onClick={() => navigate('/login')}
                        >
                            Go to Sign In
                        </Button>
                    ) : (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                            onClick={() => navigate(`/dashboard/${role}/billing`)}
                        >
                            View Billing Dashboard
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Nav */}
            <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-emerald-400" />
                    <span className="text-white font-bold text-lg">TraceLink</span>
                </div>
                {!isNew && (
                    <Button variant="ghost" className="text-slate-400 hover:text-white text-sm gap-1"
                        onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                )}
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white">
                        {isNew ? 'Choose your plan' : 'Manage Subscription'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {role === 'brand' ? 'Scale your sustainable sourcing' : 'Grow your manufacturing business'}
                        {isNew && <> — 14-day free trial included</>}
                    </p>
                </div>

                {step === 'plan' && (
                    <>
                        {/* Cycle Toggle */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex gap-1">
                                {[
                                    { key: 'monthly', label: 'Monthly' },
                                    { key: 'yearly', label: 'Yearly', note: 'Save ~17%' },
                                ].map(({ key, label, note }) => (
                                    <button
                                        key={key}
                                        onClick={() => setCycle(key)}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${cycle === key ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {label}
                                        {note && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{note}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                            {plans.map((plan) => {
                                const c = COLOR_MAP[plan.color];
                                const Icon = plan.icon;
                                const selected = plan.id === selectedPlanId;
                                const pObj = formatPrice(plan, cycle);
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className={`relative text-left rounded-2xl border p-5 transition-all ${c.bg} ${selected ? `${c.border} ring-2 ${c.ring}` : 'border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {plan.badge && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className={`${c.badge} text-xs px-3`}>{plan.badge}</Badge>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
                                                <Icon className={`h-4 w-4 ${c.icon}`} />
                                            </div>
                                            <span className="text-white font-semibold">{plan.name}</span>
                                            {selected && <Check className="h-4 w-4 text-emerald-400 ml-auto" />}
                                        </div>
                                        <div className="mb-3">
                                            <span className="text-2xl font-bold text-white">{pObj.main}</span>
                                            <span className="text-slate-400 text-sm ml-1">{pObj.sub}</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {plan.features.map(f => (
                                                <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-center">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 text-base"
                                onClick={() => setStep('payment')}
                            >
                                Continue to Payment <ChevronRight className="h-5 w-5 ml-1" />
                            </Button>
                        </div>
                    </>
                )}

                {step === 'payment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-4xl mx-auto">
                        {/* Payment Form */}
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-slate-400" />
                                    Payment details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-slate-300 text-sm">Cardholder name</Label>
                                        <Input
                                            value={card.name}
                                            onChange={e => setCard(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Jane Smith"
                                            className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                        />
                                        {cardErrors.name && <p className="text-red-400 text-xs mt-1">{cardErrors.name}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-slate-300 text-sm">Card number</Label>
                                        <div className="relative">
                                            <Input
                                                value={card.number}
                                                onChange={e => setCard(p => ({ ...p, number: fmtCard(e.target.value) }))}
                                                placeholder="4242 4242 4242 4242"
                                                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                                            />
                                            <CreditCard className="absolute right-3 top-1/2 translate-y-[-25%] h-4 w-4 text-slate-500" />
                                        </div>
                                        {cardErrors.number && <p className="text-red-400 text-xs mt-1">{cardErrors.number}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300 text-sm">Expiry date</Label>
                                            <Input
                                                value={card.expiry}
                                                onChange={e => setCard(p => ({ ...p, expiry: fmtExpiry(e.target.value) }))}
                                                placeholder="MM/YY"
                                                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                            />
                                            {cardErrors.expiry && <p className="text-red-400 text-xs mt-1">{cardErrors.expiry}</p>}
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 text-sm">CVV</Label>
                                            <Input
                                                value={card.cvv}
                                                onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                                                placeholder="123"
                                                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                            />
                                            {cardErrors.cvv && <p className="text-red-400 text-xs mt-1">{cardErrors.cvv}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                                    <Lock className="h-3 w-3" />
                                    256-bit SSL encryption. Your card details are never stored.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 flex-1"
                                    onClick={() => setStep('plan')}
                                    disabled={processing}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" /> Change Plan
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-2 flex-1"
                                    onClick={handleSubscribe}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <><span className="animate-spin mr-2">⏳</span> Processing…</>
                                    ) : (
                                        <><Shield className="h-4 w-4 mr-2" /> Subscribe Now</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-6">
                                <h3 className="text-white font-semibold mb-4">Order Summary</h3>

                                <div className={`rounded-xl p-4 mb-4 ${COLOR_MAP[selectedPlan.color].bg} border ${COLOR_MAP[selectedPlan.color].border}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-semibold">{selectedPlan.name} Plan</span>
                                        {selectedPlan.badge && (
                                            <Badge className={`${COLOR_MAP[selectedPlan.color].badge} text-xs`}>
                                                {selectedPlan.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm capitalize">{role} · {isCommission ? 'Commission' : cycle}</p>
                                </div>

                                <div className="space-y-3 text-sm border-t border-slate-700 pt-4">
                                    {isCommission ? (
                                        <>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Rate</span>
                                                <span className="text-white font-semibold">{selectedPlan.commissionRate}% {selectedPlan.commissionUnit}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Due today</span>
                                                <span className="text-emerald-400 font-semibold">$0.00</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-slate-300">
                                                <span>{cycle === 'yearly' ? 'Annual total' : 'Monthly total'}</span>
                                                <span className="text-white font-semibold">
                                                    ${getPlanPrice(selectedPlan, cycle)?.toLocaleString()}
                                                </span>
                                            </div>
                                            {cycle === 'yearly' && selectedPlan.monthly && (
                                                <div className="flex justify-between text-emerald-400 text-xs">
                                                    <span>Annual savings vs monthly</span>
                                                    <span>-${(selectedPlan.monthly * 12 - selectedPlan.yearly).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-slate-300">
                                                <span>14-day free trial</span>
                                                <span className="text-emerald-400">Included</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300 border-t border-slate-700 pt-3 font-semibold">
                                                <span>Due today</span>
                                                <span className="text-white">$0.00</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    {['Cancel anytime', isNew ? '14-day free trial' : 'Instant activation', 'Prorated plan changes'].map(f => (
                                        <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                                            <Check className="h-3 w-3 text-emerald-400" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
