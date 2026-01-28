import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const { login, isLoading, error, clearError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        clearError();
        try {
            await login(data.email, data.password);
        } catch {
            // Error is handled by AuthProvider
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans">
            {/* Left Column - Login Form */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative">
                <div className="w-full max-w-[420px] space-y-8">
                    {/* Logo Mobile Only */}
                    <div className="md:hidden flex justify-center mb-8">
                        <span className="text-2xl font-serif font-bold text-gray-800 tracking-wider">[Platform Name]</span>
                    </div>

                    {/* Logo Desktop */}
                    <div className="hidden md:flex justify-center mb-12">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-serif text-gray-800">[Platform Name]</span>
                        </div>
                    </div>


                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-[#1f4e5f]">Log in to [Platform Name]</h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">sign in with your credentials</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 ml-1">
                                Email
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                placeholder="your.email@example.com"
                                disabled={isLoading}
                                className={`block w-full px-4 py-3 rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-200'
                                    } bg-gray-50 focus:bg-white focus:ring-0 focus:border-[#008ba3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className={`block w-full px-4 py-3 pr-12 rounded-md border ${errors.password ? 'border-red-300' : 'border-gray-200'
                                        } bg-gray-50 focus:bg-white focus:ring-0 focus:border-[#008ba3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#008ba3] hover:bg-[#007a8f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008ba3] transition-colors uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-500">
                        Experiencing account problems? <a href="#" className="font-bold text-gray-700 hover:underline">Get support now.</a>
                    </p>
                </div>
            </div>

            {/* Right Column - Branding */}
            <div className="hidden md:flex w-1/2 bg-[#008ba3] flex-col justify-center px-16 text-white relative overflow-hidden">
                {/* Background Shape Overlay (Simplified) */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#006e82] rounded-tr-[100px] opacity-50 transform translate-y-1/4 -translate-x-1/4"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center space-x-3 mb-8">
                        {/* White Logo */}
                        <span className="text-3xl font-serif italic">[Platform Name]</span>
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Purpose-Driven Training.<br />
                        Impactful Teaching.
                    </h2>

                    <p className="text-lg opacity-90 leading-relaxed mb-12">
                        Deliver better training experiences with less effort.
                        [Platform Name] helps you engage learners and drive results that matter—with tools to create structured courses, monitor progress, and improve learning outcomes.
                    </p>

                    {/* Dashboard Preview Image Placeholder */}
                    <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gray-100 h-64 w-full flex items-center justify-center text-gray-400">
                            Dashboard Preview
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
