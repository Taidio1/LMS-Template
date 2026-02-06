export type UserRole = 'admin' | 'manager' | 'employee' | 'learner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description?: string;
  category?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
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
  completedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'single-choice' | 'open'; // Merged types
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  correctOptionIndex?: number; // From local types
  correctAnswerText?: string; // From local types
}

export interface TestAssignment {
  id: string;
  testId: string;
  courseId: string;
  userId: string;
  maxAttempts: number;
  assignedAt: string;
  deadlineDate?: string; // Optional to handle undefined
  periodicCycle?: 'days' | 'weeks' | 'months'; // From local types
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
  finishedAt?: string; // From local types alias
  status: 'in_progress' | 'completed' | 'abandoned' | 'started' | 'interrupted' | 'expired'; // Merged vars
  score?: number;
  answers: Record<string, string | string[]>;
}

// Merged TestSessionState to include fields from testing module
export interface TestSessionState {
  // Global fields
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  timeRemainingSeconds: number;

  // Local fields merged in
  isLoading?: boolean;
  isSessionActive?: boolean;
  currentAttempt?: TestAttempt | null;
  assignment?: TestAssignment | null;
  timeLeft?: number; // Alias for timeRemainingSeconds
  error?: string | null;
}

export type TestSessionAction =
  | { type: 'INIT_START'; payload: any }
  | { type: 'INIT_SESSION'; payload: { attempt: TestAttempt; assignment: TestAssignment } }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: any } }
  | { type: 'SYNC_ANSWERS_SUCCESS' }
  | { type: 'TICK_TIMER' }
  | { type: 'FINISH_TEST'; payload: { result: any } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'INTERRUPT_SESSION' };
