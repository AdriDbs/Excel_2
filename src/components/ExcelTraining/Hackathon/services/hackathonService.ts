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

// Définition des 16 exercices du hackathon "Le Dossier Perdu"
// Répartis en 7 phases — total 1 600 points
export const hackathonLevels: Level[] = [
  // ── Phase 0 : Data Cleaning (1 exercice) ────────────────────────────────
  {
    id: 0,
    exerciseId: "data-cleaning",
    name: "Phase 0 – Nettoyage des données",
    description:
      "Nettoyez et préparez les données brutes pour créer Table_Donnees_Propres",
    instruction:
      "Importez les données brutes dans Excel et utilisez Power Query pour les nettoyer : supprimez les doublons, standardisez les formats (TRIM, CLEAN, PROPER) et nommez la table finale « Table_Donnees_Propres ». Une fois terminé, tapez « done » pour valider.",
    exerciseDescription:
      "Vous commencez le hackathon en préparant les données brutes. Utilisez Power Query pour importer, dédupliquer et normaliser les données avant de créer la table de travail.",
    exerciseQuestion:
      "Avez-vous créé et nettoyé la table Table_Donnees_Propres avec Power Query ? Tapez « done » pour valider.",
    answerFormat: "Tapez : done",
    hint: "Utilisez Power Query (Données > Obtenir et transformer) pour importer, nettoyer et fusionner les données brutes, puis nommez la table « Table_Donnees_Propres ».",
    functionRequired: ["Power Query", "TRIM", "CLEAN", "PROPER"],
    timeAllocation: 20,
    pointsValue: 100,
  },

  // ── Phase 1 : Fonctions de Base (3 exercices) ────────────────────────────
  {
    id: 1,
    exerciseId: "p1-ex1-count",
    name: "Phase 1 – Ex1 : Compter les commandes",
    description:
      "Compter les commandes d'un client spécifique",
    instruction:
      "Dans Table_Donnees_Propres, comptez le nombre de commandes du client « Client_015 » dans la colonne Contact.",
    exerciseDescription:
      "Vous devez analyser la table de données pour identifier combien de fois un client spécifique apparaît dans les enregistrements.",
    exerciseQuestion:
      "Combien de commandes a passé le client « Client_015 » ?",
    answerFormat: "Nombre entier (ex: 15)",
    hint: "Utilisez : =COUNTIF(Table_Donnees_Propres[Contact]; \"Client_015\")",
    functionRequired: ["COUNTIF"],
    timeAllocation: 10,
    pointsValue: 50,
  },
  {
    id: 2,
    exerciseId: "p1-ex2-filter",
    name: "Phase 1 – Ex2 : Produits critiques",
    description:
      "Identifier la commande en rupture critique",
    instruction:
      "Filtrez les commandes où Stock_Actuel < 50 ET Demande_Prevue > 100. Notez l'identifiant de commande (ID_Commande) du résultat.",
    exerciseDescription:
      "Parmi toutes les commandes, identifiez celle qui correspond à un produit en rupture critique : stock actuel inférieur à 50 unités et demande prévue supérieure à 100 unités.",
    exerciseQuestion:
      "Quel est l'identifiant de commande (ID_Commande) du produit critique (Stock_Actuel < 50 ET Demande_Prevue > 100) ?",
    answerFormat: "Code commande (ex: CMD1191)",
    hint: "Utilisez : =FILTER(Table_Donnees_Propres; (Table_Donnees_Propres[Stock_Actuel]<50)*(Table_Donnees_Propres[Demande_Prevue]>100)) puis notez l'ID_Commande.",
    functionRequired: ["FILTER"],
    timeAllocation: 15,
    pointsValue: 75,
  },
  {
    id: 3,
    exerciseId: "p1-ex3-unique",
    name: "Phase 1 – Ex3 : Fournisseurs concernés",
    description:
      "Compter les fournisseurs distincts liés aux produits critiques",
    instruction:
      "Listez les ID_Fournisseur distincts liés aux produits critiques (Stock_Actuel < 50 ET Demande_Prevue > 100), puis comptez-les.",
    exerciseDescription:
      "En partant du filtre de l'exercice précédent, vous devez identifier combien de fournisseurs différents sont concernés par les produits critiques.",
    exerciseQuestion:
      "Combien de fournisseurs uniques (ID_Fournisseur) sont liés aux produits critiques (Stock_Actuel < 50 ET Demande_Prevue > 100) ?",
    answerFormat: "Nombre entier (ex: 3)",
    hint: "Utilisez : =ROWS(UNIQUE(FILTER(Table_Donnees_Propres[ID_Fournisseur]; (Table_Donnees_Propres[Stock_Actuel]<50)*(Table_Donnees_Propres[Demande_Prevue]>100))))",
    functionRequired: ["UNIQUE", "FILTER", "ROWS"],
    timeAllocation: 15,
    pointsValue: 75,
  },

  // ── Phase 2 : Manipulation Avancée (2 exercices) ─────────────────────────
  {
    id: 4,
    exerciseId: "p2-ex1-choosecols",
    name: "Phase 2 – Ex1 : Réorganiser les colonnes",
    description:
      "Sélectionner et réorganiser les colonnes pertinentes",
    instruction:
      "Créez une vue de Table_Donnees_Propres ne conservant que les colonnes 3, 4, 5, 6, 7, 8, 10 et 12 dans cet ordre.",
    exerciseDescription:
      "Vous devez réorganiser les données en ne gardant que les colonnes pertinentes pour l'analyse.",
    exerciseQuestion:
      "Avez-vous réorganisé les colonnes dans l'ordre demandé (colonnes 3, 4, 5, 6, 7, 8, 10 et 12) ? Entrez « Done » une fois l'opération réalisée.",
    answerFormat: "Entrez : Done",
    hint: "Utilisez : =CHOOSECOLS(Table_Donnees_Propres; 3; 4; 5; 6; 7; 8; 10; 12)",
    functionRequired: ["CHOOSECOLS"],
    timeAllocation: 15,
    pointsValue: 100,
  },
  {
    id: 5,
    exerciseId: "p2-ex2-byrow",
    name: "Phase 2 – Ex2 : CA par ligne",
    description:
      "Calculer le chiffre d'affaires ligne par ligne puis faire la somme totale",
    instruction:
      "Calculez le montant (Quantite × Prix_Unitaire) de chaque commande ligne par ligne, puis faites la somme totale.",
    exerciseDescription:
      "Calculez le chiffre d'affaires (Quantite × Prix_Unitaire) de chaque commande, puis additionnez le tout.",
    exerciseQuestion:
      "Quelle est la somme totale du chiffre d'affaires calculé ligne par ligne (Quantite × Prix_Unitaire) ?",
    answerFormat: "Nombre décimal (ex: 1800838.1)",
    hint: "Utilisez : =SUM(BYROW(CHOOSECOLS(Table_Donnees_Propres; 4; 5); LAMBDA(row; INDEX(row;1)*INDEX(row;2))))",
    functionRequired: ["BYROW", "LAMBDA", "CHOOSECOLS", "SUM"],
    timeAllocation: 15,
    pointsValue: 100,
  },

  // ── Phase 3 : Extraction de Données (3 exercices) ────────────────────────
  {
    id: 6,
    exerciseId: "p3-ex1-take",
    name: "Phase 3 – Ex1 : Dernières commandes",
    description:
      "Extraire et analyser les 100 dernières commandes",
    instruction:
      "Récupérez les 100 dernières lignes de Table_Donnees_Propres, puis calculez la moyenne du Montant_Total.",
    exerciseDescription:
      "Vous devez analyser les tendances récentes en travaillant uniquement sur les 100 dernières commandes de la table.",
    exerciseQuestion:
      "Quelle est la valeur moyenne du Montant_Total des 100 dernières commandes ?",
    answerFormat: "Nombre décimal (ex: 378.7)",
    hint: "Utilisez : =AVERAGE(TAKE(Table_Donnees_Propres[Montant_Total]; -100)). TAKE avec un nombre négatif prend les dernières lignes.",
    functionRequired: ["TAKE", "AVERAGE"],
    timeAllocation: 15,
    pointsValue: 75,
  },
  {
    id: 7,
    exerciseId: "p3-ex2-drop",
    name: "Phase 3 – Ex2 : Retirer les données de test",
    description:
      "Supprimer les premières lignes de test et compter les lignes restantes",
    instruction:
      "Les 30 premières lignes sont des données de test à exclure. Supprimez-les et comptez les lignes restantes.",
    exerciseDescription:
      "Les 30 premières commandes sont des données de test qui doivent être exclues avant toute analyse réelle.",
    exerciseQuestion:
      "Combien de lignes reste-t-il après avoir retiré les 30 premières commandes (données de test) ?",
    answerFormat: "Nombre entier (ex: 5781)",
    hint: "Utilisez : =ROWS(DROP(Table_Donnees_Propres; 30))",
    functionRequired: ["DROP", "ROWS"],
    timeAllocation: 15,
    pointsValue: 75,
  },
  {
    id: 8,
    exerciseId: "p3-ex3-map",
    name: "Phase 3 – Ex3 : Augmentation de prix 5%",
    description:
      "Simuler une hausse tarifaire de 5% sur tous les prix unitaires",
    instruction:
      "Appliquez une augmentation de 5% à chaque Prix_Unitaire, puis calculez la somme totale.",
    exerciseDescription:
      "Simulez une augmentation tarifaire de 5% sur tous les prix unitaires pour estimer l'impact sur le budget.",
    exerciseQuestion:
      "Quelle est la somme totale des prix unitaires après une augmentation de 5% ?",
    answerFormat: "Nombre décimal (ex: 179190.6)",
    hint: "Utilisez : =SUM(MAP(Table_Donnees_Propres[Prix_Unitaire]; LAMBDA(x; x*1,05)))",
    functionRequired: ["MAP", "LAMBDA", "SUM"],
    timeAllocation: 15,
    pointsValue: 100,
  },

  // ── Phase 4 : Combinaison de Tables (3 exercices) ────────────────────────
  {
    id: 9,
    exerciseId: "p4-ex1-vstack",
    name: "Phase 4 – Ex1 : Empiler les données",
    description:
      "Combiner Table_Donnees_Propres et Table_Nouvelles_Commandes verticalement",
    instruction:
      "De nouvelles commandes sont arrivées. Empilez-les verticalement sous les données existantes.",
    exerciseDescription:
      "De nouvelles commandes sont arrivées et doivent être intégrées à votre table principale.",
    exerciseQuestion:
      "Avez-vous empilé verticalement les données des deux tables (Table_Donnees_Propres et Table_Nouvelles_Commandes) ? Entrez « Done » une fois l'opération réalisée.",
    answerFormat: "Entrez : Done",
    hint: "Utilisez : =VSTACK(Table_Donnees_Propres; Table_Nouvelles_Commandes)",
    functionRequired: ["VSTACK"],
    timeAllocation: 15,
    pointsValue: 100,
  },
  {
    id: 10,
    exerciseId: "p4-ex2-hstack",
    name: "Phase 4 – Ex2 : Ajouter les infos produits",
    description:
      "Enrichir la table avec les informations produits (catégorie, marge)",
    instruction:
      "Enrichissez Table_Donnees_Propres en ajoutant les colonnes Categorie et Marge_Pct depuis Table_Infos_Produits.",
    exerciseDescription:
      "Vous devez enrichir vos données de commandes avec les informations produits (catégorie, marge) pour une analyse plus complète.",
    exerciseQuestion:
      "Avez-vous enrichi la table avec les informations produits (Categorie et Marge_Pct) ? Entrez « Done » une fois l'opération réalisée.",
    answerFormat: "Entrez : Done",
    hint: "Utilisez : =HSTACK(Table_Donnees_Propres; XLOOKUP(Table_Donnees_Propres[ID_Produit]; Table_Infos_Produits[Produit]; Table_Infos_Produits[[Categorie]:[Marge_Pct]]))",
    functionRequired: ["HSTACK", "XLOOKUP"],
    timeAllocation: 15,
    pointsValue: 100,
  },
  {
    id: 11,
    exerciseId: "p4-ex3-groupby",
    name: "Phase 4 – Ex3 : CA par fournisseur",
    description:
      "Calculer le chiffre d'affaires total par fournisseur",
    instruction:
      "Regroupez les données par ID_Fournisseur, calculez la somme du Montant_Total par fournisseur, puis trouvez la valeur maximale.",
    exerciseDescription:
      "Analysez les performances commerciales de chaque fournisseur en calculant leur chiffre d'affaires total.",
    exerciseQuestion:
      "Quelle est la valeur du chiffre d'affaires du fournisseur le plus performant ?",
    answerFormat: "Nombre décimal (ex: 1049830.11)",
    hint: "Utilisez : =MAX(GROUPBY(Table_Donnees_Propres[ID_Fournisseur]; Table_Donnees_Propres[Montant_Total]; SUM))",
    functionRequired: ["GROUPBY", "MAX"],
    timeAllocation: 15,
    pointsValue: 100,
  },

  // ── Phase 5 : Exercice Expert (1 exercice) ───────────────────────────────
  {
    id: 12,
    exerciseId: "p5-expert",
    name: "Phase 5 – Exercice Expert",
    description:
      "Analyse experte : identifiez le client le plus rentable",
    instruction:
      "En combinant plusieurs fonctions avancées (GROUPBY, XLOOKUP, FILTER…), identifiez l'identifiant du client générant le chiffre d'affaires total le plus élevé.",
    exerciseDescription:
      "Cet exercice expert demande une analyse approfondie pour identifier le client le plus rentable de toute la base de données.",
    exerciseQuestion:
      "Quel est l'identifiant du client (Contact) le plus rentable selon le CA total ?",
    answerFormat: "Identifiant client (ex: Client_009)",
    hint: "Utilisez GROUPBY sur la colonne Contact avec SUM du Montant_Total, puis identifiez le Contact correspondant au MAX.",
    functionRequired: ["GROUPBY", "XLOOKUP", "FILTER", "UNIQUE", "LAMBDA"],
    timeAllocation: 20,
    pointsValue: 450,
  },

  // ── Phase 6 : Visualisation (3 exercices) ────────────────────────────────
  {
    id: 13,
    exerciseId: "p6-ex1-tcd",
    name: "Phase 6 – Ex1 : Tableau croisé dynamique",
    description:
      "Créez un tableau croisé dynamique pour visualiser les ventes",
    instruction:
      "Insérez un tableau croisé dynamique résumant les ventes par catégorie et par fournisseur.",
    exerciseDescription:
      "Le tableau de bord commence par un tableau croisé dynamique interactif résumant les ventes.",
    exerciseQuestion:
      "Créez le TCD puis entrez le 1er mot du message de validation (le message est « Vous avez terminé »).",
    answerFormat: "Premier mot du message (ex: Vous)",
    hint: "Insérez un TCD depuis Insertion > Tableau croisé dynamique. Le premier mot du message de validation est « Vous ».",
    functionRequired: ["Tableaux croisés dynamiques"],
    timeAllocation: 10,
    pointsValue: 25,
  },
  {
    id: 14,
    exerciseId: "p6-ex2-graph",
    name: "Phase 6 – Ex2 : Graphique dynamique",
    description:
      "Créez un graphique croisé dynamique connecté au TCD",
    instruction:
      "À partir de votre TCD, insérez un graphique croisé dynamique pour visualiser les tendances.",
    exerciseDescription:
      "Ajoutez un graphique dynamique pour rendre le tableau de bord plus visuel et interactif.",
    exerciseQuestion:
      "Créez le graphique puis entrez le 2ème mot du message de validation (le message est « Vous avez terminé »).",
    answerFormat: "Deuxième mot du message (ex: avez)",
    hint: "Insérez un graphique croisé dynamique depuis Insertion > Graphique croisé dynamique. Le deuxième mot est « avez ».",
    functionRequired: ["Graphiques croisés dynamiques"],
    timeAllocation: 15,
    pointsValue: 100,
  },
  {
    id: 15,
    exerciseId: "p6-ex3-format",
    name: "Phase 6 – Ex3 : Mise en forme conditionnelle",
    description:
      "Ajoutez une mise en forme conditionnelle pour mettre en valeur les KPIs",
    instruction:
      "Appliquez une mise en forme conditionnelle sur vos données pour mettre en évidence les valeurs remarquables.",
    exerciseDescription:
      "Finalisez votre tableau de bord avec une mise en forme conditionnelle dynamique et des segments (slicers).",
    exerciseQuestion:
      "Appliquez la mise en forme puis entrez le 3ème mot du message de validation (le message est « Vous avez terminé »).",
    answerFormat: "Troisième mot du message (ex: terminé)",
    hint: "Utilisez Accueil > Mise en forme conditionnelle. Le troisième mot est « terminé ».",
    functionRequired: ["Mise en forme conditionnelle", "Segments"],
    timeAllocation: 15,
    pointsValue: 75,
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
        errors: team.errors ?? 0,
        completionTime: team.completionTime ?? undefined,
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
    errors: 0,
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

// Récupérer tous les étudiants inscrits dans toutes les sessions avec leurs détails
export const getAllRegisteredStudents = async (): Promise<{
  sessionId: string;
  sessionName: string;
  isActive: boolean;
  students: Array<Student & { teamName: string }>;
}[]> => {
  try {
    const allSessions = await getAllHackathonSessions();
    if (!allSessions) return [];

    const result = [];

    for (const [sessionId, session] of Object.entries(allSessions)) {
      if (!session) continue;

      const registeredStudents = session.registeredStudents || {};
      const teams = session.teams || [];
      const isActive = session.sessionActive !== false && session.isActive !== false;

      const students = Object.entries(registeredStudents).map(([userId, studentData]: [string, any]) => {
        const team = teams.find((t: any) => t && t.id === studentData.teamId);
        return {
          id: studentData.id,
          name: studentData.name,
          teamId: studentData.teamId,
          teamName: team?.name || `Équipe ${studentData.teamId}`,
          answers: studentData.answers || {},
          hintsUsed: studentData.hintsUsed || [],
        };
      });

      if (students.length > 0) {
        result.push({
          sessionId,
          sessionName: `Session ${sessionId.substring(sessionId.indexOf("_") + 1, sessionId.indexOf("_") + 9)}`,
          isActive,
          students,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching all registered students:", error);
    return [];
  }
};
