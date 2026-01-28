import { Chapter } from '@/features/admin-panel/components/ChapterList';

export interface Course {
    id: string;
    title: string;
    description?: string;
    is_published: boolean;
    image?: string;
    duration?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
    tags?: string[];
    deadlineDays?: number;
}

export const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        title: 'Information Security Awareness',
        description: 'Comprehensive training on information security protocols, compliance standards, and best practices for data protection in the workplace.',
        is_published: true,
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        duration: '30 days',
        level: 'Beginner',
        tags: ['security', 'compliance']
    }
];

export const MOCK_CHAPTERS: Record<string, Chapter[]> = {
    'c1': [
        {
            id: 'ch1',
            title: 'Welcome to InfoSec',
            type: 'video',
            order: 0,
            content: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
        },
        {
            id: 'ch2',
            title: 'Password Security Policy',
            type: 'slide',
            order: 1,
            content: {
                slides: [
                    { id: 's1', title: 'Strong Passwords', text: 'Use at least 12 characters, mixing letters, numbers, and symbols.', imageUrl: '' },
                    { id: 's2', title: 'MFA', text: 'Always enable Multi-Factor Authentication where possible.', imageUrl: '' }
                ]
            }
        },
        {
            id: 'ch3',
            title: 'Phishing Awareness',
            type: 'slide',
            order: 2,
            content: {
                slides: [
                    { id: 'p1', title: 'Spotting Phishing', text: 'Check the sender address and hover over links before clicking.', imageUrl: '' },
                    { id: 'p2', title: 'Reporting', text: 'Report suspicious emails to the IT security team immediately.', imageUrl: '' }
                ]
            }
        },
        {
            id: 'ch4',
            title: 'Compliance & Ethics',
            type: 'quiz',
            order: 3,
            content: {
                questions: [
                    { id: 'q1', question: 'How often should you lock your computer?', options: ['When leaving for lunch', 'Whenever you step away', 'Never'], correctOptionIndex: 1 },
                    { id: 'q2', question: 'Is sharing passwords allowed?', options: ['Yes, with colleagues', 'No, never', 'Only with manager'], correctOptionIndex: 1 }
                ]
            }
        },
        {
            id: 'ch5',
            title: 'Data Classification',
            type: 'slide',
            order: 4,
            content: { slides: [{ id: 'd1', title: 'Confidential Data', text: 'Handle with extreme care.', imageUrl: '' }] }
        },
        {
            id: 'ch6',
            title: 'Physical Security',
            type: 'video',
            order: 5,
            content: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
        },
        {
            id: 'ch7',
            title: 'Final Assessment',
            type: 'quiz',
            order: 6,
            content: {
                questions: [
                    { id: 'fq1', question: 'What is the first line of defense?', options: ['Firewall', 'You', 'Antivirus'], correctOptionIndex: 1 }
                ]
            }
        }
    ]
};

export const MOCK_PROGRESS: Record<string, Record<string, any>> = {};
