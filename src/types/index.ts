export type UserRole = 'admin' | 'manager' | 'employee' | 'learner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  userId: string;
  assignedAt: string;
  deadline?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress?: number;
  score?: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

export interface TestAssignment {
  id: string;
  testId: string;
  courseId: string;
  userId: string;
  maxAttempts: number;
  assignedAt: string;
  deadlineDate?: string;
  test: {
    title: string;
    passingScore: number;
    durationMinutes: number;
    questionsCount: number;
    questions?: Question[];
  };
}

export interface TestAttempt {
  id: string;
  assignmentId: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  answers: Record<string, string | string[]>;
}

export interface TestSessionState {
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  timeRemainingSeconds: number;
}
