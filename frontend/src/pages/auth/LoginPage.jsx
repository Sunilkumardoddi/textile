import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe, Shield, Leaf, Lock, Mail, Loader2, User, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
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
        
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            
            // Redirect based on role
            const dashboardRoutes = {
                admin: '/dashboard/admin',
                manufacturer: '/dashboard/manufacturer',
                brand: '/dashboard/brand',
                auditor: '/dashboard/auditor'
            };
            navigate(dashboardRoutes[user.role] || '/dashboard');
        } catch (error) {
            toast.error(error.message || 'Login failed');
            setErrors({ ...errors, password: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const demoCredentials = [
        { role: 'Admin', email: 'admin@textile.com', password: 'testpassword' },
        { role: 'Manufacturer', email: 'manufacturer@textile.com', password: 'testpassword' },
        { role: 'Brand', email: 'brand@textile.com', password: 'testpassword' },
        { role: 'Auditor', email: 'auditor@textile.com', password: 'testpassword' },
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Globe className="h-10 w-10 text-emerald-400" />
                        <h1 className="text-3xl font-bold text-white">TextileTrace</h1>
                    </div>
                    <p className="text-slate-400">Supply Chain Traceability Portal</p>
                </div>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-slate-400">
                            Sign in to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({ ...errors, email: '' });
                                        }}
                                        className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.email ? 'border-red-500' : ''}`}
                                        disabled={isLoading}
                                        data-testid="email-input"
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: '' });
                                        }}
                                        className={`pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.password ? 'border-red-500' : ''}`}
                                        disabled={isLoading}
                                        data-testid="password-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                disabled={isLoading}
                                data-testid="login-button"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
                            <div className="grid grid-cols-2 gap-2">
                                {demoCredentials.map((cred) => (
                                    <button
                                        key={cred.role}
                                        type="button"
                                        onClick={() => {
                                            setEmail(cred.email);
                                            setPassword(cred.password);
                                            setErrors({ email: '', password: '' });
                                        }}
                                        className="text-xs px-3 py-2 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                                        data-testid={`demo-${cred.role.toLowerCase()}`}
                                    >
                                        {cred.role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/register" className="text-sm text-emerald-400 hover:underline">
                                Don't have an account? Register
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Trust badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-slate-500 text-sm">
                    <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Leaf className="h-4 w-4 text-emerald-400" />
                        <span>Sustainable</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-emerald-400" />
                        <span>Global</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
