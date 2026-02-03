import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProgramDetailsPage } from '@/features/dashboard/pages/ProgramDetailsPage';
import { AdminCourseEditor } from '@/features/admin-panel/pages/AdminCourseEditor';
import { AdminUsersPage } from '@/features/admin-panel/pages/AdminUsersPage';
import { AdminCoursesPage } from '@/features/admin-panel/pages/AdminCoursesPage';
import { CoursePlayerPage } from '@/features/courses/pages/CoursePlayerPage';
import { UserProfilePage } from '@/features/profile/pages/UserProfilePage';
import { MyCoursesPage } from '@/features/dashboard/pages/MyCoursesPage';
import { TestingAdminPage } from '@/modules/testing/pages/TestingAdminPage';
import { TestingLearnerPage } from '@/modules/testing/pages/TestingLearnerPage';
import { TestSessionPage } from '@/modules/testing/pages/TestSessionPage';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Layout Wrapper
const AppLayout = () => {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    )
}

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginForm />} />

                        {/* Root Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Protected Routes */}
                        <Route element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }>
                            {/* Learner Routes */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/program/:programId" element={<ProgramDetailsPage />} />
                            <Route path="/courses" element={<MyCoursesPage />} />
                            <Route path="/my-courses" element={<Navigate to="/courses" replace />} />
                            <Route path="/courses/:courseId" element={<CoursePlayerPage />} />
                            <Route path="/profile" element={<UserProfilePage />} />
                            <Route path="/history" element={<div>History Placeholder</div>} />

                            {/* Testing Module Demo */}
                            <Route path="/test-demo" element={<TestingLearnerPage />} />
                            <Route path="/testing/session/:assignmentId" element={<TestSessionPage />} />

                            {/* Admin Routes */}
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <div>Admin Dashboard Placeholder</div>
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/users" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminUsersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/courses" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminCoursesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/course-editor/:courseId" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminCourseEditor />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/tests" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <TestingAdminPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/settings" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <div>Settings Placeholder</div>
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
