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
  phaseStartTimestamps?: { [phaseId: number]: number }; // Timestamp d'entrée dans chaque phase
}

export interface TeamAlert {
  id: string;
  teamId: number;
  teamName: string;
  phaseId: number;
  type: 'overtime_exercise' | 'phase_ending';
  message: string;
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
  bonusApplied: boolean;
  bonusAppliedAt: number | null;
  timerStopped: boolean;
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
