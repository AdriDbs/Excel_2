import {
  Team,
  HackathonSession,
  HackathonState,
  Student,
  Level,
} from "../types";

// Simuler le stockage de données côté "serveur"
const localStorageKey = "hackathon_session_data";
const studentStorageKey = "hackathon_registered_student";

// Définition des niveaux du jeu basés sur le scénario détaillé
export const hackathonLevels: Level[] = [
  {
    id: 0,
    name: "Préparation des données",
    description:
      "Nettoyez et préparez les données brutes dispersées et incohérentes",
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

// Récupérer l'état initial
export const fetchInitialState = async (): Promise<Partial<HackathonState>> => {
  try {
    // Simuler un délai de réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Récupérer les données depuis localStorage (simulation de base de données)
    const storedData = localStorage.getItem(localStorageKey);
    let sessionData: HackathonSession | null = null;

    if (storedData) {
      const sessions = JSON.parse(storedData) as HackathonSession[];
      // Trouver la session active la plus récente
      sessionData = sessions.find((session) => session.isActive) || null;
    }

    // Si aucune session active, créer des données d'exemple vides
    if (!sessionData) {
      return {
        teams: [],
        timeLeft: 120,
        sessionId: "",
      };
    }

    // S'assurer que les équipes ont toutes les propriétés correctement initialisées
    const teams = sessionData.teams.map((team) => {
      // S'assurer que progress est initialisé pour tous les niveaux
      if (!team.progress) {
        team.progress = initializeProgressObject();
      }

      // S'assurer que completedLevels existe
      if (!team.completedLevels) {
        team.completedLevels = [];
      }

      // S'assurer que currentLevel est initialisé
      if (team.currentLevel === undefined) {
        team.currentLevel = 0;
      }

      // S'assurer que studentIds existe
      if (!team.studentIds) {
        team.studentIds = [];
      }

      return team;
    });

    // Vérifier si la session a été démarrée
    const hasStarted = sessionData.startTime !== null;
    // Calculer le temps restant seulement si la session a été démarrée
    const timeLeft = hasStarted ? calculateTimeLeft(sessionData) : 120;

    return {
      teams,
      sessionId: sessionData.id,
      timeLeft: timeLeft,
      sessionActive: sessionData.isActive,
    };
  } catch (error) {
    console.error("Error fetching initial state:", error);
    return {};
  }
};

// Synchroniser les données des équipes
export const syncTeamsData = async (
  teams: Team[],
  sessionId: string
): Promise<void> => {
  try {
    // Simuler un délai de réseau
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Récupérer les sessions existantes
    const storedData = localStorage.getItem(localStorageKey);
    let sessions: HackathonSession[] = storedData ? JSON.parse(storedData) : [];

    // Trouver l'index de la session actuelle
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId
    );

    if (sessionIndex >= 0) {
      // Mettre à jour la session existante
      sessions[sessionIndex].teams = teams;
    } else {
      // Créer une nouvelle session
      const newSession: HackathonSession = {
        id: sessionId || generateSessionId(),
        teams,
        sessionCreationTime: Date.now(),
        startTime: null,
        isActive: true,
      };
      sessions.push(newSession);
    }

    // Sauvegarder les sessions mises à jour
    localStorage.setItem(localStorageKey, JSON.stringify(sessions));

    // Émettre un événement de mise à jour pour la communication entre onglets
    window.dispatchEvent(
      new CustomEvent("hackathon_data_updated", {
        detail: { sessionId, teams },
      })
    );
  } catch (error) {
    console.error("Error syncing teams data:", error);
  }
};

// Récupérer les données d'équipe en temps réel
export const subscribeToTeamUpdates = (
  sessionId: string,
  callback: (teams: Team[]) => void
): (() => void) => {
  // Fonction de gestionnaire d'événements
  const handleUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<{
      sessionId: string;
      teams: Team[];
    }>;
    if (customEvent.detail && customEvent.detail.sessionId === sessionId) {
      callback(customEvent.detail.teams);
    }
  };

  // Ajouter un écouteur d'événements
  window.addEventListener("hackathon_data_updated", handleUpdate);

  // Fonction de nettoyage pour supprimer l'écouteur
  return () => {
    window.removeEventListener("hackathon_data_updated", handleUpdate);
  };
};

// Récupérer l'étudiant du localStorage
export const getStudentFromStorage = (): Student | null => {
  try {
    const storedStudent = localStorage.getItem(studentStorageKey);
    if (storedStudent) {
      return JSON.parse(storedStudent);
    }
    return null;
  } catch (error) {
    console.error("Error retrieving student from storage:", error);
    return null;
  }
};

// Enregistrer un étudiant dans une équipe
export const registerStudent = async (
  studentName: string,
  teamId: number,
  sessionId: string
): Promise<Student> => {
  // Vérifier si la session existe et est active
  const storedData = localStorage.getItem(localStorageKey);
  if (!storedData) {
    throw new Error("Session not found");
  }

  const sessions = JSON.parse(storedData) as HackathonSession[];
  const session = sessions.find((s) => s.id === sessionId && s.isActive);

  if (!session) {
    throw new Error("Session not active or not found");
  }

  // Créer un nouvel étudiant
  const newStudent: Student = {
    id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: studentName,
    teamId,
    answers: {},
    hintsUsed: [],
  };

  try {
    // Trouver l'index de la session actuelle
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId
    );

    if (sessionIndex >= 0) {
      // Trouver l'équipe correspondante
      const teamIndex = sessions[sessionIndex].teams.findIndex(
        (team) => team.id === teamId
      );

      if (teamIndex >= 0) {
        // Ajouter l'ID de l'étudiant à l'équipe
        const team = sessions[sessionIndex].teams[teamIndex];

        if (!team.studentIds) {
          team.studentIds = [];
        }

        team.studentIds.push(newStudent.id);

        // Mettre à jour la session
        sessions[sessionIndex].teams[teamIndex] = team;
        localStorage.setItem(localStorageKey, JSON.stringify(sessions));

        // Émettre un événement de mise à jour
        window.dispatchEvent(
          new CustomEvent("hackathon_data_updated", {
            detail: { sessionId, teams: sessions[sessionIndex].teams },
          })
        );
      }
    }

    // Stocker les informations de l'étudiant dans le localStorage local
    localStorage.setItem(studentStorageKey, JSON.stringify(newStudent));

    return newStudent;
  } catch (error) {
    console.error("Error registering student:", error);
    throw new Error("Failed to register student");
  }
};

// Calculer le temps restant en fonction de la durée prévue
const calculateTimeLeft = (session: HackathonSession): number => {
  const totalDurationMinutes = 120; // Durée totale en minutes

  // Si la session n'a pas encore été démarrée, retourner la durée totale
  if (!session.startTime) {
    return totalDurationMinutes;
  }

  // Sinon, calculer le temps écoulé depuis le démarrage
  const elapsedTimeMinutes = (Date.now() - session.startTime) / (1000 * 60);
  return Math.max(0, totalDurationMinutes - elapsedTimeMinutes);
};

// Vérifier si une session existe et est active
export const isSessionActive = (sessionId: string): boolean => {
  try {
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) return false;

    const sessions = JSON.parse(storedData) as HackathonSession[];
    const session = sessions.find(
      (session) => session.id === sessionId && session.isActive
    );

    return !!session;
  } catch (error) {
    console.error("Error checking session status:", error);
    return false;
  }
};

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

// Créer une nouvelle session avec un nombre d'équipes configurable
export const createNewSession = async (teamCount: number = 4, customTeamNames?: string[]): Promise<string> => {
  const sessionId = generateSessionId();

  // Initialiser le progress object pour toutes les équipes
  const initialProgress = initializeProgressObject();

  // Créer le nombre d'équipes demandé (min 2, max 10)
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

  // Modifier ici: ne pas définir startTime lors de la création
  // mais seulement sessionCreationTime pour tracking
  const newSession: HackathonSession = {
    id: sessionId,
    teams,
    sessionCreationTime: Date.now(), // Quand la session a été créée
    startTime: null, // Sera défini quand la session sera démarrée manuellement
    isActive: true,
  };

  // Récupérer les sessions existantes
  const storedData = localStorage.getItem(localStorageKey);
  let sessions: HackathonSession[] = storedData ? JSON.parse(storedData) : [];

  // Désactiver toutes les sessions actives existantes
  sessions = sessions.map((session) => ({
    ...session,
    isActive: false,
  }));

  // Ajouter la nouvelle session
  sessions.push(newSession);

  // Sauvegarder les sessions mises à jour
  localStorage.setItem(localStorageKey, JSON.stringify(sessions));

  // Émettre un événement de mise à jour
  window.dispatchEvent(
    new CustomEvent("hackathon_session_created", {
      detail: { sessionId, teams },
    })
  );

  return sessionId;
};

// Voici la fonction startSession modifiée dans hackathonService.ts
// Vous devez remplacer juste cette fonction dans votre fichier existant

// Démarrer une session existante
export const startSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Récupérer les sessions existantes
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) return false;

    let sessions: HackathonSession[] = JSON.parse(storedData);

    // Trouver l'index de la session à démarrer
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId && session.isActive
    );

    if (sessionIndex === -1) return false;

    // Vérifier si la session est déjà démarrée
    if (sessions[sessionIndex].startTime) {
      // La session est déjà démarrée, pas besoin de la redémarrer
      return true;
    }

    // Démarrer la session en définissant startTime
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      startTime: Date.now(),
    };

    // Sauvegarder les sessions mises à jour
    localStorage.setItem(localStorageKey, JSON.stringify(sessions));

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
    // Récupérer les sessions existantes
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) return false;

    let sessions: HackathonSession[] = JSON.parse(storedData);

    // Trouver l'index de la session
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId && session.isActive
    );

    if (sessionIndex === -1) return false;

    // Trouver l'équipe à mettre à jour
    const teamIndex = sessions[sessionIndex].teams.findIndex(
      (team) => team.id === teamId
    );

    if (teamIndex === -1) return false;

    // Mettre à jour le nom de l'équipe
    sessions[sessionIndex].teams[teamIndex].name = newTeamName;

    // Sauvegarder les sessions mises à jour
    localStorage.setItem(localStorageKey, JSON.stringify(sessions));

    // Émettre un événement de mise à jour
    window.dispatchEvent(
      new CustomEvent("hackathon_data_updated", {
        detail: {
          sessionId,
          teams: sessions[sessionIndex].teams,
        },
      })
    );

    return true;
  } catch (error) {
    console.error("Error updating team name:", error);
    return false;
  }
};

// Terminer une session existante
export const endSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Récupérer les sessions existantes
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) return false;

    let sessions: HackathonSession[] = JSON.parse(storedData);

    // Trouver l'index de la session à terminer
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId
    );

    if (sessionIndex === -1) return false;

    // Mettre à jour la session
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      isActive: false,
      endTime: Date.now(),
    };

    // Sauvegarder les sessions mises à jour
    localStorage.setItem(localStorageKey, JSON.stringify(sessions));

    // Émettre un événement de mise à jour
    window.dispatchEvent(
      new CustomEvent("hackathon_session_ended", {
        detail: { sessionId },
      })
    );

    // Supprimer les étudiants associés à cette session
    localStorage.removeItem(studentStorageKey);

    return true;
  } catch (error) {
    console.error("Error ending session:", error);
    return false;
  }
};
