// Types communs pour les composants ExcelTraining
import { Student, Instructor } from "../../types/database";

// Type pour les sections
export type SectionType =
  | "menu"
  | "functions"
  | "bestPractices"
  | "hackathon"
  | "hackathonLanding"
  | "useCases";

// Type pour les vues du hackathon
export type HackathonViewType = "landing" | "student" | "global" | "scoreboard";

// Interface pour les props de navigation
export interface NavigationProps {
  navigateTo: (section: SectionType) => void;
}

// Interface pour les props de navigation étendues avec utilisateur
export interface ExtendedNavigationProps extends NavigationProps {
  currentUser?: Student | Instructor;
  onProgressUpdate?: (
    progressType: "speedDating" | "hackathon",
    progress: any
  ) => void;
}

// Interface pour les props de WorkInProgress
export interface WorkInProgressSectionProps extends NavigationProps {
  title: string;
}

// Interfaces pour les états avec indexation dynamique
export interface AnswersState {
  [key: string]: string;
}

export interface ValidatedState {
  [key: string]: boolean;
}

// Interface pour les données de fonction Excel
export interface ExcelFunction {
  name: string;
  avatar: string;
  superpower: string;
  description: string;
  presentation: string;
  exercise: string;
  exercisePrompt1: string;
  exercisePrompt2: string;
  trick: string;
}

// Interface pour les données du leaderboard (legacy - maintenu pour compatibilité)
export interface LeaderboardParticipant {
  name: string;
  completed: number;
  completedFunctions: number[];
  totalTime: string;
  totalScore?: number;
}

// Types pour les événements de progression
export interface ProgressEvent {
  userId: string;
  type: "speedDating" | "hackathon";
  data: any;
  timestamp: string;
}

// Types pour les notifications
export interface ProgressNotification {
  id: string;
  message: string;
  type: "success" | "achievement" | "milestone" | "warning" | "error";
  timestamp: Date;
  userId?: string;
}
