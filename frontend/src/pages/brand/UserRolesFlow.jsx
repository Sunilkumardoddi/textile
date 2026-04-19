import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Settings, ArrowRight, Database, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const roles = [
    {
        id: 'brand',
        title: 'Brand Manager',
        subtitle: 'Season & PO oversight',
        icon: User,
        color: 'teal',
        gradient: 'from-teal-600/20 to-teal-600/5',
        border: 'border-teal-500/40',
        iconBg: 'bg-teal-500/20 text-teal-400',
        permissions: [
            'Create & manage seasons, styles, mood boards',
            'Approve / reject AI Style Engine suggestions',
            'Raise and approve final POs',
            'View full sustainability & cert reports',
            'Upload compliance documents',
            'Access season benchmark & comparison',
        ],
    },
    {
        id: 'auditor',
        title: 'Auditor & Certifier',
        subtitle: 'Compliance verification',
        icon: Shield,
        color: 'purple',
        gradient: 'from-purple-600/20 to-purple-600/5',
        border: 'border-purple-500/40',
        iconBg: 'bg-purple-500/20 text-purple-400',
        permissions: [
            'View-only access to portal data',
            'Conduct & submit Higg FEM assessments',
            'Verify certification validity & scope',
            'Flag non-conformances & raise alerts',
            'Access auditor module within Mfr dashboard',
            'Generate & download audit reports (PDF/Excel)',
        ],
    },
    {
        id: 'admin',
        title: 'Admin & TCH Team',
        subtitle: 'Platform administration',
        icon: Settings,
        color: 'navy',
        gradient: 'from-slate-600/40 to-slate-700/20',
        border: 'border-slate-500/40',
        iconBg: 'bg-slate-500/20 text-slate-300',
        permissions: [
            'Full system administration rights',
            'User role & access management',
            'Configure integration with ERP / API feeds',
            'Manage brand, supplier & auditor onboarding',
            'System health monitoring & alerts',
            'BRSR, Higg FEM & ERP export management',
        ],
    },
];

const flowSteps = [
    { label: 'Style Approved', color: 'bg-teal-600' },
    { label: 'PO Generated', color: 'bg-blue-600' },
    { label: 'Supplier Notified', color: 'bg-purple-600' },
    { label: 'Certs Uploaded', color: 'bg-amber-500' },
    { label: 'Audit Verified', color: 'bg-orange-500' },
    { label: 'Portal Synced', color: 'bg-emerald-600' },
];

const UserRolesFlow = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 pb-8" data-testid="user-roles-flow">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Roles, Flow & Alerts</h1>
                    <p className="text-slate-400 mt-1">Portal access structure, data flow, and integration notes</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => (
                    <Card key={role.id} className={`bg-gradient-to-br ${role.gradient} border ${role.border} transition-all hover:scale-[1.02]`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2.5 rounded-xl ${role.iconBg}`}>
                                    <role.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg">{role.title}</CardTitle>
                                    <p className="text-slate-400 text-xs">{role.subtitle}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2.5">
                            {role.permissions.map((p, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${role.iconBg.split(' ')[0]}`} />
                                    <p className="text-slate-300 text-sm leading-relaxed">{p}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Portal Data Flow */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-teal-400" />
                        Portal Data Flow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {flowSteps.map((step, i) => (
                            <React.Fragment key={i}>
                                <div className={`${step.color} rounded-xl px-4 py-3 text-white text-sm font-semibold whitespace-nowrap shadow-lg`}>
                                    {step.label}
                                </div>
                                {i < flowSteps.length - 1 && (
                                    <ArrowRight className="h-5 w-5 text-slate-500 shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Integration Note */}
            <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-4">
                <Database className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-white text-sm font-semibold mb-1">Integration & Export</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The portal supports <strong className="text-slate-300">BRSR</strong> (Business Responsibility & Sustainability Reporting),&nbsp;
                        <strong className="text-slate-300">Higg FEM</strong> data sync, and <strong className="text-slate-300">ERP export</strong> (Excel/API).
                        All sustainability data is audit-ready and can be dispatched to third-party certifiers, brand sustainability teams, and regulatory bodies.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserRolesFlow;
