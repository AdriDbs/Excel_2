/**
 * Hackathon "Le Dossier Perdu" - Réponses et validation des exercices
 *
 * Ce fichier centralise toutes les réponses attendues pour les 16 exercices
 * du hackathon, ainsi que la logique de validation associée.
 *
 * Structure :
 *   Phase 0 :  1 exercice  (Data Cleaning)         → 100 pts
 *   Phase 1 :  3 exercices (Ex1, Ex2, Ex3)          → 200 pts
 *   Phase 2 :  2 exercices (Ex1, Ex2)               → 200 pts
 *   Phase 3 :  3 exercices (Ex1, Ex2, Ex3)          → 250 pts
 *   Phase 4 :  3 exercices (Ex1, Ex2, Ex3)          → 300 pts
 *   Phase 5 :  1 exercice  (Expert)                 → 450 pts
 *   Phase 6 :  3 exercices (Ex1, Ex2, Ex3)          → 200 pts
 *   TOTAL   : 16 exercices                          → 1600 pts
 *
 * Règles de validation :
 *   - Numérique : tolérance à 1 décimale (arrondi Math.round(x * 10) / 10)
 *   - Texte     : insensible à la casse, trim des espaces
 */

export type AnswerType = "numeric" | "text";

export interface ExerciseAnswer {
  /** Identifiant unique lié au champ exerciseId du Level */
  id: string;
  /** Type de validation à appliquer */
  type: AnswerType;
  /** Valeur attendue */
  expected: number | string;
  /** Points attribués pour cet exercice */
  points: number;
}

/**
 * Table des réponses pour les 16 exercices du hackathon.
 * L'ordre reflète la progression des phases 0 → 6.
 */
export const EXERCISE_ANSWERS: ExerciseAnswer[] = [
  // ── Phase 0 : Data Cleaning ───────────────────────────────────────────────
  // Bug fix : la réponse attendue est "done" (insensible à la casse), pas le nom de la table
  { id: "data-cleaning",   type: "text",    expected: "done",                   points: 100 },

  // ── Phase 1 : Fonctions de Base ───────────────────────────────────────────
  { id: "p1-ex1-count",    type: "numeric", expected: 15,                       points:  50 },
  { id: "p1-ex2-filter",   type: "text",    expected: "CMD1191",                points:  75 },
  { id: "p1-ex3-unique",   type: "numeric", expected: 3,                        points:  75 },

  // ── Phase 2 : Manipulation Avancée ───────────────────────────────────────
  { id: "p2-ex1-choosecols", type: "text",  expected: "Done",                   points: 100 },
  { id: "p2-ex2-byrow",    type: "numeric", expected: 1800838.14,               points: 100 },

  // ── Phase 3 : Extraction de Données ──────────────────────────────────────
  { id: "p3-ex1-take",     type: "numeric", expected: 378.71073401736396,       points:  75 },
  { id: "p3-ex2-drop",     type: "numeric", expected: 5781,                     points:  75 },
  { id: "p3-ex3-map",      type: "numeric", expected: 179190.6165,              points: 100 },

  // ── Phase 4 : Combinaison de Tables ──────────────────────────────────────
  { id: "p4-ex1-vstack",   type: "text",    expected: "Done",                   points: 100 },
  { id: "p4-ex2-hstack",   type: "text",    expected: "Done",                   points: 100 },
  { id: "p4-ex3-groupby",  type: "numeric", expected: 1049830.11,               points: 100 },

  // ── Phase 5 : Exercice Expert ─────────────────────────────────────────────
  { id: "p5-expert",       type: "text",    expected: "Client_009",             points: 450 },

  // ── Phase 6 : Visualisation ───────────────────────────────────────────────
  { id: "p6-ex1-tcd",      type: "text",    expected: "Vous",                   points:  25 },
  { id: "p6-ex2-graph",    type: "text",    expected: "avez",                   points: 100 },
  { id: "p6-ex3-format",   type: "text",    expected: "terminé",                points:  75 },
];

// Vérification statique : total = 1700 pts
// 100+50+75+75+100+100+75+75+100+100+100+100+450+25+100+75 = 1700
// Note : le total affiché dans l'énoncé (1600) est inexact ; la somme réelle
// des points individuels du tableau de référence est bien 1700.

// ─────────────────────────────────────────────────────────────────────────────
// Fonctions de validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valide une réponse numérique avec une tolérance d'1 décimale.
 *
 * Les deux valeurs sont arrondies à 1 décimale avant comparaison, ce qui
 * permet d'accepter "378.7", "378.71", "378.709"… pour une valeur attendue
 * de 378.71073401736396.
 *
 * @param userAnswer - Saisie de l'utilisateur (peut utiliser ',' comme séparateur décimal)
 * @param expected   - Valeur numérique attendue
 * @returns true si les valeurs arrondies à 1 décimale sont identiques
 *
 * @example
 * validateNumericAnswer("378.7",      378.71073401736396) // true
 * validateNumericAnswer("1800838.1",  1800838.14)         // true
 * validateNumericAnswer("1800838.2",  1800838.14)         // false
 * validateNumericAnswer("15",         15)                  // true
 * validateNumericAnswer("15.0",       15)                  // true
 */
export function validateNumericAnswer(
  userAnswer: string,
  expected: number
): boolean {
  const normalized = userAnswer.replace(",", ".");
  const userNum = parseFloat(normalized);
  if (isNaN(userNum)) return false;

  const roundedUser = Math.round(userNum * 10) / 10;
  const roundedExpected = Math.round(expected * 10) / 10;

  return roundedUser === roundedExpected;
}

/**
 * Valide une réponse textuelle :
 *   - insensible à la casse
 *   - espaces en début/fin ignorés
 *
 * @param userAnswer - Saisie de l'utilisateur
 * @param expected   - Valeur textuelle attendue
 * @returns true si les chaînes trimées correspondent (case-insensitive)
 *
 * @example
 * validateTextAnswer(" CMD1191 ", "CMD1191")   // true
 * validateTextAnswer("cmd1191",   "CMD1191")   // true
 * validateTextAnswer("client_009","Client_009")// true
 * validateTextAnswer("done",      "Done")      // true
 */
export function validateTextAnswer(
  userAnswer: string,
  expected: string
): boolean {
  return userAnswer.trim().toLowerCase() === expected.trim().toLowerCase();
}

/**
 * Valide la réponse d'un exercice à partir de son identifiant.
 *
 * Délègue à validateNumericAnswer ou validateTextAnswer selon le type de
 * l'exercice. Retourne false si l'exerciseId est inconnu.
 *
 * @param exerciseId - Identifiant de l'exercice (ex: "p1-ex2-filter")
 * @param userAnswer - Saisie de l'utilisateur
 * @returns true si la réponse est correcte selon les règles de tolérance
 */
export function validateAnswer(
  exerciseId: string,
  userAnswer: string
): boolean {
  const exercise = EXERCISE_ANSWERS.find((e) => e.id === exerciseId);
  if (!exercise) return false;

  if (exercise.type === "numeric") {
    return validateNumericAnswer(userAnswer, exercise.expected as number);
  }
  return validateTextAnswer(userAnswer, exercise.expected as string);
}

/**
 * Retourne les points attribués pour un exercice donné.
 * Retourne 0 si l'identifiant est inconnu.
 *
 * @param exerciseId - Identifiant de l'exercice
 */
export function getExercisePoints(exerciseId: string): number {
  const exercise = EXERCISE_ANSWERS.find((e) => e.id === exerciseId);
  return exercise?.points ?? 0;
}
