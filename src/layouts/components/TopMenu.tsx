import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export const TopMenu = () => {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo Area */}
                <div className="flex items-center">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        {/* Placeholder for Logo - keeping it simple text as per provided image for now, can be replaced with img */}
                        <div className="text-2xl font-serif italic text-slate-800 tracking-tight">
                            <span className="font-bold">[Logo]</span>
                        </div>
                    </Link>
                </div>

                {/* Right Navigation */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/courses"
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden md:flex items-center gap-1"
                    >
                        My Courses
                    </Link>
                    <Link
                        to="/help"
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden md:flex items-center gap-1"
                    >
                        Help Center
                    </Link>
                    <Link
                        to="/contact"
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden md:flex items-center gap-1"
                    >
                        Contact
                    </Link>

                    <div className="h-6 w-px bg-slate-200 hidden md:block" />

                    {/* User Profile Dropdown / Area */}
                    <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="hidden md:block text-right">
                            <div className="text-sm font-medium text-slate-900">{user?.name || 'User'}</div>
                        </div>
                        {/* Avatar */}
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                            {/* Mock Avatar based on visual */}
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                alt="User Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </Link>

                    {/* Logout Button (Simple version for top menu) */}
                    <button
                        onClick={logout}
                        className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};
