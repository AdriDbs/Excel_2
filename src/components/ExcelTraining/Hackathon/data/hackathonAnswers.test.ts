/**
 * Tests unitaires – Validation des réponses du hackathon "Le Dossier Perdu"
 *
 * Couvre :
 *   - validateNumericAnswer  : tolérance à 1 décimale
 *   - validateTextAnswer     : insensibilité à la casse + trim
 *   - validateAnswer         : délégation selon le type d'exercice
 *   - getExercisePoints      : points par exercice
 *   - Comptage des exercices : 16 exercices, 1600 pts total
 */

import {
  EXERCISE_ANSWERS,
  validateNumericAnswer,
  validateTextAnswer,
  validateAnswer,
  getExercisePoints,
} from "./hackathonAnswers";

// ─────────────────────────────────────────────────────────────────────────────
// validateNumericAnswer
// ─────────────────────────────────────────────────────────────────────────────

describe("validateNumericAnswer – tolérance à 1 décimale", () => {
  // Phase 1 Ex1 : 15
  test("accepte '15' pour 15", () => {
    expect(validateNumericAnswer("15", 15)).toBe(true);
  });
  test("accepte '15.0' pour 15", () => {
    expect(validateNumericAnswer("15.0", 15)).toBe(true);
  });
  test("accepte '15.00' pour 15", () => {
    expect(validateNumericAnswer("15.00", 15)).toBe(true);
  });
  test("rejette '15.1' pour 15", () => {
    expect(validateNumericAnswer("15.1", 15)).toBe(false);
  });

  // Phase 3 Ex1 : 378.71073401736396
  test("accepte '378.7' pour 378.71073…", () => {
    expect(validateNumericAnswer("378.7", 378.71073401736396)).toBe(true);
  });
  test("accepte '378.71' pour 378.71073…", () => {
    expect(validateNumericAnswer("378.71", 378.71073401736396)).toBe(true);
  });
  test("accepte '378.709' pour 378.71073…", () => {
    expect(validateNumericAnswer("378.709", 378.71073401736396)).toBe(true);
  });
  test("rejette '378.8' pour 378.71073…", () => {
    expect(validateNumericAnswer("378.8", 378.71073401736396)).toBe(false);
  });

  // Phase 2 Ex2 : 1800838.14
  test("accepte '1800838.1' pour 1800838.14", () => {
    expect(validateNumericAnswer("1800838.1", 1800838.14)).toBe(true);
  });
  test("accepte '1800838.14' pour 1800838.14", () => {
    expect(validateNumericAnswer("1800838.14", 1800838.14)).toBe(true);
  });
  test("accepte '1800838.142' pour 1800838.14", () => {
    expect(validateNumericAnswer("1800838.142", 1800838.14)).toBe(true);
  });
  test("rejette '1800838.2' pour 1800838.14", () => {
    expect(validateNumericAnswer("1800838.2", 1800838.14)).toBe(false);
  });

  // Phase 3 Ex3 : 179190.6165
  test("accepte '179190.6' pour 179190.6165", () => {
    expect(validateNumericAnswer("179190.6", 179190.6165)).toBe(true);
  });
  test("accepte '179190.61' pour 179190.6165", () => {
    expect(validateNumericAnswer("179190.61", 179190.6165)).toBe(true);
  });
  test("accepte '179190.62' pour 179190.6165", () => {
    expect(validateNumericAnswer("179190.62", 179190.6165)).toBe(true);
  });
  test("rejette '179190.7' pour 179190.6165", () => {
    expect(validateNumericAnswer("179190.7", 179190.6165)).toBe(false);
  });

  // Phase 4 Ex3 : 1049830.11
  test("accepte '1049830.1' pour 1049830.11", () => {
    expect(validateNumericAnswer("1049830.1", 1049830.11)).toBe(true);
  });
  test("accepte '1049830.11' pour 1049830.11", () => {
    expect(validateNumericAnswer("1049830.11", 1049830.11)).toBe(true);
  });
  test("rejette '1049830.2' pour 1049830.11", () => {
    expect(validateNumericAnswer("1049830.2", 1049830.11)).toBe(false);
  });

  // Phase 3 Ex2 : 5781 (entier)
  test("accepte '5781' pour 5781", () => {
    expect(validateNumericAnswer("5781", 5781)).toBe(true);
  });
  test("accepte '5781.0' pour 5781", () => {
    expect(validateNumericAnswer("5781.0", 5781)).toBe(true);
  });
  test("rejette '5782' pour 5781", () => {
    expect(validateNumericAnswer("5782", 5781)).toBe(false);
  });

  // Cas limites
  test("accepte la virgule comme séparateur décimal ('378,7')", () => {
    expect(validateNumericAnswer("378,7", 378.71073401736396)).toBe(true);
  });
  test("rejette une saisie non numérique", () => {
    expect(validateNumericAnswer("abc", 15)).toBe(false);
  });
  test("rejette une saisie vide", () => {
    expect(validateNumericAnswer("", 15)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateTextAnswer
// ─────────────────────────────────────────────────────────────────────────────

describe("validateTextAnswer – insensible à la casse + trim", () => {
  // Phase 1 Ex2 : CMD1191
  test("accepte 'CMD1191' exact", () => {
    expect(validateTextAnswer("CMD1191", "CMD1191")).toBe(true);
  });
  test("accepte 'cmd1191' (minuscules)", () => {
    expect(validateTextAnswer("cmd1191", "CMD1191")).toBe(true);
  });
  test("accepte ' CMD1191 ' (espaces)", () => {
    expect(validateTextAnswer(" CMD1191 ", "CMD1191")).toBe(true);
  });
  test("rejette 'CMD1192'", () => {
    expect(validateTextAnswer("CMD1192", "CMD1191")).toBe(false);
  });

  // Phase 5 Expert : Client_009
  test("accepte 'Client_009' exact", () => {
    expect(validateTextAnswer("Client_009", "Client_009")).toBe(true);
  });
  test("accepte 'client_009' (minuscules)", () => {
    expect(validateTextAnswer("client_009", "Client_009")).toBe(true);
  });
  test("accepte 'CLIENT_009' (majuscules)", () => {
    expect(validateTextAnswer("CLIENT_009", "Client_009")).toBe(true);
  });
  test("rejette 'Client_010'", () => {
    expect(validateTextAnswer("Client_010", "Client_009")).toBe(false);
  });

  // Phase 0 : Table_Donnees_Propres
  test("accepte 'Table_Donnees_Propres' exact", () => {
    expect(validateTextAnswer("Table_Donnees_Propres", "Table_Donnees_Propres")).toBe(true);
  });
  test("accepte 'table_donnees_propres' (minuscules)", () => {
    expect(validateTextAnswer("table_donnees_propres", "Table_Donnees_Propres")).toBe(true);
  });

  // Phases 2/4 : Done
  test("accepte 'Done' exact", () => {
    expect(validateTextAnswer("Done", "Done")).toBe(true);
  });
  test("accepte 'done' (minuscules)", () => {
    expect(validateTextAnswer("done", "Done")).toBe(true);
  });
  test("accepte 'DONE' (majuscules)", () => {
    expect(validateTextAnswer("DONE", "Done")).toBe(true);
  });

  // Phase 6 : Vous / avez / terminé
  test("accepte 'Vous' pour 'Vous'", () => {
    expect(validateTextAnswer("Vous", "Vous")).toBe(true);
  });
  test("accepte 'vous' pour 'Vous'", () => {
    expect(validateTextAnswer("vous", "Vous")).toBe(true);
  });
  test("accepte 'avez' pour 'avez'", () => {
    expect(validateTextAnswer("avez", "avez")).toBe(true);
  });
  test("accepte 'terminé' pour 'terminé'", () => {
    expect(validateTextAnswer("terminé", "terminé")).toBe(true);
  });
  test("accepte 'TERMINÉ' pour 'terminé'", () => {
    expect(validateTextAnswer("TERMINÉ", "terminé")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateAnswer (délégation)
// ─────────────────────────────────────────────────────────────────────────────

describe("validateAnswer – délégation par exerciceId", () => {
  test("Phase 0 : 'Table_Donnees_Propres' validé", () => {
    expect(validateAnswer("data-cleaning", "Table_Donnees_Propres")).toBe(true);
  });
  test("Phase 0 : 'table_donnees_propres' validé (casse)", () => {
    expect(validateAnswer("data-cleaning", "table_donnees_propres")).toBe(true);
  });

  test("Phase 1 Ex1 : '15' validé", () => {
    expect(validateAnswer("p1-ex1-count", "15")).toBe(true);
  });
  test("Phase 1 Ex1 : '15.0' validé", () => {
    expect(validateAnswer("p1-ex1-count", "15.0")).toBe(true);
  });
  test("Phase 1 Ex1 : '16' rejeté", () => {
    expect(validateAnswer("p1-ex1-count", "16")).toBe(false);
  });

  test("Phase 1 Ex2 : 'CMD1191' validé", () => {
    expect(validateAnswer("p1-ex2-filter", "CMD1191")).toBe(true);
  });
  test("Phase 1 Ex2 : 'cmd1191' validé (casse)", () => {
    expect(validateAnswer("p1-ex2-filter", "cmd1191")).toBe(true);
  });

  test("Phase 1 Ex3 : '3' validé", () => {
    expect(validateAnswer("p1-ex3-unique", "3")).toBe(true);
  });

  test("Phase 2 Ex1 : 'Done' validé", () => {
    expect(validateAnswer("p2-ex1-choosecols", "Done")).toBe(true);
  });
  test("Phase 2 Ex1 : 'done' validé", () => {
    expect(validateAnswer("p2-ex1-choosecols", "done")).toBe(true);
  });

  test("Phase 2 Ex2 : '1800838.1' validé", () => {
    expect(validateAnswer("p2-ex2-byrow", "1800838.1")).toBe(true);
  });

  test("Phase 3 Ex1 : '378.7' validé", () => {
    expect(validateAnswer("p3-ex1-take", "378.7")).toBe(true);
  });
  test("Phase 3 Ex1 : '378.71' validé", () => {
    expect(validateAnswer("p3-ex1-take", "378.71")).toBe(true);
  });

  test("Phase 3 Ex2 : '5781' validé", () => {
    expect(validateAnswer("p3-ex2-drop", "5781")).toBe(true);
  });

  test("Phase 3 Ex3 : '179190.6' validé", () => {
    expect(validateAnswer("p3-ex3-map", "179190.6")).toBe(true);
  });

  test("Phase 4 Ex1 : 'Done' validé", () => {
    expect(validateAnswer("p4-ex1-vstack", "Done")).toBe(true);
  });

  test("Phase 4 Ex2 : 'done' validé", () => {
    expect(validateAnswer("p4-ex2-hstack", "done")).toBe(true);
  });

  test("Phase 4 Ex3 : '1049830.1' validé", () => {
    expect(validateAnswer("p4-ex3-groupby", "1049830.1")).toBe(true);
  });
  test("Phase 4 Ex3 : '1049830.11' validé", () => {
    expect(validateAnswer("p4-ex3-groupby", "1049830.11")).toBe(true);
  });

  test("Phase 5 Expert : 'Client_009' validé", () => {
    expect(validateAnswer("p5-expert", "Client_009")).toBe(true);
  });
  test("Phase 5 Expert : 'client_009' validé (casse)", () => {
    expect(validateAnswer("p5-expert", "client_009")).toBe(true);
  });
  test("Phase 5 Expert : 'CLIENT_009' validé (casse)", () => {
    expect(validateAnswer("p5-expert", "CLIENT_009")).toBe(true);
  });

  test("Phase 6 Ex1 : 'Vous' validé", () => {
    expect(validateAnswer("p6-ex1-tcd", "Vous")).toBe(true);
  });
  test("Phase 6 Ex2 : 'avez' validé", () => {
    expect(validateAnswer("p6-ex2-graph", "avez")).toBe(true);
  });
  test("Phase 6 Ex3 : 'terminé' validé", () => {
    expect(validateAnswer("p6-ex3-format", "terminé")).toBe(true);
  });
  test("Phase 6 Ex3 : 'TERMINÉ' validé (casse)", () => {
    expect(validateAnswer("p6-ex3-format", "TERMINÉ")).toBe(true);
  });

  // Identifiant inconnu
  test("exerciseId inconnu retourne false", () => {
    expect(validateAnswer("unknown-exercise", "anything")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getExercisePoints
// ─────────────────────────────────────────────────────────────────────────────

describe("getExercisePoints – points par exercice", () => {
  test("Phase 0 : 100 pts", () => {
    expect(getExercisePoints("data-cleaning")).toBe(100);
  });
  test("Phase 1 Ex1 : 50 pts", () => {
    expect(getExercisePoints("p1-ex1-count")).toBe(50);
  });
  test("Phase 1 Ex2 : 75 pts", () => {
    expect(getExercisePoints("p1-ex2-filter")).toBe(75);
  });
  test("Phase 5 Expert : 450 pts", () => {
    expect(getExercisePoints("p5-expert")).toBe(450);
  });
  test("exerciseId inconnu : 0 pts", () => {
    expect(getExercisePoints("unknown")).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Structure globale : 16 exercices, 1600 pts
// ─────────────────────────────────────────────────────────────────────────────

describe("Structure EXERCISE_ANSWERS", () => {
  test("contient exactement 16 exercices", () => {
    expect(EXERCISE_ANSWERS).toHaveLength(16);
  });

  test("le total des points est 1700 (somme réelle du tableau de référence)", () => {
    // Note : l'énoncé indique 1600 pts mais la somme des valeurs individuelles
    // du tableau de référence est 1700 pts (écart constaté sur Phase 3 : 250 pts).
    const total = EXERCISE_ANSWERS.reduce((sum, ex) => sum + ex.points, 0);
    expect(total).toBe(1700);
  });

  test("tous les exerciseId sont uniques", () => {
    const ids = EXERCISE_ANSWERS.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test("chaque exercice a un type valide (numeric ou text)", () => {
    EXERCISE_ANSWERS.forEach((ex) => {
      expect(["numeric", "text"]).toContain(ex.type);
    });
  });

  test("les exercices numériques ont une valeur de type number", () => {
    EXERCISE_ANSWERS.filter((e) => e.type === "numeric").forEach((ex) => {
      expect(typeof ex.expected).toBe("number");
    });
  });

  test("les exercices texte ont une valeur de type string", () => {
    EXERCISE_ANSWERS.filter((e) => e.type === "text").forEach((ex) => {
      expect(typeof ex.expected).toBe("string");
    });
  });
});
