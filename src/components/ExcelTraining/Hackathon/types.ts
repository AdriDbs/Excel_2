// Types pour le Hackathon

export interface Team {
  id: number;
  name: string;
  score: number;
  currentLevel: number;
  progress: { [key: number]: number };
  completedLevels?: number[];
  studentIds?: string[];
  errors?: number;          // Nombre de mauvaises réponses
  completionTime?: number;  // Timestamp (ms) quand tous les niveaux sont complétés
}

export interface Level {
  id: number;
  name: string;
  description: string;
  instruction: string; // consigne détaillée affichée à l'étudiant
  exerciseDescription: string;
  exerciseQuestion: string;
  answerFormat?: string;
  hint: string;
  functionRequired: string[];
  timeAllocation: number; // en minutes
  pointsValue?: number; // valeur en points du niveau
  /** Identifiant liant ce niveau à sa réponse dans hackathonAnswers.ts */
  exerciseId: string;
}

export interface Student {
  id: string;
  name: string;
  teamId: number;
  answers: { [key: number]: string };
  hintsUsed: number[];
}

export interface Notification {
  visible: boolean;
  message: string;
  type: "success" | "hint" | "error";
}

export interface HackathonState {
  teams: Team[];
  timeLeftSeconds: number; // temps restant en secondes totales
  notification: Notification;
  sessionId: string;
  isGlobalView: boolean;
  registeredStudent: Student | null;
  sessionActive: boolean;
  isSessionStarted: boolean;
}

export interface HackathonSession {
  id: string;
  teams: Team[];
  sessionCreationTime: number; // Quand la session a été créée
  startTime: number | null; // Quand la session a été démarrée manuellement, null si pas encore démarrée
  endTime?: number; // Quand la session a été terminée
  isActive: boolean;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: "user" | "broadcast" | "system";
  teamId?: number;
}
