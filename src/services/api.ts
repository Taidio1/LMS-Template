/**
 * LMS API Client
 * Centralized service for all backend API calls with automatic JWT injection
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Token management
const getToken = (): string | null => localStorage.getItem('token');
const setToken = (token: string): void => localStorage.setItem('token', token);
const removeToken = (): void => localStorage.removeItem('token');

// Custom error class for API errors
export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(response: Response, data?: unknown) {
        super(data && typeof data === 'object' && 'error' in data
            ? String((data as { error: string }).error)
            : `HTTP ${response.status}`);
        this.status = response.status;
        this.data = data;
        this.name = 'ApiError';
    }
}

// Response type for auth endpoints
interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        name: string;
        role: 'admin' | 'learner';
        department?: string;
    };
}

interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: 'admin' | 'learner';
    department?: string;
    businessUnit?: string;
    lastLoginAt?: string;
}

// Course types
export interface CourseAssignmentResponse {
    id: string;
    courseId: string;
    userId: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    assignedAt: string;
    deadline: string;
    completedAt?: string;
    lastAccessAt?: string;
    secondsRemaining: number;
    isOverdue: boolean;
    isUrgent: boolean;
    course: {
        id: string;
        title: string;
        description?: string;
        categoryId?: number;
        categoryName?: string;
        orderInCategory?: number;
        category?: string;
        department?: string;
        version: string;
        status: string;
        deadlineDays: number;
        hasCourseTest: boolean;
    };
}

export interface EnrichedCourseAssignment extends CourseAssignmentResponse {
    isLocked?: boolean;
}

// Category types
export interface CategoryResponse {
    id: number;
    name: string;
    order_index: number;
}

// Admin Course types
export interface AdminCourseResponse {
    id: string;
    title: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    orderInCategory?: number;
    category?: string; // Legacy
    department?: string;
    version: string;
    status: 'draft' | 'published' | 'archived';
    deadlineDays: number;
    deadlineHours?: number;
    hasCourseTest: boolean;
    owner?: string;
    assignmentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCourseRequest {
    title: string;
    description?: string;
    categoryId?: number;
    orderInCategory?: number;
    category?: string; // Legacy
    department?: string;
    deadlineDays?: number;
    deadlineHours?: number;
    version?: string;
}

export interface UpdateCourseRequest {
    title?: string;
    description?: string;
    categoryId?: number;
    orderInCategory?: number;
    category?: string; // Legacy
    department?: string;
    deadlineDays?: number;
    deadlineHours?: number;
    version?: string;
}

// Progress types
export interface ProgressResponse {
    assignmentId: string;
    overallPercentage: number;
    completedItems: number;
    totalItems: number;
    canComplete: boolean;
    items: {
        chapterId: string;
        title: string;
        type: string;
        currentPage: number;
        isCompleted: boolean;
        timeSpentSeconds: number;
        lastViewedAt?: string;
        answers?: {
            questionIndex: number;
            selectedOptionIndex: number;
            isCorrect: boolean;
        }[];
    }[];
}

// Program types
export interface ProgramResponse {
    id: string;
    title: string;
    businessUnit: string;
    image: string;
    totalCourses: number;
    completedCourses: number;
    progressPercentage: number;
}

export interface ProgramCourseAssignment extends CourseAssignmentResponse {
    isLocked: boolean;
}

export interface ProgramDetailResponse {
    id: string;
    title: string;
    businessUnit: string;
    courses: ProgramCourseAssignment[];
}

export interface ProgressUpdateRequest {
    chapterId: string;
    currentPage: number;
    timeSpentSeconds?: number;
    answers?: any[];
}

// User Management types (Admin)
export interface LearnerUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    businessUnit?: string;
    status: 'active' | 'inactive' | 'deleted';
    lastLoginAt?: string;
    createdAt: string;
    assignedCoursesCount: number;
}

export interface UserAssignmentResponse {
    id: string;
    courseId: string;
    assignedAt: string;
    deadline: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    completedAt?: string;
    lastAccessAt?: string;
    course: {
        id: string;
        title: string;
        description?: string;
        category?: string;
        version: string;
    };
}

export interface LearnerUserDetailResponse extends LearnerUserResponse {
    assignments: UserAssignmentResponse[];
}

export interface CreateUserRequestData {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    businessUnit?: string;
}

export interface CreateUserResponseData {
    user: LearnerUserResponse;
    generatedPassword: string;
}

export interface UpdateUserRequestData {
    firstName?: string;
    lastName?: string;
    department?: string;
    businessUnit?: string;
}

export interface AssignCourseRequestData {
    courseId: string;
    deadlineDays?: number;
}

/**
 * Base fetch wrapper with auth headers and error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data: unknown;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        // Handle 401 - clear token and redirect to login
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
        }
        throw new ApiError(response, data);
    }

    return data as T;
}

/**
 * API methods organized by resource
 */
export const api = {
    // Auth endpoints
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse> => {
            const response = await apiFetch<AuthResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setToken(response.token);
            return response;
        },

        me: async (): Promise<UserResponse> => {
            return apiFetch<UserResponse>('/auth/me');
        },

        logout: async (): Promise<void> => {
            try {
                await apiFetch('/auth/logout', { method: 'POST' });
            } finally {
                removeToken();
            }
        },

        isAuthenticated: (): boolean => {
            return !!getToken();
        },

        getToken,
        removeToken,
    },

    // Category endpoints
    categories: {
        getAll: async (): Promise<CategoryResponse[]> => {
            return apiFetch<CategoryResponse[]>('/categories');
        },
        create: async (name: string): Promise<CategoryResponse> => {
            return apiFetch<CategoryResponse>('/categories', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
        },
        update: async (id: number, name: string): Promise<CategoryResponse> => {
            return apiFetch<CategoryResponse>(`/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name }),
            });
        },
        delete: async (id: number): Promise<void> => {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
        },
        reorder: async (categoryIds: number[]): Promise<void> => {
            await apiFetch('/categories/reorder', {
                method: 'PUT',
                body: JSON.stringify({ categoryIds }),
            });
        },
    },

    // Course endpoints
    courses: {
        getMyCourses: async (): Promise<CourseAssignmentResponse[]> => {
            return apiFetch<CourseAssignmentResponse[]>('/courses/my-courses');
        },

        getById: async (courseId: string): Promise<unknown> => {
            return apiFetch(`/courses/${courseId}`);
        },

        // Admin endpoints
        getAll: async (): Promise<AdminCourseResponse[]> => {
            return apiFetch<AdminCourseResponse[]>('/courses');
        },

        create: async (data: CreateCourseRequest): Promise<AdminCourseResponse> => {
            return apiFetch<AdminCourseResponse>('/courses', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        update: async (id: string, data: UpdateCourseRequest): Promise<AdminCourseResponse> => {
            return apiFetch<AdminCourseResponse>(`/courses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },

        updateChapters: async (id: string, chapters: unknown[]): Promise<unknown[]> => {
            return apiFetch<unknown[]>(`/courses/${id}/chapters`, {
                method: 'PUT',
                body: JSON.stringify(chapters),
            });
        },

        delete: async (id: string): Promise<void> => {
            await apiFetch(`/courses/${id}`, { method: 'DELETE' });
        },

        publish: async (id: string): Promise<{ message: string; status: string }> => {
            return apiFetch<{ message: string; status: string }>(`/courses/${id}/publish`, {
                method: 'POST',
            });
        },

        archive: async (id: string): Promise<{ message: string; status: string }> => {
            return apiFetch<{ message: string; status: string }>(`/courses/${id}/archive`, {
                method: 'POST',
            });
        },
    },

    // Progress endpoints
    progress: {
        get: async (assignmentId: string): Promise<ProgressResponse> => {
            return apiFetch<ProgressResponse>(`/progress/${assignmentId}`);
        },

        update: async (assignmentId: string, data: ProgressUpdateRequest): Promise<unknown> => {
            return apiFetch(`/progress/${assignmentId}`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        completeChapter: async (assignmentId: string, chapterId: string): Promise<unknown> => {
            return apiFetch(`/progress/${assignmentId}/chapters/${chapterId}/complete`, {
                method: 'POST',
            });
        },

        complete: async (assignmentId: string): Promise<unknown> => {
            return apiFetch(`/progress/${assignmentId}/complete`, {
                method: 'POST',
            });
        },
    },

    // Program endpoints
    programs: {
        getAll: async (): Promise<ProgramResponse[]> => {
            return apiFetch<ProgramResponse[]>('/programs');
        },

        getById: async (programId: string): Promise<ProgramDetailResponse> => {
            return apiFetch<ProgramDetailResponse>(`/programs/${programId}`);
        },
    },

    // User Management endpoints (Admin only)
    users: {
        getAll: async (): Promise<LearnerUserResponse[]> => {
            return apiFetch<LearnerUserResponse[]>('/users');
        },

        getById: async (id: string): Promise<LearnerUserDetailResponse> => {
            return apiFetch<LearnerUserDetailResponse>(`/users/${id}`);
        },

        create: async (data: CreateUserRequestData): Promise<CreateUserResponseData> => {
            return apiFetch<CreateUserResponseData>('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        update: async (id: string, data: UpdateUserRequestData): Promise<LearnerUserResponse> => {
            return apiFetch<LearnerUserResponse>(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },

        deactivate: async (id: string): Promise<void> => {
            await apiFetch(`/users/${id}/deactivate`, { method: 'POST' });
        },

        reactivate: async (id: string): Promise<void> => {
            await apiFetch(`/users/${id}/reactivate`, { method: 'POST' });
        },

        delete: async (id: string): Promise<void> => {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
        },

        resetPassword: async (id: string): Promise<{ newPassword: string }> => {
            return apiFetch<{ newPassword: string }>(`/users/${id}/reset-password`, { method: 'POST' });
        },

        getAssignments: async (id: string): Promise<UserAssignmentResponse[]> => {
            return apiFetch<UserAssignmentResponse[]>(`/users/${id}/assignments`);
        },

        assignCourse: async (id: string, data: AssignCourseRequestData): Promise<UserAssignmentResponse> => {
            return apiFetch<UserAssignmentResponse>(`/users/${id}/assign-course`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        unassignCourse: async (id: string, assignmentId: string): Promise<void> => {
            await apiFetch(`/users/${id}/assignments/${assignmentId}`, { method: 'DELETE' });
        },

        bulkAssignCourses: async (userIds: string[], courseIds: string[], deadlineDays?: number): Promise<{ message: string, summary: any, skipped: any[] }> => {
            return apiFetch('/users/bulk-assign', {
                method: 'POST',
                body: JSON.stringify({ userIds, courseIds, deadlineDays }),
            });
        },
    },

    // Generic File Upload
    files: {
        upload: async (file: File): Promise<{ url: string; filename: string; originalName: string; mimetype: string; size: number }> => {
            const formData = new FormData();
            formData.append('file', file);
            return apiFetch<{ url: string; filename: string; originalName: string; mimetype: string; size: number }>('/upload', {
                method: 'POST',
                body: formData,
            });
        },
    },

    // Health check
    health: async (): Promise<{ status: string; timestamp: string }> => {
        return apiFetch('/health');
    },
};

export default api;
