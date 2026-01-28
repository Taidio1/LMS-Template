export interface TrainingStage {
    id: string;
    title: string;
    subtitle?: string;
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    status: 'completed' | 'in-progress' | 'locked' | 'pending';
    footerText: string;
    actionLabel: string;
    iconType: 'intro' | 'book' | 'books' | 'university';
}

export const journeyStages: TrainingStage[] = [
    {
        id: 'intro',
        title: 'Introductory Training',
        completedCount: 15,
        totalCount: 15,
        progressPercentage: 100,
        status: 'completed',
        footerText: 'To be completed within 3 months',
        actionLabel: 'View Training',
        iconType: 'intro',
    },
    {
        id: 'content-1',
        title: 'Content training Stage 1',
        completedCount: 5,
        totalCount: 100,
        progressPercentage: 5, // Visual adjustment for demo: 5% looks small, maybe mockup explicitly asks for 50% in image? 
        // Image shows "5 of 100 Completed" but bar is at ~40-50%? 
        // Wait, image says "5 of 100 Completed" and "50%" on the right? 
        // That math fails (5/100 = 5%). 
        // I will stick to the text in image: "5 of 100 Completed" and "50%".
        // Update: I'll use the values to match the visual provided in the prompt image as closely as possible, 
        // but keep it logical if I can. 
        // Actually, let's just replicate the text in the image exactly for the mockup.
        status: 'in-progress',
        footerText: 'To be completed within 3 months',
        actionLabel: 'Continue Training',
        iconType: 'book',
    },
    {
        id: 'content-2',
        title: 'Content training Stage 2',
        completedCount: 0,
        totalCount: 10,
        progressPercentage: 0,
        status: 'pending', // or unlocked but 0%
        footerText: 'Required within 4 months of joining',
        actionLabel: 'Complete Previous',
        iconType: 'books',
    },
    {
        id: 'education',
        title: 'Education',
        completedCount: 0,
        totalCount: 10,
        progressPercentage: 0,
        status: 'locked',
        footerText: 'Locked',
        actionLabel: 'Complete Previous',
        iconType: 'university',
    },
];
