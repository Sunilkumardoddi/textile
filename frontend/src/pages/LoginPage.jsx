import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe, Shield, Leaf, Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WorldMap from '@/components/WorldMap';
import { toast } from 'sonner';

// Mock user database for different roles
const mockUsers = [
    { email: 'brand@textile.com', password: 'brand123', role: 'brand', name: 'Brand Manager' },
    { email: 'manufacturer@textile.com', password: 'manu123', role: 'manufacturer', name: 'Manufacturing Lead' },
    { email: 'auditor@textile.com', password: 'audit123', role: 'auditor', name: 'Quality Auditor' },
    { email: 'admin@textile.com', password: 'admin123', role: 'admin', name: 'System Admin' },
];

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const user = mockUsers.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            // Store user info in localStorage (mock session)
            localStorage.setItem('textileUser', JSON.stringify({
                email: user.email,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            }));

            toast.success(`Welcome back, ${user.name}!`, {
                description: `Redirecting to ${user.role} dashboard...`
            });

            // Redirect based on role
            setTimeout(() => {
                navigate(`/dashboard/${user.role}`);
            }, 1000);
        } else {
            toast.error('Invalid credentials', {
                description: 'Please check your email and password.'
            });
            setErrors({ ...errors, password: 'Invalid email or password' });
        }

        setIsLoading(false);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-hero">
            {/* Animated World Map Background */}
            <div className="absolute inset-0 z-0">
                <WorldMap />
                {/* Gradient overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/80 via-primary/60 to-primary-deep/90" />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-secondary/10 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
                {/* Logo and Branding */}
                <div className="mb-8 text-center fade-in-up">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <Globe className="h-12 w-12 text-secondary animate-spin-slow" />
                            <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
                            TextileTrace
                        </h1>
                    </div>
                    <p className="text-primary-foreground/70 text-sm md:text-base max-w-md mx-auto">
                        Global Supply Chain Traceability Platform
                    </p>
                </div>

                {/* Login Card */}
                <Card className="w-full max-w-md glass-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <CardHeader className="space-y-2 text-center pb-4">
                        <CardTitle className="font-heading text-2xl text-foreground">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Sign in to access your supply chain dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-medium">
                                    User ID / Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({ ...errors, email: '' });
                                        }}
                                        className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: '' });
                                        }}
                                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-secondary hover:text-secondary-glow transition-colors hover:underline underline-offset-4"
                                >
                                    Forgot Password / Reset Password
                                </Link>
                            </div>

                            {/* Login Button */}
                            <Button 
                                type="submit" 
                                variant="hero" 
                                size="lg" 
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center mb-3">
                                Demo Credentials (select a role to test)
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {mockUsers.map((user) => (
                                    <button
                                        key={user.role}
                                        type="button"
                                        onClick={() => {
                                            setEmail(user.email);
                                            setPassword(user.password);
                                            setErrors({ email: '', password: '' });
                                        }}
                                        className="text-xs px-3 py-2 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors capitalize"
                                    >
                                        {user.role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trust Badges */}
                <div className="mt-8 flex items-center justify-center gap-6 text-primary-foreground/60 fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-secondary" />
                        <span>Secure Login</span>
                    </div>
                    <div className="w-px h-4 bg-primary-foreground/20" />
                    <div className="flex items-center gap-2 text-sm">
                        <Leaf className="h-4 w-4 text-secondary" />
                        <span>Sustainability Focused</span>
                    </div>
                    <div className="w-px h-4 bg-primary-foreground/20 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm hidden sm:flex">
                        <Globe className="h-4 w-4 text-secondary" />
                        <span>Global Traceability</span>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-xs text-primary-foreground/40 text-center">
                    © 2024 TextileTrace. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
