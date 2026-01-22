import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2, KeyRound, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import WorldMap from '@/components/WorldMap';
import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setErrors({ email: 'Email is required' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        setErrors({});
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('OTP Sent!', {
            description: `A 6-digit code has been sent to ${email}`
        });
        
        setIsLoading(false);
        setStep(2);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            setErrors({ otp: 'Please enter the complete 6-digit OTP' });
            return;
        }

        setIsLoading(true);
        setErrors({});
        
        // Simulate API call - mock OTP is always 123456
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (otp === '123456') {
            toast.success('OTP Verified!', {
                description: 'Please set your new password'
            });
            setStep(3);
        } else {
            toast.error('Invalid OTP', {
                description: 'The code you entered is incorrect. Try 123456 for demo.'
            });
            setErrors({ otp: 'Invalid OTP code' });
        }
        
        setIsLoading(false);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        
        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Password Reset Successful!', {
            description: 'You can now login with your new password'
        });
        
        setIsLoading(false);
        setStep(4);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground font-medium">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({});
                                    }}
                                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>
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
                                    Sending OTP...
                                </>
                            ) : (
                                'Send Reset Code'
                            )}
                        </Button>
                    </form>
                );

            case 2:
                return (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <InputOTP 
                                    maxLength={6} 
                                    value={otp} 
                                    onChange={setOtp}
                                    disabled={isLoading}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            {errors.otp && (
                                <p className="text-sm text-destructive text-center">{errors.otp}</p>
                            )}
                            <p className="text-xs text-muted-foreground text-center">
                                Demo OTP: <span className="font-mono text-secondary">123456</span>
                            </p>
                        </div>
                        <Button 
                            type="submit" 
                            variant="hero" 
                            size="lg" 
                            className="w-full"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-muted-foreground"
                            onClick={() => {
                                setOtp('');
                                handleRequestOTP({ preventDefault: () => {} });
                            }}
                            disabled={isLoading}
                        >
                            Resend Code
                        </Button>
                    </form>
                );

            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-foreground font-medium">
                                New Password
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                                    }}
                                    className={`pl-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-destructive">{errors.newPassword}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                            )}
                        </div>
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
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                );

            case 4:
                return (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <CheckCircle2 className="h-16 w-16 text-success" />
                                <div className="absolute inset-0 bg-success/20 blur-xl rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">
                                Password Reset Complete
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Your password has been successfully reset. You can now sign in with your new credentials.
                            </p>
                        </div>
                        <Button 
                            variant="hero" 
                            size="lg" 
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Forgot Password';
            case 2: return 'Verify OTP';
            case 3: return 'Set New Password';
            case 4: return 'Success!';
            default: return 'Reset Password';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Enter your email to receive a password reset code";
            case 2: return "We've sent a verification code to your email";
            case 3: return "Create a strong new password for your account";
            case 4: return "Your password has been updated successfully";
            default: return '';
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-hero">
            {/* Animated World Map Background */}
            <div className="absolute inset-0 z-0">
                <WorldMap />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/80 via-primary/60 to-primary-deep/90" />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-secondary/10 blur-3xl animate-float" />
            <div className="absolute bottom-32 left-20 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
                {/* Back to Login */}
                <Link 
                    to="/login" 
                    className="absolute top-6 left-6 flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back to Login</span>
                </Link>

                {/* Progress Indicator */}
                {step < 4 && (
                    <div className="mb-8 flex items-center gap-2 fade-in-up">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                        s === step 
                                            ? 'bg-secondary text-secondary-foreground shadow-glow' 
                                            : s < step 
                                                ? 'bg-secondary/80 text-secondary-foreground' 
                                                : 'bg-primary-foreground/20 text-primary-foreground/50'
                                    }`}
                                >
                                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div 
                                        className={`w-12 h-0.5 transition-all ${
                                            s < step ? 'bg-secondary' : 'bg-primary-foreground/20'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Reset Password Card */}
                <Card className="w-full max-w-md glass-card fade-in-up">
                    <CardHeader className="space-y-2 text-center pb-4">
                        <CardTitle className="font-heading text-2xl text-foreground">
                            {getStepTitle()}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {getStepDescription()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderStep()}
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-xs text-primary-foreground/40 text-center">
                    © 2024 TextileTrace. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
