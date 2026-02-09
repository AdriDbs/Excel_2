import { ExcelFunction } from "../types";

// Données des fonctions Excel à apprendre
export const excelFunctions: ExcelFunction[] = [
  {
    name: "XLOOKUP",
    avatar: "🔍",
    superpower: "Le Detective Polyvalent",
    description:
      "Trouve des données dans n'importe quelle direction avec une précision parfaite.",
    presentation:
      "🔍 XLOOKUP — Le Detective Polyvalent\n\nOubliez RECHERCHEV et ses limitations ! XLOOKUP est le couteau suisse de la recherche dans Excel. Elle cherche une valeur dans une colonne (ou ligne) et renvoie le résultat correspondant depuis une autre colonne — vers la gauche, la droite, peu importe.\n\n📐 Comment ça marche ?\nVous lui donnez 3 infos essentielles : ce que vous cherchez, où chercher, et où récupérer le résultat.\n\n📝 Syntaxe :\n=XLOOKUP(valeur_cherchée, plage_recherche, plage_résultat, [si_non_trouvé], [mode_correspondance], [mode_recherche])\n\n• valeur_cherchée : la valeur à trouver (ex: un nom de produit)\n• plage_recherche : la colonne où chercher\n• plage_résultat : la colonne d'où extraire le résultat\n• si_non_trouvé (optionnel) : message si rien n'est trouvé\n• mode_correspondance (optionnel) : 0 = exacte, -1 = approx. inf., 1 = approx. sup.\n\n💡 Exemple concret :\nVous avez une liste de collaborateurs avec leurs grades. Pour trouver le grade de Marie :\n=XLOOKUP(\"Marie\", A2:A100, C2:C100, \"Non trouvé\")\n→ Renvoie le grade de Marie, ou \"Non trouvé\" si elle n'est pas dans la liste.",
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
    presentation:
      "🧹 FILTER — Le Nettoyeur de Données\n\nFini les filtres manuels qu'il faut réappliquer à chaque modification ! FILTER extrait automatiquement les lignes qui correspondent à vos critères et met à jour le résultat en temps réel.\n\n📐 Comment ça marche ?\nVous sélectionnez une plage de données et définissez une ou plusieurs conditions. FILTER renvoie uniquement les lignes qui matchent.\n\n📝 Syntaxe :\n=FILTER(tableau, condition, [si_vide])\n\n• tableau : la plage de données complète à filtrer\n• condition : une expression booléenne (VRAI/FAUX) pour chaque ligne\n• si_vide (optionnel) : valeur affichée si aucun résultat ne correspond\n\n💡 Exemple concret :\nVous avez un tableau de ventes et voulez voir uniquement les ventes > 10 000€ :\n=FILTER(A2:D100, D2:D100>10000, \"Aucune vente\")\n→ Renvoie toutes les lignes où le montant dépasse 10 000€.\n\nBonus : combinez les conditions avec * (ET) ou + (OU) :\n=FILTER(A2:D100, (B2:B100=\"Paris\")*(D2:D100>5000))",
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
    presentation:
      "🔢 SEQUENCE — Le Générateur de Suites\n\nBesoin de créer une liste de numéros, de dates consécutives ou une grille de valeurs ? SEQUENCE génère tout ça en une seule formule, sans avoir à taper manuellement chaque cellule.\n\n📐 Comment ça marche ?\nVous indiquez combien de lignes et colonnes vous voulez, le point de départ et le pas d'incrémentation. Excel remplit tout automatiquement.\n\n📝 Syntaxe :\n=SEQUENCE(lignes, [colonnes], [début], [pas])\n\n• lignes : nombre de lignes à générer\n• colonnes (optionnel, défaut 1) : nombre de colonnes\n• début (optionnel, défaut 1) : première valeur de la séquence\n• pas (optionnel, défaut 1) : écart entre chaque valeur\n\n💡 Exemple concret :\nGénérer les numéros de facture de 1001 à 1010 :\n=SEQUENCE(10, 1, 1001, 1)\n→ Produit : 1001, 1002, 1003, ..., 1010\n\nCréer une grille 3x4 de multiples de 5 :\n=SEQUENCE(3, 4, 5, 5)\n→ Produit une matrice 3 lignes x 4 colonnes : 5, 10, 15, 20, 25...",
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
    presentation:
      "↔️ BYROW & BYCOL — L'Analyseur Dimensionnel\n\nVous voulez appliquer un calcul personnalisé à chaque ligne ou chaque colonne d'un tableau, sans copier-coller de formule ? BYROW et BYCOL le font pour vous en une seule cellule.\n\n📐 Comment ça marche ?\nVous passez un tableau et une fonction LAMBDA. BYROW applique votre LAMBDA à chaque ligne ; BYCOL l'applique à chaque colonne. Le résultat est un tableau de valeurs.\n\n📝 Syntaxe :\n=BYROW(tableau, LAMBDA(ligne, calcul))\n=BYCOL(tableau, LAMBDA(colonne, calcul))\n\n• tableau : la plage de données à parcourir\n• LAMBDA : une fonction personnalisée qui reçoit chaque ligne (ou colonne)\n• calcul : ce que vous voulez faire avec chaque ligne/colonne\n\n💡 Exemple concret :\nCalculer la moyenne de chaque ligne d'un tableau de notes :\n=BYROW(B2:F20, LAMBDA(ligne, AVERAGE(ligne)))\n→ Renvoie la moyenne par étudiant, en une seule formule !\n\nTrouver le max de chaque colonne :\n=BYCOL(B2:F20, LAMBDA(col, MAX(col)))",
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
    presentation:
      "✂️ CHOOSECOLS — Le Sculpteur de Colonnes\n\nVotre tableau a 15 colonnes mais vous n'en voulez que 3 ? CHOOSECOLS extrait exactement les colonnes que vous voulez, dans l'ordre que vous voulez, sans toucher aux données source.\n\n📐 Comment ça marche ?\nVous passez un tableau et la liste des numéros de colonnes à extraire. CHOOSECOLS renvoie un nouveau tableau contenant uniquement ces colonnes.\n\n📝 Syntaxe :\n=CHOOSECOLS(tableau, col1, [col2], [col3], ...)\n\n• tableau : la plage de données source\n• col1, col2, ... : les numéros des colonnes à extraire (1 = première colonne)\n• Les numéros négatifs comptent depuis la fin (-1 = dernière colonne)\n\n💡 Exemple concret :\nExtraire Nom (col 1), Email (col 4) et Ville (col 7) d'un fichier RH :\n=CHOOSECOLS(A1:J100, 1, 4, 7)\n→ Renvoie un tableau propre avec uniquement ces 3 colonnes.\n\nInverser l'ordre des colonnes :\n=CHOOSECOLS(A1:C10, 3, 2, 1)",
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
    presentation:
      "🎯 DROP & TAKE — Le Manipulateur d'Intervalles\n\nBesoin de garder uniquement les 5 premières lignes d'un résultat ? Ou de supprimer l'en-tête ? DROP et TAKE découpent vos tableaux avec une précision chirurgicale.\n\n📐 Comment ça marche ?\nTAKE garde les N premières (ou dernières) lignes/colonnes. DROP supprime les N premières (ou dernières) lignes/colonnes. Valeurs positives = depuis le début, négatives = depuis la fin.\n\n📝 Syntaxe :\n=TAKE(tableau, [lignes], [colonnes])\n=DROP(tableau, [lignes], [colonnes])\n\n• tableau : la plage de données\n• lignes : nombre de lignes à garder/supprimer (positif = début, négatif = fin)\n• colonnes (optionnel) : nombre de colonnes à garder/supprimer\n\n💡 Exemple concret :\nGarder le Top 5 d'un classement trié :\n=TAKE(A1:D100, 5)\n→ Renvoie uniquement les 5 premières lignes.\n\nSupprimer la ligne d'en-tête :\n=DROP(A1:D100, 1)\n→ Renvoie tout sauf la première ligne.\n\nGarder les 3 dernières lignes :\n=TAKE(A1:D100, -3)",
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
    presentation:
      "🔄 TRANSPOSE — Le Retourneur de Dimensions\n\nVotre tableau est en lignes mais vous le voulez en colonnes (ou l'inverse) ? TRANSPOSE retourne votre tableau en un clic : les lignes deviennent des colonnes et les colonnes deviennent des lignes.\n\n📐 Comment ça marche ?\nVous passez un tableau et TRANSPOSE pivote ses dimensions. Un tableau 3 lignes x 5 colonnes devient 5 lignes x 3 colonnes.\n\n📝 Syntaxe :\n=TRANSPOSE(tableau)\n\n• tableau : la plage de données à pivoter\n\nC'est tout ! Un seul argument, mais une puissance redoutable quand on la combine avec d'autres fonctions.\n\n💡 Exemple concret :\nVos mois sont en colonne A (A1:A12) et vous les voulez en ligne :\n=TRANSPOSE(A1:A12)\n→ Renvoie les 12 mois sur une seule ligne (B1:M1).\n\nCombiné avec FILTER pour pivoter un résultat filtré :\n=TRANSPOSE(FILTER(A2:D100, B2:B100=\"Paris\"))\n→ Filtre puis pivote le résultat.",
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
    presentation:
      "🧠 LET & MAP — L'Architecte de Variables\n\nVos formules deviennent illisibles avec des sous-formules répétées 3 fois ? LET crée des variables nommées dans votre formule. MAP applique une transformation à chaque élément d'un tableau. Ensemble, c'est la programmation dans Excel.\n\n📐 Comment ça marche ?\nLET : vous nommez des valeurs intermédiaires, puis vous les utilisez dans le calcul final. Cela évite de recalculer la même chose plusieurs fois.\nMAP : vous passez un tableau et une fonction LAMBDA, et MAP applique cette fonction à chaque cellule.\n\n📝 Syntaxe :\n=LET(nom1, valeur1, nom2, valeur2, ..., calcul_final)\n=MAP(tableau, LAMBDA(élément, transformation))\n\n• nom : le nom de votre variable (ex: total, tva, marge)\n• valeur : la formule ou valeur à stocker\n• calcul_final : la formule qui utilise vos variables\n\n💡 Exemple concret :\nCalculer un prix TTC avec remise, lisiblement :\n=LET(prix, B2, tva, 0.2, remise, 0.1, prix*(1+tva)*(1-remise))\n→ Clair et maintenable !\n\nMettre en majuscules chaque nom d'une liste :\n=MAP(A2:A50, LAMBDA(nom, UPPER(nom)))",
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
    presentation:
      "📚 VSTACK & HSTACK — L'Empileur de Données\n\nVous avez des données réparties sur plusieurs onglets ou tableaux et vous voulez tout regrouper ? VSTACK empile les tableaux verticalement (les uns sous les autres) et HSTACK les colle horizontalement (côte à côte).\n\n📐 Comment ça marche ?\nVous passez 2 tableaux (ou plus) et la fonction les assemble en un seul. VSTACK ajoute des lignes en dessous ; HSTACK ajoute des colonnes à droite.\n\n📝 Syntaxe :\n=VSTACK(tableau1, tableau2, [tableau3], ...)\n=HSTACK(tableau1, tableau2, [tableau3], ...)\n\n• tableau1, tableau2 : les plages de données à combiner\n• Pas de limite sur le nombre de tableaux !\n\n💡 Exemple concret :\nRegrouper les ventes Q1 et Q2 en un seul tableau :\n=VSTACK(VentesQ1, VentesQ2)\n→ Empile les données Q2 sous les données Q1.\n\nAjouter une colonne de classement à côté d'un tableau :\n=HSTACK(A1:C10, SEQUENCE(10))\n→ Colle une numérotation 1-10 à droite du tableau.",
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
    presentation:
      "📊 GROUPBY — L'Analyste de Groupes\n\nImaginez un tableau croisé dynamique... mais en formule ! GROUPBY regroupe vos données par catégorie et applique des calculs d'agrégation (somme, moyenne, comptage...) — le tout dynamiquement.\n\n📐 Comment ça marche ?\nVous indiquez quelles colonnes servent de regroupement, quelles colonnes sont agrégées, et quelle fonction d'agrégation appliquer.\n\n📝 Syntaxe :\n=GROUPBY(champ_ligne, valeurs, fonction_agrégation)\n\n• champ_ligne : la colonne servant de critère de regroupement (ex: Région)\n• valeurs : la colonne de données à agréger (ex: Montants)\n• fonction_agrégation : SUM, AVERAGE, COUNT, MAX, MIN... ou un numéro (9=SUM, 1=AVERAGE, etc.)\n\n💡 Exemple concret :\nCalculer le total des ventes par région :\n=GROUPBY(B2:B100, D2:D100, SUM)\n→ Renvoie un tableau avec chaque région et sa somme de ventes.\n\nC'est comme un TCD, mais directement dans vos cellules, et qui se met à jour automatiquement !",
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
    presentation:
      "🔍 REDUCE & SCAN — Le Calculateur Cumulatif\n\nBesoin de calculer un cumul, un produit en chaîne ou une opération qui s'accumule ligne après ligne ? REDUCE condense un tableau en une seule valeur. SCAN fait pareil mais garde toutes les étapes intermédiaires.\n\n📐 Comment ça marche ?\nVous fournissez une valeur de départ, un tableau et une fonction LAMBDA avec un accumulateur. REDUCE parcourt chaque élément et accumule le résultat. SCAN fait de même mais renvoie chaque étape.\n\n📝 Syntaxe :\n=REDUCE(valeur_initiale, tableau, LAMBDA(accumulateur, valeur, calcul))\n=SCAN(valeur_initiale, tableau, LAMBDA(accumulateur, valeur, calcul))\n\n• valeur_initiale : le point de départ (souvent 0 pour une somme)\n• tableau : les données à parcourir\n• accumulateur : le résultat cumulé à chaque étape\n• valeur : l'élément courant du tableau\n\n💡 Exemple concret :\nCalculer le produit de tous les nombres d'une colonne :\n=REDUCE(1, A2:A10, LAMBDA(acc, val, acc*val))\n→ Multiplie tous les nombres entre eux.\n\nAfficher le solde cumulé d'un compte :\n=SCAN(1000, B2:B20, LAMBDA(solde, mvt, solde+mvt))\n→ Renvoie le solde après chaque mouvement.",
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
    presentation:
      "🔀 TOCOL & TOROW — Le Convertisseur de Formes\n\nVous avez un tableau 2D et vous voulez tout mettre dans une seule colonne ou une seule ligne ? TOCOL aplatit un tableau en une colonne unique. TOROW l'aplatit en une ligne unique.\n\n📐 Comment ça marche ?\nVous passez un tableau (même sur plusieurs lignes et colonnes) et la fonction le convertit en un vecteur unidimensionnel. Vous pouvez choisir d'ignorer les cellules vides ou les erreurs.\n\n📝 Syntaxe :\n=TOCOL(tableau, [ignorer], [par_colonne])\n=TOROW(tableau, [ignorer], [par_colonne])\n\n• tableau : la plage de données à convertir\n• ignorer (optionnel) : 0 = rien, 1 = vides, 2 = erreurs, 3 = vides+erreurs\n• par_colonne (optionnel) : FAUX = lire par ligne (défaut), VRAI = lire par colonne\n\n💡 Exemple concret :\nConvertir un planning 4x5 en liste unique :\n=TOCOL(A1:E4)\n→ Renvoie les 20 cellules dans une seule colonne.\n\nAplatir en ignorant les cellules vides :\n=TOCOL(A1:E4, 1)\n→ Ne garde que les cellules non vides.",
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
    presentation:
      "🏹 OFFSET — Le Navigateur de Cellules\n\nOFFSET est le GPS d'Excel : partez d'une cellule de référence, déplacez-vous de N lignes et N colonnes, et récupérez une plage de la taille que vous voulez. Indispensable pour créer des plages dynamiques.\n\n📐 Comment ça marche ?\nVous donnez un point de départ (une cellule), un décalage en lignes et colonnes, puis optionnellement la taille de la plage à renvoyer. OFFSET ne déplace pas les données : elle renvoie une référence vers la nouvelle position.\n\n📝 Syntaxe :\n=OFFSET(référence, lignes, colonnes, [hauteur], [largeur])\n\n• référence : la cellule de départ (ex: A1)\n• lignes : décalage vertical (positif = vers le bas, négatif = vers le haut)\n• colonnes : décalage horizontal (positif = droite, négatif = gauche)\n• hauteur (optionnel) : nombre de lignes de la plage résultante\n• largeur (optionnel) : nombre de colonnes de la plage résultante\n\n💡 Exemple concret :\nRécupérer une cellule 3 lignes plus bas et 2 colonnes à droite de A1 :\n=OFFSET(A1, 3, 2)\n→ Renvoie la valeur de C4.\n\nCréer une plage dynamique qui s'adapte au nombre de lignes remplies :\n=SUM(OFFSET(A1, 0, 0, COUNTA(A:A), 1))\n→ Additionne toutes les valeurs non vides de la colonne A.",
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
