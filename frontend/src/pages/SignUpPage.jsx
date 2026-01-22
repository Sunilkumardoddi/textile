import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
    Globe, Building2, Factory, ClipboardCheck, ShieldCheck,
    ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Mail,
    Phone, Lock, MapPin, Briefcase, User, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import WorldMap from '@/components/WorldMap';
import { toast } from 'sonner';

// Role configurations
const roleConfig = {
    brand: {
        title: 'Brand',
        subtitle: 'Fashion & Retail Brand',
        icon: Building2,
        color: 'secondary',
        businessTypes: ['Fashion Brand', 'Retail Chain', 'E-commerce Platform', 'Wholesale Distributor', 'Other'],
    },
    manufacturer: {
        title: 'Manufacturer',
        subtitle: 'Textile & Garment Factory',
        icon: Factory,
        color: 'accent',
        businessTypes: ['Spinning Mill', 'Weaving Factory', 'Dyeing Unit', 'Garment Factory', 'Printing Unit', 'Other'],
    },
    auditor: {
        title: 'Auditor',
        subtitle: 'Compliance & Audit Body',
        icon: ClipboardCheck,
        color: 'success',
        businessTypes: ['Certification Body', 'Independent Auditor', 'Consulting Firm', 'NGO', 'Government Agency', 'Other'],
    },
    admin: {
        title: 'Admin',
        subtitle: 'Platform Administrator',
        icon: ShieldCheck,
        color: 'primary',
        businessTypes: ['Platform Admin', 'System Administrator', 'IT Department', 'Management', 'Other'],
    },
};

// Countries list
const countries = [
    'Bangladesh', 'China', 'India', 'Vietnam', 'Indonesia', 
    'Turkey', 'Pakistan', 'Cambodia', 'Sri Lanka', 'Myanmar',
    'United States', 'United Kingdom', 'Germany', 'France', 'Italy',
    'Netherlands', 'Spain', 'Portugal', 'Brazil', 'Mexico',
    'Thailand', 'Malaysia', 'Philippines', 'Egypt', 'Morocco',
    'Ethiopia', 'Kenya', 'South Africa', 'United Arab Emirates', 'Other'
];

export const SignUpPage = () => {
    const navigate = useNavigate();
    const { role } = useParams();
    const config = roleConfig[role] || roleConfig.brand;
    const RoleIcon = config.icon;

    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        businessType: '',
        country: '',
        city: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);

    const validateStep1 = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        if (!formData.businessType) {
            newErrors.businessType = 'Please select a business type';
        }
        if (!formData.country) {
            newErrors.country = 'Please select a country';
        }
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep2()) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock successful registration
        toast.success('Account Created Successfully!', {
            description: 'Your account is pending admin approval. You will be notified via email.'
        });

        // Store mock user data
        localStorage.setItem('pendingUser', JSON.stringify({
            ...formData,
            role,
            status: 'pending',
            createdAt: new Date().toISOString(),
        }));

        setIsLoading(false);
        
        // Redirect to success/login page
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const renderStep1 = () => (
        <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                    />
                </div>
                {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
            </div>

            {/* Company Name */}
            <div className="space-y-2">
                <Label htmlFor="companyName" className="text-foreground font-medium">
                    Company / Organization Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className={`pl-10 ${errors.companyName ? 'border-destructive' : ''}`}
                    />
                </div>
                {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
            </div>

            {/* Business Type */}
            <div className="space-y-2">
                <Label htmlFor="businessType" className="text-foreground font-medium">
                    Business Type <span className="text-destructive">*</span>
                </Label>
                <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => handleInputChange('businessType', value)}
                >
                    <SelectTrigger className={`${errors.businessType ? 'border-destructive' : ''}`}>
                        <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                        {config.businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.businessType && (
                    <p className="text-sm text-destructive">{errors.businessType}</p>
                )}
            </div>

            {/* Country */}
            <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground font-medium">
                    Country <span className="text-destructive">*</span>
                </Label>
                <Select 
                    value={formData.country} 
                    onValueChange={(value) => handleInputChange('country', value)}
                >
                    <SelectTrigger className={`${errors.country ? 'border-destructive' : ''}`}>
                        <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                )}
            </div>

            {/* City */}
            <div className="space-y-2">
                <Label htmlFor="city" className="text-foreground font-medium">
                    City / Location <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="city"
                        placeholder="Enter city or location"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`pl-10 ${errors.city ? 'border-destructive' : ''}`}
                    />
                </div>
                {errors.city && (
                    <p className="text-sm text-destructive">{errors.city}</p>
                )}
            </div>

            <Button 
                type="button"
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={handleNext}
            >
                Continue
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                    Official Email ID <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter official email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">
                    Mobile Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                </div>
                {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                    Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Min 8 characters with uppercase, lowercase, and number
                </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
                <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                    className={errors.agreeTerms ? 'border-destructive' : ''}
                />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="agreeTerms"
                        className="text-sm text-muted-foreground cursor-pointer"
                    >
                        I agree to the{' '}
                        <span className="text-secondary hover:underline">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-secondary hover:underline">Privacy Policy</span>
                    </label>
                    {errors.agreeTerms && (
                        <p className="text-sm text-destructive">{errors.agreeTerms}</p>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
                <Button 
                    type="button"
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button 
                    type="submit"
                    variant="hero" 
                    size="lg" 
                    className="flex-1"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <CheckCircle2 className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-hero">
            {/* Animated World Map Background */}
            <div className="absolute inset-0 z-0">
                <WorldMap />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/90 via-primary/70 to-primary-deep/95" />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-secondary/10 blur-3xl animate-float" />
            <div className="absolute bottom-32 left-20 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
                {/* Back to Role Selection */}
                <Link 
                    to="/roles" 
                    className="absolute top-6 left-6 flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Choose Different Role</span>
                </Link>

                {/* Progress Indicator */}
                <div className="mb-8 flex items-center gap-2 fade-in-up">
                    {[1, 2].map((s) => (
                        <React.Fragment key={s}>
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                    s === step 
                                        ? 'bg-secondary text-secondary-foreground shadow-glow' 
                                        : s < step 
                                            ? 'bg-secondary/80 text-secondary-foreground' 
                                            : 'bg-primary-foreground/20 text-primary-foreground/50'
                                }`}
                            >
                                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            {s < 2 && (
                                <div 
                                    className={`w-16 md:w-24 h-0.5 transition-all ${
                                        s < step ? 'bg-secondary' : 'bg-primary-foreground/20'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Role Badge */}
                <div className="mb-6 fade-in-up">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${config.color}/20 border border-${config.color}/30`}>
                        <RoleIcon className={`h-4 w-4 text-${config.color}`} />
                        <span className={`text-sm font-medium text-primary-foreground`}>
                            {config.title} Registration
                        </span>
                    </div>
                </div>

                {/* Sign Up Card */}
                <Card className="w-full max-w-lg glass-card fade-in-up">
                    <CardHeader className="space-y-2 text-center pb-4">
                        <div className={`mx-auto w-14 h-14 rounded-2xl bg-${config.color}/10 flex items-center justify-center mb-2`}>
                            <RoleIcon className={`h-7 w-7 text-${config.color}`} />
                        </div>
                        <CardTitle className="font-heading text-2xl text-foreground">
                            {step === 1 ? 'Company Information' : 'Account Setup'}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {step === 1 
                                ? `Register as a ${config.subtitle}` 
                                : 'Set up your login credentials'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            {step === 1 ? renderStep1() : renderStep2()}
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 pt-6 border-t border-border text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-secondary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <p className="mt-8 text-xs text-primary-foreground/40 text-center max-w-md">
                    Your account will be reviewed by our team. You&apos;ll receive an email notification once approved.
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
