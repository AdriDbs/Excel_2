// Types pour la base de données des utilisateurs

export interface User {
  id: string;
  name: string;
  role: "instructor" | "student";
  createdAt: string;
  lastActivity: string;
}

export interface Student extends User {
  role: "student";
  speedDatingProgress: SpeedDatingProgress;
  hackathonProgress: HackathonProgress;
}

export interface Instructor extends User {
  role: "instructor";
}

export interface SpeedDatingProgress {
  [functionId: number]: {
    completed: boolean;
    score: number;
    timeSpent: number; // en secondes
    completedAt?: string;
    attempts: number;
  };
}

export interface HackathonProgress {
  teamId?: string;
  currentLevel: number;
  levelsCompleted: number[];
  totalScore: number;
  startTime?: string;
  endTime?: string;
  individualContributions: {
    [levelId: number]: {
      score: number;
      timeSpent: number;
      completedAt?: string;
    };
  };
}

export interface DatabaseState {
  users: (Student | Instructor)[];
  initialized: boolean;
  lastUpdated: string;
}

// Types pour les actions de base de données
export type DatabaseAction =
  | { type: "INITIALIZE_DATABASE" }
  | { type: "RESET_DATABASE" }
  | { type: "ADD_USER"; payload: Student | Instructor }
  | {
      type: "UPDATE_USER_PROGRESS";
      payload: {
        userId: string;
        progress: Partial<SpeedDatingProgress | HackathonProgress>;
      };
    }
  | { type: "UPDATE_LAST_ACTIVITY"; payload: { userId: string } }
  | { type: "DELETE_USER"; payload: { userId: string } };

// Interface pour les statistiques
export interface UserStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  activeToday: number;
  completionRates: {
    speedDating: number;
    hackathon: number;
  };
}
