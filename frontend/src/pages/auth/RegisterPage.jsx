import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe, Loader2, User, Building2, Phone, Mail, Lock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: '',
        company_name: '',
        phone: '',
        country: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.company_name) newErrors.company_name = 'Company name is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            toast.success('Registration successful! Please wait for admin approval.', {
                description: formData.role === 'admin' ? 'Admin accounts are auto-approved.' : 'You will be notified once approved.'
            });
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const roles = [
        { value: 'manufacturer', label: 'Manufacturer', description: 'Create batches, manage production' },
        { value: 'brand', label: 'Brand', description: 'Track suppliers, request audits' },
        { value: 'supplier', label: 'Supplier', description: 'Manage orders, track deliveries' },
        { value: 'auditor', label: 'Auditor', description: 'Verify transactions, approve batches' },
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-8">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Globe className="h-10 w-10 text-emerald-400" />
                        <h1 className="text-3xl font-bold text-white">TextileTrace</h1>
                    </div>
                    <p className="text-slate-400">Create your account</p>
                </div>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl text-white">Register</CardTitle>
                        <CardDescription className="text-slate-400">
                            Fill in your details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Select Role *</Label>
                                <Select value={formData.role} onValueChange={(v) => updateField('role', v)}>
                                    <SelectTrigger className={`bg-slate-900/50 border-slate-600 text-white ${errors.role ? 'border-red-500' : ''}`} data-testid="role-select">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div>
                                                    <p className="font-medium">{role.label}</p>
                                                    <p className="text-xs text-slate-400">{role.description}</p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-400">{errors.role}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Full Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.name ? 'border-red-500' : ''}`}
                                            data-testid="name-input"
                                        />
                                    </div>
                                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                                </div>

                                {/* Company */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Company *</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Company name"
                                            value={formData.company_name}
                                            onChange={(e) => updateField('company_name', e.target.value)}
                                            className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.company_name ? 'border-red-500' : ''}`}
                                            data-testid="company-input"
                                        />
                                    </div>
                                    {errors.company_name && <p className="text-sm text-red-400">{errors.company_name}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.email ? 'border-red-500' : ''}`}
                                        data-testid="email-input"
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="+1 234 567 890"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Country</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Country"
                                            value={formData.country}
                                            onChange={(e) => updateField('country', e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 6 characters"
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.password ? 'border-red-500' : ''}`}
                                            data-testid="password-input"
                                        />
                                    </div>
                                    {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Confirm *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                                            className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                            data-testid="confirm-password-input"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="rounded border-slate-600"
                                />
                                <span className="text-sm text-slate-400">Show passwords</span>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                disabled={isLoading}
                                data-testid="register-button"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            <p className="text-xs text-slate-500 text-center">
                                By registering, you agree to our Terms of Service
                            </p>
                        </form>

                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-sm text-emerald-400 hover:underline">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
