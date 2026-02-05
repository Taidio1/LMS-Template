export type UserRole = 'admin' | 'learner';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department?: string;
}

export type CourseStatus = 'draft' | 'published' | 'archived';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface TrainingCourse {
    id: string;
    title: string;
    description: string;
    tags: string[];
    department?: string;
    ownerId: string;
    version: string;
    status: CourseStatus;
    image?: string;
    deadlineDays?: number; // configured deadline in days
    createdAt: string;
    updatedAt: string;
    content: {
        type: 'pdf' | 'ppt';
        url: string;
        totalPages: number;
    }[];
    prerequisites?: string[]; // Array of course IDs that must be completed before this course
}

export interface CourseAssignment {
    id: string;
    userId: string;
    courseId: string;
    assignedAt: string; // ISO Date
    deadline: string; // ISO Date (calculated from assignedAt + course.deadlineDays)
    status: AssignmentStatus;
    completedAt?: string;
    progress: number; // 0-100 or current page
}

export interface PeriodicTest {
    id: string;
    title: string;
    frequencyDays: number; // e.g., every 30 days
    nextDueDate: string;
    lastTakenDate?: string;
}

// User Management Types (Admin)
export type UserStatus = 'active' | 'inactive' | 'deleted';

export interface LearnerUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    businessUnit?: string;
    status: UserStatus;
    lastLoginAt?: string;
    createdAt: string;
    assignedCoursesCount: number;
}

export interface LearnerUserDetail extends LearnerUser {
    assignments: UserCourseAssignment[];
}

export interface UserCourseAssignment {
    id: string;
    courseId: string;
    assignedAt: string;
    deadline: string;
    status: AssignmentStatus;
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

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    businessUnit?: string;
}

export interface CreateUserResponse {
    user: LearnerUser;
    generatedPassword: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    department?: string;
    businessUnit?: string;
}

export interface AssignCourseRequest {
    courseId: string;
    deadlineDays?: number;
}

