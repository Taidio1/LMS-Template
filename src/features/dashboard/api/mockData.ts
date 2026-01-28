import { CourseAssignment, TrainingCourse } from '@/types';

// Helper to create dates relative to now
const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
};

export interface Program {
    id: string;
    title: string;
    businessUnit: string;
    image: string; // URL to image
    description?: string;
    courses: (CourseAssignment & { course: TrainingCourse })[];
}

const MOCK_COURSES_ONBOARDING: (CourseAssignment & { course: TrainingCourse })[] = [
    {
        id: '1',
        userId: 'learner-1',
        courseId: 'c1',
        assignedAt: daysFromNow(-30),
        deadline: daysFromNow(-1), // Expired yesterday
        status: 'overdue',
        progress: 10,
        course: {
            id: 'c1',
            title: 'Information Security Awareness',
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
            description: 'Essential training on data protection, phishing, and password security.',
            tags: ['security', 'compliance'],
            ownerId: 'admin-1',
            version: '1.0',
            status: 'published',
            deadlineDays: 30,
            createdAt: daysFromNow(-60),
            updatedAt: daysFromNow(-60),
            content: [],
            prerequisites: []
        }
    },
    {
        id: '4',
        userId: 'learner-1',
        courseId: 'c4',
        assignedAt: daysFromNow(-60),
        deadline: daysFromNow(-30),
        completedAt: daysFromNow(-35),
        status: 'completed',
        progress: 100,
        course: {
            id: 'c4',
            title: 'Company Code of Conduct',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
            description: 'Review of our core values and ethical standards.',
            tags: ['hr', 'onboarding'],
            ownerId: 'admin-1',
            version: '1.0',
            status: 'published',
            deadlineDays: 30,
            createdAt: daysFromNow(-90),
            updatedAt: daysFromNow(-90),
            content: [],
            prerequisites: ['c1']
        }
    }
];

const MOCK_COURSES_EDUCATION: (CourseAssignment & { course: TrainingCourse })[] = [
    {
        id: '2',
        userId: 'learner-1',
        courseId: 'c2',
        assignedAt: daysFromNow(-5),
        deadline: daysFromNow(25), // Due in 25 days
        status: 'in_progress',
        progress: 45,
        course: {
            id: 'c2',
            title: 'GDPR Fundamentals',
            image: 'https://images.unsplash.com/photo-1504384308090-c54be05323bd?auto=format&fit=crop&q=80&w=800',
            description: 'Understanding the General Data Protection Regulation and your responsibilities.',
            tags: ['compliance', 'legal'],
            ownerId: 'admin-1',
            version: '2.1',
            status: 'published',
            deadlineDays: 30,
            createdAt: daysFromNow(-40),
            updatedAt: daysFromNow(-10),
            content: [],
            prerequisites: []
        }
    },
    {
        id: '3',
        userId: 'learner-1',
        courseId: 'c3',
        assignedAt: daysFromNow(-2),
        deadline: daysFromNow(2), // Due soon
        status: 'not_started',
        progress: 0,
        course: {
            id: 'c3',
            title: 'Workplace Safety Standards',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
            description: 'Standard operating procedures for maintaining a safe work environment.',
            tags: ['safety', 'hr'],
            ownerId: 'admin-1',
            version: '1.0',
            status: 'published',
            deadlineDays: 7,
            createdAt: daysFromNow(-100),
            updatedAt: daysFromNow(-100),
            content: [],
            prerequisites: ['c2']
        }
    }
];

export const MOCK_PROGRAMS: Program[] = [
    {
        id: 'p1',
        title: 'Onboarding',
        businessUnit: 'Primary Care',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070', // Team photo
        description: 'Your journey starts here. Complete these foundational courses.',
        courses: MOCK_COURSES_ONBOARDING
    },
    {
        id: 'p2',
        title: 'Education',
        businessUnit: 'Primary Care',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2070', // Working people
        description: 'Ongoing professional development and compliance training.',
        courses: MOCK_COURSES_EDUCATION
    }
];

// Keep MOCK_COURSES for backward compatibility if needed, but composed of all program courses
export const MOCK_COURSES = [...MOCK_COURSES_ONBOARDING, ...MOCK_COURSES_EDUCATION];
