import { ExcelFunction } from "../types";

// Données des fonctions Excel à apprendre
export const excelFunctions: ExcelFunction[] = [
  {
    name: "XLOOKUP",
    avatar: "🔍",
    superpower: "Le Detective Polyvalent",
    description:
      "Trouve des données dans n'importe quelle direction avec une précision parfaite.",
    exercise:
      "Allez dans l'onglet XLOOKUP de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quelle est la valeur renvoyée par XLOOKUP dans l'exercice 1?",
    exercisePrompt2: "Quelle formule avez-vous utilisée pour l'exercice 2?",
    trick:
      "Astuce: Utilisez XLOOKUP avec les arguments de secours pour gérer les valeurs manquantes et les erreurs:\n=XLOOKUP(valeur_recherchée, plage_recherche, plage_renvoi, [si_non_trouvé], [mode_correspondance], [mode_recherche])",
  },
  {
    name: "FILTER",
    avatar: "🧹",
    superpower: "Le Nettoyeur de Données",
    description:
      "Filtre et extrait des données selon des critères précis en un clin d'œil.",
    exercise:
      "Allez dans l'onglet FILTER de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Combien d'enregistrements sont renvoyés par votre filtre dans l'exercice 1?",
    exercisePrompt2: "Quelle condition avez-vous utilisée pour l'exercice 2?",
    trick:
      'Astuce: Combinez plusieurs conditions avec des opérateurs logiques:\n=FILTER(plage, (condition1)*(condition2), "Aucun résultat")',
  },
  {
    name: "SEQUENCE",
    avatar: "🔢",
    superpower: "Le Générateur de Suites",
    description: "Crée des séquences de nombres sans effort.",
    exercise:
      "Allez dans l'onglet SEQUENCE de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quelle formule avez-vous utilisée pour générer la série de l'exercice 1?",
    exercisePrompt2:
      "Combien de valeurs sont générées par votre formule de l'exercice 2?",
    trick:
      "Astuce: Utilisez les arguments de SEQUENCE pour personnaliser votre série:\n=SEQUENCE(lignes, [colonnes], [début], [pas])",
  },
  {
    name: "BYROW & BYCOL",
    avatar: "↔️",
    superpower: "L'Analyseur Dimensionnel",
    description: "Applique des calculs par ligne ou colonne avec élégance.",
    exercise:
      "Allez dans l'onglet BYROW & BYCOL de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1: "Quel résultat obtenez-vous avec BYROW dans l'exercice 1?",
    exercisePrompt2:
      "Quelle est la différence principale que vous observez entre BYROW et BYCOL?",
    trick:
      "Astuce: Combinez BYROW avec LAMBDA pour des calculs personnalisés par ligne:\n=BYROW(plage, LAMBDA(ligne, [votre_formule_ici]))",
  },
  {
    name: "CHOOSECOLS",
    avatar: "✂️",
    superpower: "Le Sculpteur de Colonnes",
    description: "Sélectionne précisément les colonnes désirées d'un tableau.",
    exercise:
      "Allez dans l'onglet CHOOSECOLS de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quelles colonnes avez-vous sélectionnées pour l'exercice 1?",
    exercisePrompt2: "Comment avez-vous utilisé CHOOSECOLS dans l'exercice 2?",
    trick:
      "Astuce: Vous pouvez spécifier des colonnes non consécutives:\n=CHOOSECOLS(tableau, 1, 3, 5)",
  },
  {
    name: "DROP & TAKE",
    avatar: "🎯",
    superpower: "Le Manipulateur d'Intervalles",
    description: "Prend ou supprime exactement ce dont vous avez besoin.",
    exercise:
      "Allez dans l'onglet DROP & TAKE de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Combien de lignes avez-vous conservées avec TAKE dans l'exercice 1?",
    exercisePrompt2:
      "Comment avez-vous combiné DROP et TAKE dans l'exercice 2?",
    trick:
      "Astuce: Utilisez des valeurs négatives pour supprimer ou prendre à partir de la fin:\n=DROP(tableau, -2) supprime les 2 dernières lignes",
  },
  {
    name: "TRANSPOSE",
    avatar: "🔄",
    superpower: "Le Retourneur de Dimensions",
    description: "Transforme les lignes en colonnes et vice-versa.",
    exercise:
      "Allez dans l'onglet TRANSPOSE de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quelle est la dimension du tableau résultant de l'exercice 1?",
    exercisePrompt2:
      "Comment avez-vous combiné TRANSPOSE avec une autre fonction dans l'exercice 2?",
    trick:
      "Astuce: Combinez TRANSPOSE avec FILTER pour réorienter des résultats filtrés:\n=TRANSPOSE(FILTER(plage, condition))",
  },
  {
    name: "LET & MAP",
    avatar: "🧠",
    superpower: "L'Architecte de Variables",
    description:
      "Simplifie les formules complexes avec des variables nommées pour une lisibilité maximale.",
    exercise:
      "Allez dans l'onglet LET & MAP de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quel résultat obtenez-vous avec la fonction LET dans l'exercice 1?",
    exercisePrompt2: "Comment avez-vous utilisé MAP dans l'exercice 2?",
    trick:
      "Astuce: Utilisez LET pour créer des variables intermédiaires et améliorer la lisibilité:\n=LET(nom1, valeur1, nom2, valeur2, formule_utilisant_noms)",
  },
  {
    name: "VSTACK & HSTACK",
    avatar: "📚",
    superpower: "L'Empileur de Données",
    description: "Combine des tableaux verticalement ou horizontalement.",
    exercise:
      "Allez dans l'onglet VSTACK & HSTACK de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Combien de lignes contient le tableau résultant de VSTACK dans l'exercice 1?",
    exercisePrompt2:
      "Quelle différence observez-vous entre HSTACK et VSTACK dans l'exercice 2?",
    trick:
      "Astuce: Combinez VSTACK avec FILTER pour fusionner des résultats filtrés:\n=VSTACK(FILTER(plage1, condition1), FILTER(plage2, condition2))",
  },
  {
    name: "GROUPBY",
    avatar: "📊",
    superpower: "L'Analyste de Groupes",
    description:
      "Regroupe et agrège des données comme un tableau croisé dynamique.",
    exercise:
      "Allez dans l'onglet GROUPBY de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Combien de groupes sont générés par votre formule dans l'exercice 1?",
    exercisePrompt2:
      "Quelle fonction d'agrégation avez-vous utilisée dans l'exercice 2?",
    trick:
      'Astuce: Utilisez plusieurs colonnes dans GROUPBY pour des analyses multi-niveaux:\n=GROUPBY(plage, col1, col2, {"Somme", LAMBDA(x, SUM(x))})',
  },
  {
    name: "REDUCE & SCAN",
    avatar: "🔍",
    superpower: "Le Calculateur Cumulatif",
    description:
      "Applique des opérations cumulatives avec une précision mathématique.",
    exercise:
      "Allez dans l'onglet REDUCE & SCAN de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Quel est le résultat final de votre REDUCE dans l'exercice 1?",
    exercisePrompt2: "Comment avez-vous utilisé SCAN dans l'exercice 2?",
    trick:
      "Astuce: REDUCE retourne une valeur unique, tandis que SCAN retourne toutes les valeurs intermédiaires:\n=SCAN(valeur_initiale, plage, LAMBDA(accumulateur, valeur, [votre_calcul]))",
  },
  {
    name: "TOCOL & TOROW",
    avatar: "🔀",
    superpower: "Le Convertisseur de Formes",
    description:
      "Transforme instantanément n'importe quel tableau en une seule ligne ou colonne.",
    exercise:
      "Allez dans l'onglet TOCOL & TOROW de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1:
      "Combien de cellules contient le résultat de TOCOL dans l'exercice 1?",
    exercisePrompt2:
      "Comment avez-vous géré les cellules vides dans l'exercice 2?",
    trick:
      "Astuce: Utilisez l'argument skip_empty pour contrôler le traitement des cellules vides:\n=TOCOL(plage, [skip_empty])",
  },
  {
    name: "OFFSET",
    avatar: "🏹",
    superpower: "Le Navigateur de Cellules",
    description:
      "Se déplace avec précision dans n'importe quelle direction à partir d'un point de référence.",
    exercise:
      "Allez dans l'onglet OFFSET de votre fichier Excel et complétez les 2 exercices proposés.",
    exercisePrompt1: "Quelle formule avez-vous utilisée pour l'exercice 1?",
    exercisePrompt2:
      "Comment avez-vous créé une plage dynamique dans l'exercice 2?",
    trick:
      "Astuce: Combinez OFFSET avec COUNTA pour créer des plages dynamiques qui s'adaptent automatiquement:\n=OFFSET(référence, lignes, colonnes, [hauteur], [largeur])",
  },
];

// Données fictives pour le leaderboard
export const leaderboardData = [
  {
    name: "Adrien D.",
    completed: 5,
    completedFunctions: [0, 1, 3, 5, 8],
    totalTime: "12:47",
  },
  {
    name: "François R.",
    completed: 9,
    completedFunctions: [0, 1, 2, 3, 4, 6, 8, 10, 12],
    totalTime: "18:32",
  },
];
