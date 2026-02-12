import {
  Team,
  HackathonSession,
  Student,
  Level,
} from "../types";
import {
  saveHackathonSessionToFirebase,
  getHackathonSessionOnce,
  getAllHackathonSessions,
  updateHackathonSession,
  removeHackathonSession,
  registerStudentInFirebase,
  unregisterStudentFromFirebase,
  getRegisteredStudentFromFirebase,
} from "../../../../config/firebase";

// Définition des niveaux du jeu basés sur le scénario détaillé
export const hackathonLevels: Level[] = [
  {
    id: 0,
    name: "Préparation des données",
    description:
      "Nettoyez et préparez les données brutes dispersées et incohérentes",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Pour commencer, vous devez fusionner et nettoyer les données provenant de trois sources différentes: un fichier CSV des commandes, un fichier Excel des stocks et un fichier texte des fournisseurs.",
    exerciseQuestion:
      "Combien de produits sont en rupture de stock ET ont une demande prioritaire?",
    answerFormat: "Nombre entier (ex: 12)",
    hint: "Utilisez Power Query pour importer les différentes sources. Ensuite, utilisez des formules comme TRIM, CLEAN et PROPER pour standardiser les formats. N'oubliez pas de vérifier les valeurs aberrantes.",
    functionRequired: ["Power Query", "TRIM", "CLEAN", "PROPER"],
    timeAllocation: 20,
    pointsValue: 300,
  },
  {
    id: 1,
    name: "Accès au serveur",
    description:
      "Retrouvez les identifiants de connexion au serveur de l'entreprise",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Les identifiants pour accéder au serveur sont cachés dans les données. Vous devez identifier les produits en rupture de stock avec une demande élevée, puis extraire les identifiants correspondants.",
    exerciseQuestion:
      "Quel est le code d'accès formé par la combinaison des fournisseurs des produits critiques?",
    answerFormat: "Format texte avec tirets (ex: ALPHA-BETA-GAMMA)",
    hint: "Utilisez XLOOKUP pour rechercher les informations des produits en rupture, puis FILTER pour ne garder que ceux avec une demande supérieure à 100 unités. Enfin, utilisez UNIQUE pour extraire les fournisseurs sans doublon.",
    functionRequired: ["XLOOKUP", "FILTER", "UNIQUE"],
    timeAllocation: 15,
    pointsValue: 200,
  },
  {
    id: 2,
    name: "Reconstruction des données",
    description:
      "Réorganisez les données client dispersées pour reconstituer la base",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "La base de données clients est fragmentée et désorganisée. Vous devez la reconstruire en réorganisant les informations et en créant une structure cohérente.",
    exerciseQuestion:
      "Combien de clients prioritaires avez-vous identifiés dans la région Nord après reconstruction?",
    answerFormat: "Nombre entier (ex: 8)",
    hint: "Utilisez SEQUENCE pour générer des identifiants séquentiels, CHOOSECOLS pour sélectionner uniquement les colonnes pertinentes, et BYROW pour appliquer une logique par ligne qui identifie les clients prioritaires.",
    functionRequired: ["SEQUENCE", "CHOOSECOLS", "BYROW", "BYCOL"],
    timeAllocation: 15,
    pointsValue: 200,
  },
  {
    id: 3,
    name: "Analyse des tendances",
    description: "Transformez les données pour faire apparaître les tendances",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Les données des tendances de vente sont mal orientées et contiennent des informations parasites. Vous devez les transformer pour identifier clairement les tendances par catégorie.",
    exerciseQuestion:
      "Quel est le taux de croissance (en %) de la catégorie 'Électronique' sur la période analysée?",
    answerFormat: "Pourcentage avec 2 décimales (ex: 12.45)",
    hint: "Utilisez DROP pour supprimer les colonnes inutiles, TAKE pour sélectionner les périodes pertinentes, puis TRANSPOSE pour réorienter les données. Ensuite, utilisez MAP avec LET pour calculer les taux de croissance de chaque catégorie.",
    functionRequired: ["DROP", "TAKE", "TRANSPOSE", "LET", "MAP"],
    timeAllocation: 15,
    pointsValue: 200,
  },
  {
    id: 4,
    name: "Consolidation du rapport",
    description: "Assemblez et consolidez les différentes parties du rapport",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Vous devez consolider les données des quatre régions en un rapport unifié. Cela implique de fusionner verticalement et horizontalement les données, puis de les pivoter pour une vue synthétique.",
    exerciseQuestion:
      "Quelle région présente le meilleur ratio ventes/stock après consolidation?",
    answerFormat: "Nom de région (ex: Est)",
    hint: "Utilisez VSTACK pour combiner verticalement les tableaux régionaux, puis GROUPBY pour agréger les données par région et catégorie. Enfin, créez des ratios avec les valeurs agrégées pour identifier la région la plus performante.",
    functionRequired: ["VSTACK", "HSTACK", "GROUPBY", "PIVOTBY"],
    timeAllocation: 15,
    pointsValue: 200,
  },
  {
    id: 5,
    name: "Finalisation de l'analyse",
    description:
      "Finalisez l'analyse et préparez les données pour la visualisation",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Vous devez finaliser l'analyse avec des calculs de métriques avancées et préparer les projections pour le tableau de bord.",
    exerciseQuestion:
      "Quelle est la prévision de croissance (en %) pour le prochain trimestre selon votre analyse?",
    answerFormat: "Pourcentage avec 1 décimale (ex: 8.5)",
    hint: "Utilisez SCAN pour calculer des cumuls progressifs, REDUCE pour construire une structure de projection, et OFFSET pour créer des fenêtres glissantes d'analyse. L'objectif est d'identifier les tendances et de les projeter pour le trimestre suivant.",
    functionRequired: ["REDUCE", "SCAN", "TOCOL", "TOROW", "OFFSET"],
    timeAllocation: 15,
    pointsValue: 200,
  },
  {
    id: 6,
    name: "Création du tableau de bord",
    description:
      "Créez un tableau de bord impactant et interactif pour la présentation",
    instruction: "Consigne en cours de rédaction",
    exerciseDescription:
      "Vous devez transformer toutes vos analyses en un tableau de bord visuellement impactant et interactif pour la présentation au conseil d'administration de Nexus.",
    exerciseQuestion:
      "Quel est le principal insight stratégique que vous avez identifié suite à votre analyse complète?",
    answerFormat: "Phrase concise résumant l'insight clé",
    hint: "Commencez par identifier 3-5 messages clés que vous voulez communiquer. Pour chacun, choisissez la visualisation la plus appropriée (graphique à barres, ligne, secteurs, etc.) et créez un layout cohérent. N'oubliez pas d'ajouter des filtres interactifs avec les segments (slicers).",
    functionRequired: [
      "Tableaux croisés dynamiques",
      "Graphiques",
      "Segments",
      "Mise en forme conditionnelle",
    ],
    timeAllocation: 25,
    pointsValue: 300,
  },
];

// Initialiser l'objet de progression
const initializeProgressObject = () => {
  const progress: { [key: number]: number } = {};
  hackathonLevels.forEach((level) => {
    progress[level.id] = 0;
  });
  return progress;
};

// Générer un ID de session unique
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Type de retour pour fetchInitialState
export interface InitialHackathonState {
  teams?: Team[];
  timeLeft?: number; // en minutes
  sessionId?: string;
  sessionActive?: boolean;
  isSessionStarted?: boolean;
  startTime?: number | null;
}

// Noms d'équipes par défaut
const defaultTeamNames = [
  "Équipe Alpha",
  "Équipe Beta",
  "Équipe Gamma",
  "Équipe Delta",
  "Équipe Epsilon",
  "Équipe Zeta",
  "Équipe Eta",
  "Équipe Theta",
  "Équipe Iota",
  "Équipe Kappa",
];

// Récupérer l'état initial depuis Firebase
export const fetchInitialState = async (): Promise<InitialHackathonState> => {
  try {
    const allSessions = await getAllHackathonSessions();
    if (!allSessions) {
      return { teams: [], timeLeft: 120, sessionId: "" };
    }

    // Trouver la session active la plus récente
    let activeSession: any = null;
    let activeSessionId: string = "";

    for (const [id, session] of Object.entries(allSessions)) {
      if (session && session.sessionActive !== false && session.isActive !== false) {
        if (!activeSession || (session.sessionCreationTime || 0) > (activeSession.sessionCreationTime || 0)) {
          activeSession = session;
          activeSessionId = id;
        }
      }
    }

    if (!activeSession) {
      return { teams: [], timeLeft: 120, sessionId: "" };
    }

    // S'assurer que les équipes ont toutes les propriétés correctement initialisées
    const rawTeams = activeSession.teams || [];
    const teams: Team[] = rawTeams.map((team: any) => {
      if (!team) return null;
      return {
        ...team,
        progress: team.progress || initializeProgressObject(),
        completedLevels: team.completedLevels || [],
        currentLevel: team.currentLevel ?? 0,
        studentIds: team.studentIds || [],
      };
    }).filter(Boolean);

    const hasStarted = activeSession.startTime != null;
    const timeLeft = hasStarted ? calculateTimeLeft(activeSession) : 120;

    return {
      teams,
      sessionId: activeSessionId,
      timeLeft,
      sessionActive: true,
      isSessionStarted: hasStarted,
      startTime: activeSession.startTime || null,
    };
  } catch (error) {
    console.error("Error fetching initial state from Firebase:", error);
    return {};
  }
};

// Synchroniser les données des équipes vers Firebase
export const syncTeamsData = async (
  teams: Team[],
  sessionId: string
): Promise<void> => {
  if (!sessionId) return;
  try {
    await updateHackathonSession(sessionId, { teams });
  } catch (error) {
    console.error("Error syncing teams data to Firebase:", error);
  }
};

// Récupérer l'étudiant enregistré depuis Firebase
export const getStudentFromFirebase = async (
  sessionId: string,
  userId: string
): Promise<Student | null> => {
  if (!sessionId || !userId) return null;
  try {
    const data = await getRegisteredStudentFromFirebase(sessionId, userId);
    if (data) {
      return {
        id: data.id,
        name: data.name,
        teamId: data.teamId,
        answers: data.answers || {},
        hintsUsed: data.hintsUsed || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving student from Firebase:", error);
    return null;
  }
};

// Enregistrer un étudiant dans une équipe (Firebase)
export const registerStudent = async (
  studentName: string,
  teamId: number,
  sessionId: string,
  userId: string
): Promise<Student> => {
  // Vérifier si la session existe et est active
  const sessionData = await getHackathonSessionOnce(sessionId);
  if (!sessionData || sessionData.sessionActive === false) {
    throw new Error("Session not active or not found");
  }

  // Créer un nouvel étudiant
  const newStudent: Student = {
    id: userId,
    name: studentName,
    teamId,
    answers: {},
    hintsUsed: [],
  };

  // Enregistrer dans Firebase
  await registerStudentInFirebase(sessionId, userId, newStudent);

  // Ajouter l'ID de l'étudiant à l'équipe
  const teams = sessionData.teams || [];
  const teamIndex = teams.findIndex((team: any) => team && team.id === teamId);
  if (teamIndex >= 0) {
    const team = teams[teamIndex];
    const studentIds = team.studentIds || [];
    if (!studentIds.includes(userId)) {
      studentIds.push(userId);
      teams[teamIndex] = { ...team, studentIds };
      await updateHackathonSession(sessionId, { teams });
    }
  }

  return newStudent;
};

// Retirer un étudiant d'une équipe (Firebase)
export const unregisterStudent = async (
  sessionId: string,
  userId: string,
  teamId: number
): Promise<boolean> => {
  try {
    // Retirer de la liste des étudiants enregistrés
    await unregisterStudentFromFirebase(sessionId, userId);

    // Retirer de l'équipe
    const sessionData = await getHackathonSessionOnce(sessionId);
    if (sessionData && sessionData.teams) {
      const teams = [...sessionData.teams];
      const teamIndex = teams.findIndex((team: any) => team && team.id === teamId);
      if (teamIndex >= 0) {
        const team = teams[teamIndex];
        const studentIds = (team.studentIds || []).filter((id: string) => id !== userId);
        teams[teamIndex] = { ...team, studentIds };
        await updateHackathonSession(sessionId, { teams });
      }
    }

    return true;
  } catch (error) {
    console.error("Error unregistering student:", error);
    return false;
  }
};

// Calculer le temps restant en fonction de la durée prévue
const calculateTimeLeft = (session: any): number => {
  const totalDurationMinutes = 120;
  if (!session.startTime) {
    return totalDurationMinutes;
  }
  const elapsedTimeMinutes = (Date.now() - session.startTime) / (1000 * 60);
  return Math.max(0, totalDurationMinutes - elapsedTimeMinutes);
};

// Créer une nouvelle session avec un nombre d'équipes configurable
export const createNewSession = async (
  teamCount: number = 4,
  customTeamNames?: string[]
): Promise<string> => {
  const sessionId = generateSessionId();
  const initialProgress = initializeProgressObject();
  const actualTeamCount = Math.max(2, Math.min(10, teamCount));

  const teams: Team[] = Array.from({ length: actualTeamCount }, (_, index) => ({
    id: index + 1,
    name: customTeamNames?.[index] || defaultTeamNames[index] || `Équipe ${index + 1}`,
    score: 0,
    currentLevel: 0,
    progress: { ...initialProgress },
    completedLevels: [],
    studentIds: [],
  }));

  // Désactiver toutes les sessions actives existantes dans Firebase
  const allSessions = await getAllHackathonSessions();
  if (allSessions) {
    for (const [id, session] of Object.entries(allSessions)) {
      if (session && (session.sessionActive !== false && session.isActive !== false)) {
        await updateHackathonSession(id, { sessionActive: false, isActive: false });
      }
    }
  }

  // Sauvegarder la nouvelle session dans Firebase
  await saveHackathonSessionToFirebase(sessionId, {
    teams,
    isSessionStarted: false,
    timeLeft: 120,
    seconds: 0,
    sessionActive: true,
    startTime: null,
  });

  // Ajouter les métadonnées
  await updateHackathonSession(sessionId, {
    sessionCreationTime: Date.now(),
    isActive: true,
  });

  return sessionId;
};

// Démarrer une session existante
export const startSession = async (sessionId: string): Promise<boolean> => {
  try {
    const sessionData = await getHackathonSessionOnce(sessionId);
    if (!sessionData || sessionData.sessionActive === false) return false;

    // Vérifier si la session est déjà démarrée
    if (sessionData.startTime) {
      return true;
    }

    await updateHackathonSession(sessionId, {
      startTime: Date.now(),
      isSessionStarted: true,
      timeLeft: 120,
      seconds: 0,
    });

    return true;
  } catch (error) {
    console.error("Error starting session:", error);
    return false;
  }
};

// Mettre à jour le nom d'une équipe
export const updateTeamName = async (
  sessionId: string,
  teamId: number,
  newTeamName: string
): Promise<boolean> => {
  try {
    const sessionData = await getHackathonSessionOnce(sessionId);
    if (!sessionData) return false;

    const teams = sessionData.teams || [];
    const teamIndex = teams.findIndex((team: any) => team && team.id === teamId);
    if (teamIndex === -1) return false;

    teams[teamIndex].name = newTeamName;
    await updateHackathonSession(sessionId, { teams });

    return true;
  } catch (error) {
    console.error("Error updating team name:", error);
    return false;
  }
};

// Terminer une session existante
export const endSession = async (sessionId: string): Promise<boolean> => {
  try {
    await updateHackathonSession(sessionId, {
      sessionActive: false,
      isActive: false,
      isSessionStarted: false,
      endTime: Date.now(),
    });

    return true;
  } catch (error) {
    console.error("Error ending session:", error);
    return false;
  }
};

// Supprimer une session de Firebase
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    await removeHackathonSession(sessionId);
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
};

// Récupérer toutes les sessions depuis Firebase
export const getAllSessions = async (): Promise<HackathonSession[]> => {
  try {
    const allSessions = await getAllHackathonSessions();
    if (!allSessions) return [];

    return Object.entries(allSessions).map(([id, session]: [string, any]) => ({
      id,
      teams: (session.teams || []).filter(Boolean),
      sessionCreationTime: session.sessionCreationTime || 0,
      startTime: session.startTime || null,
      endTime: session.endTime,
      isActive: session.sessionActive !== false && session.isActive !== false,
    }));
  } catch (error) {
    console.error("Error fetching all sessions:", error);
    return [];
  }
};
