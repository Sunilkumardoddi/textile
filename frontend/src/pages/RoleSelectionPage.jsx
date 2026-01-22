import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Globe, Building2, Factory, ClipboardCheck, ShieldCheck,
    ArrowRight, Leaf, Lock, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WorldMap from '@/components/WorldMap';

const roles = [
    {
        id: 'brand',
        title: 'Brand',
        icon: Building2,
        description: 'Manage supply chain visibility, track orders, monitor supplier compliance, and ensure sustainable sourcing across your global network.',
        features: ['Order Management', 'Supplier Tracking', 'Compliance Monitoring'],
        color: 'secondary',
        gradient: 'from-secondary/20 to-secondary/5',
    },
    {
        id: 'manufacturer',
        title: 'Manufacturer',
        icon: Factory,
        description: 'Oversee production operations, manage inventory, track manufacturing progress, and maintain quality standards.',
        features: ['Production Control', 'Inventory Management', 'Quality Assurance'],
        color: 'accent',
        gradient: 'from-accent/20 to-accent/5',
    },
    {
        id: 'auditor',
        title: 'Auditor',
        icon: ClipboardCheck,
        description: 'Conduct facility audits, verify compliance certifications, assess sustainability practices, and report findings.',
        features: ['Audit Scheduling', 'Compliance Verification', 'Report Generation'],
        color: 'success',
        gradient: 'from-success/20 to-success/5',
    },
    {
        id: 'admin',
        title: 'Admin',
        icon: ShieldCheck,
        description: 'Manage platform users, configure system settings, monitor platform health, and oversee organizational access.',
        features: ['User Management', 'System Configuration', 'Access Control'],
        color: 'primary',
        gradient: 'from-primary/20 to-primary/5',
    },
];

export const RoleSelectionPage = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (roleId) => {
        navigate(`/signup/${roleId}`);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-hero">
            {/* Animated World Map Background */}
            <div className="absolute inset-0 z-0">
                <WorldMap />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/90 via-primary/70 to-primary-deep/95" />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-success/10 blur-3xl animate-float" style={{ animationDelay: '4s' }} />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen px-4 py-12">
                {/* Header */}
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <Link to="/login" className="flex items-center gap-3">
                            <div className="relative">
                                <Globe className="h-10 w-10 text-secondary animate-spin-slow" />
                                <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
                            </div>
                            <span className="font-heading text-2xl font-bold text-primary-foreground">
                                TextileTrace
                            </span>
                        </Link>
                        <Link to="/login">
                            <Button variant="glass" size="sm" className="text-primary-foreground border-primary-foreground/20">
                                <Lock className="h-4 w-4 mr-2" />
                                Sign In
                            </Button>
                        </Link>
                    </div>

                    {/* Title Section */}
                    <div className="text-center mb-12 fade-in-up">
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                            Choose Your Role
                        </h1>
                        <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto">
                            Select the role that best describes your position in the textile supply chain to get started with your customized dashboard.
                        </p>
                    </div>

                    {/* Role Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {roles.map((role, index) => (
                            <Card 
                                key={role.id}
                                className="group glass-card border-primary-foreground/10 hover:border-secondary/30 cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-2 fade-in-up flex flex-col"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handleRoleSelect(role.id)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <role.icon className={`h-8 w-8 text-${role.color}`} />
                                    </div>
                                    <CardTitle className="font-heading text-xl text-foreground group-hover:text-secondary transition-colors">
                                        {role.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <CardDescription className="text-center text-muted-foreground text-sm mb-4 flex-1">
                                        {role.description}
                                    </CardDescription>
                                    
                                    {/* Features */}
                                    <div className="space-y-2 mb-6">
                                        {role.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${role.color}`} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <Button 
                                        variant="hero" 
                                        size="default" 
                                        className="w-full group-hover:shadow-lg mt-auto"
                                    >
                                        Create Account
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Info Section */}
                    <div className="mt-16 text-center fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary-foreground/5 border border-primary-foreground/10">
                            <Users className="h-5 w-5 text-secondary" />
                            <span className="text-sm text-primary-foreground/70">
                                Already have an account? 
                                <Link to="/login" className="text-secondary hover:underline ml-1">
                                    Sign in here
                                </Link>
                            </span>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-foreground/50 fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-2 text-sm">
                            <Lock className="h-4 w-4 text-secondary" />
                            <span>Secure Platform</span>
                        </div>
                        <div className="w-px h-4 bg-primary-foreground/20 hidden sm:block" />
                        <div className="flex items-center gap-2 text-sm">
                            <Leaf className="h-4 w-4 text-secondary" />
                            <span>Sustainability Focused</span>
                        </div>
                        <div className="w-px h-4 bg-primary-foreground/20 hidden sm:block" />
                        <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-secondary" />
                            <span>Global Traceability</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-12 text-xs text-primary-foreground/40 text-center">
                        © 2024 TextileTrace. All rights reserved. | One role per account during signup
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
