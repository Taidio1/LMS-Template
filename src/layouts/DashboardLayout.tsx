import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LearnerLayout } from './LearnerLayout';
import clsx from 'clsx';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Menu,
    GraduationCap
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user, logout, hasRole } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = hasRole('admin');

    // If not admin (i.e. Learner), use the new LearnerLayout with Top Menu
    if (!isAdmin) {
        return <LearnerLayout>{children}</LearnerLayout>;
    }

    const navigation = [
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Course Library', href: '/admin/courses', icon: BookOpen },
        { name: 'Tests & Assessments', href: '/admin/tests', icon: GraduationCap },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 font-bold text-xl">
                    [LMS Name]
                </div>

                <nav className="space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-0 right-0 px-3">
                    <div className="mb-4 px-3">
                        <div className="text-sm font-medium text-white">{user?.name}</div>
                        <div className="text-xs text-slate-400">{user?.role}</div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top Header (Mobile only) */}
                <div className="sticky top-0 z-30 flex h-16 items-center bg-white px-4 shadow-sm lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-bold text-slate-900">[LMS Name]</span>
                </div>

                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
