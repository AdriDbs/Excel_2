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
      "🔍 XLOOKUP — Le Detective Polyvalent\n\nOubliez RECHERCHEV et ses limitations ! XLOOKUP est le couteau suisse de la recherche dans Excel. Elle cherche une valeur dans une colonne (ou ligne) et renvoie le résultat correspondant depuis une autre colonne — vers la gauche, la droite, peu importe.\n\n📐 Comment ça marche ?\nVous lui donnez 3 infos essentielles : ce que vous cherchez, où chercher, et où récupérer le résultat.\n\n📝 Syntaxe :\n=XLOOKUP(valeur_cherchée, plage_recherche, plage_résultat, [si_non_trouvé], [mode_correspondance], [mode_recherche])\n\n• valeur_cherchée : la valeur à trouver (ex: un ID produit)\n• plage_recherche : la colonne où chercher\n• plage_résultat : la colonne d'où extraire le résultat\n• si_non_trouvé (optionnel) : message si rien n'est trouvé\n• mode_correspondance (optionnel) : 0 = exacte, -1 = approx. inf., 1 = approx. sup.\n\n💡 Exemple concret :\nVous gérez un tableau de collaborateurs avec ces colonnes :\n  Col A : ID_Collab | Col B : Nom | Col C : Service | Col D : Grade | Col E : Salaire\n\nCas 1 — Chercher le salaire de \"Sophie Martin\" :\n=XLOOKUP(\"Sophie Martin\", B2:B500, E2:E500, \"Introuvable\")\n→ Renvoie son salaire exact, ou \"Introuvable\" si le nom n'existe pas.\n\nCas 2 — Chercher à GAUCHE (impossible avec RECHERCHEV !) :\nTrouver l'ID à partir du grade \"Manager\" :\n=XLOOKUP(\"Manager\", D2:D500, A2:A500, \"Aucun résultat\")\n→ Renvoie l'ID du premier Manager trouvé. RECHERCHEV ne peut pas faire ça !\n\nCas 3 — Renvoyer plusieurs colonnes à la fois :\n=XLOOKUP(\"EMP-042\", A2:A500, C2:E500, \"Non trouvé\")\n→ Renvoie 3 valeurs : Service + Grade + Salaire en une seule formule !\n\nAvantages clés vs RECHERCHEV :\n• Recherche dans TOUTES les directions (gauche, droite, bas, haut)\n• Renvoie plusieurs colonnes en une seule formule\n• Gère nativement les valeurs manquantes avec le 4ème argument",
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
      "🧹 FILTER — Le Nettoyeur de Données\n\nFini les filtres manuels qu'il faut réappliquer à chaque modification ! FILTER extrait automatiquement les lignes qui correspondent à vos critères et met à jour le résultat en temps réel.\n\n📐 Comment ça marche ?\nVous sélectionnez une plage de données et définissez une ou plusieurs conditions. FILTER renvoie uniquement les lignes qui matchent.\n\n📝 Syntaxe :\n=FILTER(tableau, condition, [si_vide])\n\n• tableau : la plage de données complète à filtrer\n• condition : une expression booléenne (VRAI/FAUX) pour chaque ligne\n• si_vide (optionnel) : valeur affichée si aucun résultat ne correspond\n\n💡 Exemple concret :\nVous avez un tableau de 500 transactions de vente :\n  Col A : Date | Col B : Région | Col C : Commercial | Col D : Produit | Col E : CA (€)\n\nCas 1 — Filtrer uniquement les ventes > 10 000 € :\n=FILTER(A2:E500, E2:E500>10000, \"Aucune vente supérieure à 10 000€\")\n→ Renvoie toutes les lignes correspondantes avec TOUTES leurs colonnes.\n   Ex : 47 lignes sur 500 sont renvoyées automatiquement.\n\nCas 2 — Combiner 2 conditions avec * (ET logique) :\nVentes à Paris ET supérieures à 5 000 € :\n=FILTER(A2:E500, (B2:B500=\"Paris\")*(E2:E500>5000))\n→ Uniquement les lignes qui vérifient LES DEUX conditions simultanément.\n\nCas 3 — Combiner 2 conditions avec + (OU logique) :\nVentes à Lyon OU à Bordeaux :\n=FILTER(A2:E500, (B2:B500=\"Lyon\")+(B2:B500=\"Bordeaux\"))\n→ Renvoie les lignes de l'une OU l'autre ville (union des résultats).\n\nCas 4 — Imbriqué dans une somme :\n=SUM(FILTER(E2:E500, B2:B500=\"Paris\"))\n→ Calcule directement la somme des ventes parisiennes sans formule intermédiaire !\n\nDifférence clé avec le filtre standard :\n• FILTER est dynamique : résultats mis à jour sans aucune manipulation\n• Compatible dans d'autres formules : =AVERAGE(FILTER(...)), =COUNT(FILTER(...))",
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
      "🔢 SEQUENCE — Le Générateur de Suites\n\nBesoin de créer une liste de numéros, de dates consécutives ou une grille de valeurs ? SEQUENCE génère tout ça en une seule formule, sans avoir à taper manuellement chaque cellule.\n\n📐 Comment ça marche ?\nVous indiquez combien de lignes et colonnes vous voulez, le point de départ et le pas d'incrémentation. Excel remplit tout automatiquement.\n\n📝 Syntaxe :\n=SEQUENCE(lignes, [colonnes], [début], [pas])\n\n• lignes : nombre de lignes à générer\n• colonnes (optionnel, défaut 1) : nombre de colonnes\n• début (optionnel, défaut 1) : première valeur de la séquence\n• pas (optionnel, défaut 1) : écart entre chaque valeur\n\n💡 Exemple concret :\nCas 1 — Numéros de factures de FA-1001 à FA-1050 :\n=SEQUENCE(50, 1, 1001, 1)\n→ Génère : 1001, 1002, 1003, ..., 1050\nPour ajouter le préfixe : =\"FA-\"&SEQUENCE(50, 1, 1001, 1)\n→ Génère : FA-1001, FA-1002, ..., FA-1050\n\nCas 2 — Dates de travail sur 30 jours à partir du 01/01/2025 :\n=DATE(2025, 1, 1) + SEQUENCE(30, 1, 0, 1)\n→ Génère : 01/01/2025, 02/01/2025, 03/01/2025, ..., 30/01/2025\n\nCas 3 — Grille de multiplication 5×5 :\n=SEQUENCE(5, 1, 1, 1) * SEQUENCE(1, 5, 1, 1)\n→ Renvoie une matrice 5 lignes × 5 colonnes :\n   1  2  3  4  5\n   2  4  6  8 10\n   3  6  9 12 15\n   ...jusqu'à 5×5=25 !\n\nCas 4 — Progression géométrique (doublement) :\n=2^SEQUENCE(10, 1, 0, 1)\n→ Renvoie : 1, 2, 4, 8, 16, 32, 64, 128, 256, 512\n\nIntérêt principal : Remplace la saisie manuelle et s'adapte automatiquement si vous modifiez le nombre de lignes.",
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
      "↔️ BYROW & BYCOL — L'Analyseur Dimensionnel\n\nVous voulez appliquer un calcul personnalisé à chaque ligne ou chaque colonne d'un tableau, sans copier-coller de formule ? BYROW et BYCOL le font pour vous en une seule cellule.\n\n📐 Comment ça marche ?\nVous passez un tableau et une fonction LAMBDA. BYROW applique votre LAMBDA à chaque ligne ; BYCOL l'applique à chaque colonne. Le résultat est un tableau de valeurs.\n\n📝 Syntaxe :\n=BYROW(tableau, LAMBDA(ligne, calcul))\n=BYCOL(tableau, LAMBDA(colonne, calcul))\n\n• tableau : la plage de données à parcourir\n• LAMBDA : une fonction personnalisée qui reçoit chaque ligne (ou colonne)\n• calcul : ce que vous voulez faire avec chaque ligne/colonne\n\n💡 Exemple concret :\nVous avez un tableau de notes de 20 étudiants sur 5 matières (B2:F21) :\n  Colonnes B→F : Maths, Français, Anglais, Histoire, Science\n  Lignes 2→21 : chaque étudiant\n\nCas 1 — Calculer la MOYENNE de chaque étudiant (par ligne) :\n=BYROW(B2:F21, LAMBDA(ligne, AVERAGE(ligne)))\n→ Renvoie 20 valeurs (une par étudiant) :\n   Étudiant 1 : 14,2 | Étudiant 2 : 12,8 | Étudiant 3 : 16,0 | ...\nEn une seule formule pour tout le tableau !\n\nCas 2 — Calculer le MAX de chaque matière (par colonne) :\n=BYCOL(B2:F21, LAMBDA(col, MAX(col)))\n→ Renvoie 5 valeurs (une par matière) :\n   Maths : 19 | Français : 18 | Anglais : 20 | Histoire : 17 | Science : 18\n\nCas 3 — Calculer l'écart-type de chaque étudiant sur ses 5 notes :\n=BYROW(B2:F21, LAMBDA(ligne, STDEV(ligne)))\n→ Identifie les étudiants les plus réguliers (écart-type faible)\n   vs les plus irréguliers (écart-type élevé).\n\nDifférence clé :\n• BYROW → 1 résultat par LIGNE (analyse par étudiant, par commande, par projet...)\n• BYCOL → 1 résultat par COLONNE (analyse par matière, par mois, par catégorie...)",
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
      "✂️ CHOOSECOLS — Le Sculpteur de Colonnes\n\nVotre tableau a 15 colonnes mais vous n'en voulez que 3 ? CHOOSECOLS extrait exactement les colonnes que vous voulez, dans l'ordre que vous voulez, sans toucher aux données source.\n\n📐 Comment ça marche ?\nVous passez un tableau et la liste des numéros de colonnes à extraire. CHOOSECOLS renvoie un nouveau tableau contenant uniquement ces colonnes.\n\n📝 Syntaxe :\n=CHOOSECOLS(tableau, col1, [col2], [col3], ...)\n\n• tableau : la plage de données source\n• col1, col2, ... : les numéros des colonnes à extraire (1 = première colonne)\n• Les numéros négatifs comptent depuis la fin (-1 = dernière colonne)\n\n💡 Exemple concret :\nVous avez un export RH brut de 15 colonnes (A:O) :\n  A:ID | B:Nom | C:Prénom | D:Email | E:Tel | F:Service | G:Grade | H:Salaire\n  I:Ancienneté | J:Ville | K:CP | L:Pays | M:Manager | N:Contrat | O:DateEmbauche\n\nCas 1 — Extraire uniquement Nom, Prénom, Email et Salaire :\n=CHOOSECOLS(A1:O500, 2, 3, 4, 8)\n→ Renvoie un tableau propre à 4 colonnes : B, C, D, H uniquement.\n   Parfait pour un export destiné aux RH sans données sensibles.\n\nCas 2 — Réorganiser l'ordre des colonnes pour un rapport :\nAfficher Grade avant Service, et ajouter l'ID en dernier :\n=CHOOSECOLS(A1:O500, 3, 2, 7, 6, 1)\n→ Renvoie : Prénom | Nom | Grade | Service | ID (ordre personnalisé !)\n\nCas 3 — Utiliser des indices négatifs pour prendre depuis la fin :\n=CHOOSECOLS(A1:O500, -1, -2)\n→ Renvoie les 2 dernières colonnes : N (Contrat) et O (DateEmbauche)\n\nCas 4 — Combiné avec FILTER pour une vue ciblée :\n=CHOOSECOLS(FILTER(A1:O500, F2:F500=\"Finance\"), 2, 3, 8)\n→ Filtre les employés du service Finance ET garde seulement Nom, Prénom, Salaire.\n\nAvantage : aucune modification des données source, compatible avec VSTACK, FILTER, XLOOKUP.",
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
      "🎯 DROP & TAKE — Le Manipulateur d'Intervalles\n\nBesoin de garder uniquement les 5 premières lignes d'un résultat ? Ou de supprimer l'en-tête ? DROP et TAKE découpent vos tableaux avec une précision chirurgicale.\n\n📐 Comment ça marche ?\nTAKE garde les N premières (ou dernières) lignes/colonnes. DROP supprime les N premières (ou dernières) lignes/colonnes. Valeurs positives = depuis le début, négatives = depuis la fin.\n\n📝 Syntaxe :\n=TAKE(tableau, [lignes], [colonnes])\n=DROP(tableau, [lignes], [colonnes])\n\n• tableau : la plage de données\n• lignes : nombre de lignes à garder/supprimer (positif = début, négatif = fin)\n• colonnes (optionnel) : nombre de colonnes à garder/supprimer\n\n💡 Exemple concret :\nVous avez un classement de 500 commerciaux trié par performance décroissante :\n  Col A : Rang | Col B : Nom | Col C : CA Total | Col D : Nb Ventes | Col E : Région\n\nCas 1 — Afficher uniquement le Top 10 :\n=TAKE(A1:E500, 10)\n→ Renvoie uniquement les 10 premières lignes (les 10 meilleurs commerciaux).\n   Simple, lisible, et dynamique si le classement change !\n\nCas 2 — Exclure la ligne d'en-tête pour des calculs :\n=DROP(A1:E500, 1)\n→ Renvoie les lignes 2 à 500 (sans l'en-tête).\n   Utile pour imbriquer dans SUM, AVERAGE, ou d'autres formules.\n\nCas 3 — Afficher les 5 DERNIERS du classement (les plus faibles) :\n=TAKE(A1:E500, -5)\n→ Renvoie les 5 dernières lignes : les 5 commerciaux avec le moins de CA.\n\nCas 4 — Combinaison DROP + TAKE : extraire les rangs 6 à 10 :\n=TAKE(DROP(A1:E500, 5), 5)\n→ DROP supprime les 5 premiers, TAKE garde les 5 suivants → Rangs 6 à 10 exactement !\n\nCas 5 — Supprimer la ligne de totaux en bas de tableau :\n=DROP(A1:E501, -1)\n→ Supprime la dernière ligne (la ligne de total) pour ne travailler qu'avec les données brutes.\n\nTechnique avancée : combiner avec SORT pour un classement dynamique :\n=TAKE(SORT(A2:E500, 3, -1), 10)\n→ Trie par CA décroissant ET renvoie uniquement le Top 10 en une formule !",
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
      "🔄 TRANSPOSE — Le Retourneur de Dimensions\n\nVotre tableau est en lignes mais vous le voulez en colonnes (ou l'inverse) ? TRANSPOSE retourne votre tableau en un clic : les lignes deviennent des colonnes et les colonnes deviennent des lignes.\n\n📐 Comment ça marche ?\nVous passez un tableau et TRANSPOSE pivote ses dimensions. Un tableau 3 lignes × 5 colonnes devient 5 lignes × 3 colonnes.\n\n📝 Syntaxe :\n=TRANSPOSE(tableau)\n\n• tableau : la plage de données à pivoter\n\nC'est tout ! Un seul argument, mais une puissance redoutable quand on la combine avec d'autres fonctions.\n\n💡 Exemple concret :\nCas 1 — Vos données de ventes mensuelles sont en COLONNE (A1:A12) :\n  A1:Jan=12 500 € | A2:Fév=9 800 € | A3:Mar=15 200 € | ... | A12:Déc=18 900 €\n\nPour les afficher en LIGNE dans votre dashboard :\n=TRANSPOSE(A1:A12)\n→ Renvoie les 12 valeurs sur une seule ligne (de B1 à M1).\n   Parfait pour alimenter un graphique horizontal ou un tableau récapitulatif.\n\nCas 2 — Pivoter un tableau de données 3×5 en 5×3 :\nVotre tableau (3 produits × 5 critères) en A1:E3 :\n  Lignes = Produit A, Produit B, Produit C\n  Colonnes = Prix, Stock, Marge, Délai, Note\n=TRANSPOSE(A1:E3)\n→ Renvoie un tableau 5×3 : les critères deviennent les lignes,\n   les produits deviennent les colonnes. Idéal pour adapter l'orientation à votre rapport.\n\nCas 3 — Combiné avec FILTER pour pivoter des résultats filtrés :\n=TRANSPOSE(FILTER(B2:B100, A2:A100=\"Paris\"))\n→ Filtre d'abord les clients à Paris, puis pivote la liste en une ligne.\n\nCas 4 — Combiné avec SORT pour un classement horizontal :\n=TRANSPOSE(SORT(A2:A50, 1, -1))\n→ Trie les valeurs par ordre décroissant ET les affiche en ligne.\n\nAttention : Si les données source changent de taille, TRANSPOSE s'adapte automatiquement.",
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
      "🧠 LET & MAP — L'Architecte de Variables\n\nVos formules deviennent illisibles avec des sous-formules répétées 3 fois ? LET crée des variables nommées dans votre formule. MAP applique une transformation à chaque élément d'un tableau. Ensemble, c'est la programmation dans Excel.\n\n📐 Comment ça marche ?\nLET : vous nommez des valeurs intermédiaires, puis vous les utilisez dans le calcul final. Cela évite de recalculer la même chose plusieurs fois.\nMAP : vous passez un tableau et une fonction LAMBDA, et MAP applique cette fonction à chaque cellule.\n\n📝 Syntaxe :\n=LET(nom1, valeur1, nom2, valeur2, ..., calcul_final)\n=MAP(tableau, LAMBDA(élément, transformation))\n\n• nom : le nom de votre variable (ex: total, tva, marge)\n• valeur : la formule ou valeur à stocker\n• calcul_final : la formule qui utilise vos variables\n\n💡 Exemple concret :\nCas 1 — LET : Calculer la marge nette avec lisibilité maximale :\n\nSans LET (formule illisible et difficile à maintenir) :\n=(C2-B2)/C2*(1-0,33)*(1-E2/C2)\n\nAvec LET (chaque étape est nommée et compréhensible) :\n=LET(\n  ca,          C2,\n  couts,       B2,\n  taux_is,     0,33,\n  remise,      E2/C2,\n  marge_brute, (ca-couts)/ca,\n  marge_nette, marge_brute*(1-taux_is)*(1-remise),\n  marge_nette\n)\n→ Même résultat, mais chaque étape est nommée et lisible !\n   Si le taux d'IS change, vous modifiez 1 seule valeur.\n\nCas 2 — MAP : Transformer une liste de prix HT en prix TTC :\nVotre liste de prix HT est en B2:B50 :\n=MAP(B2:B50, LAMBDA(prix_ht, prix_ht * 1,2))\n→ Renvoie 49 valeurs TTC en une seule formule.\n   Équivalent de copier-coller \"=B2*1,2\" sur 49 lignes, mais en une seule cellule !\n\nCas 3 — LET + MAP combinés : remise variable par tranche de prix :\n=LET(\n  prix,             B2:B100,\n  seuil,            1000,\n  remise_standard,  0,05,\n  remise_premium,   0,12,\n  MAP(prix, LAMBDA(p, IF(p>seuil, p*(1-remise_premium), p*(1-remise_standard))))\n)\n→ Applique 12% de remise au-delà de 1 000€, 5% sinon — sur toute la liste d'un coup !",
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
      "📚 VSTACK & HSTACK — L'Empileur de Données\n\nVous avez des données réparties sur plusieurs onglets ou tableaux et vous voulez tout regrouper ? VSTACK empile les tableaux verticalement (les uns sous les autres) et HSTACK les colle horizontalement (côte à côte).\n\n📐 Comment ça marche ?\nVous passez 2 tableaux (ou plus) et la fonction les assemble en un seul. VSTACK ajoute des lignes en dessous ; HSTACK ajoute des colonnes à droite.\n\n📝 Syntaxe :\n=VSTACK(tableau1, tableau2, [tableau3], ...)\n=HSTACK(tableau1, tableau2, [tableau3], ...)\n\n• tableau1, tableau2 : les plages de données à combiner\n• Pas de limite sur le nombre de tableaux !\n\n💡 Exemple concret :\nSituation : Ventes réparties sur 4 feuilles trimestrielles :\n  Feuille Q1 : A2:D31 (30 lignes) | Q2 : A2:D32 (31 lignes)\n  Feuille Q3 : A2:D33 (32 lignes) | Q4 : A2:D34 (33 lignes)\n\nCas 1 — VSTACK : Regrouper toutes les ventes annuelles en une vue :\n=VSTACK(Q1!A2:D31, Q2!A2:D32, Q3!A2:D33, Q4!A2:D34)\n→ Renvoie un tableau consolidé de 126 lignes × 4 colonnes.\n   Pas besoin de copier-coller ! Mis à jour automatiquement si les données changent.\n\nCas 2 — HSTACK : Ajouter une colonne de numérotation à un tableau :\n=HSTACK(A1:C20, SEQUENCE(20))\n→ Colle une colonne 1→20 à droite du tableau A1:C20.\n   Idéal pour ajouter un rang, un index ou une référence sans modifier les données.\n\nCas 3 — VSTACK + FILTER : Consolider des données filtrées de plusieurs sources :\n=VSTACK(\n  FILTER(Q1!A2:D31, Q1!D2:D31>5000),\n  FILTER(Q2!A2:D32, Q2!D2:D32>5000)\n)\n→ Ne garde que les ventes > 5 000€ de Q1 et Q2, et les empile en un tableau unique.\n\nCas 4 — HSTACK pour enrichir avec des calculs :\n=HSTACK(A1:C20, A2:A21*B2:B21)\n→ Ajoute une colonne \"Total\" (quantité × prix) directement à droite du tableau source.\n\nDifférence fondamentale :\n• VSTACK → fusionne des lignes (ajoute des données \"en bas\")\n• HSTACK → fusionne des colonnes (ajoute des données \"à droite\")",
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
      "📊 GROUPBY — L'Analyste de Groupes\n\nImaginez un tableau croisé dynamique... mais en formule ! GROUPBY regroupe vos données par catégorie et applique des calculs d'agrégation (somme, moyenne, comptage...) — le tout dynamiquement.\n\n📐 Comment ça marche ?\nVous indiquez quelles colonnes servent de regroupement, quelles colonnes sont agrégées, et quelle fonction d'agrégation appliquer.\n\n📝 Syntaxe :\n=GROUPBY(champ_ligne, valeurs, fonction_agrégation)\n\n• champ_ligne : la colonne servant de critère de regroupement (ex: Région)\n• valeurs : la colonne de données à agréger (ex: Montants)\n• fonction_agrégation : SUM, AVERAGE, COUNT, MAX, MIN... ou un numéro (9=SUM, 1=AVERAGE, etc.)\n\n💡 Exemple concret :\nVous avez un tableau de 500 transactions :\n  Col A : Date | Col B : Région | Col C : Commercial | Col D : Produit | Col E : CA (€)\n\nCas 1 — Total des ventes par région :\n=GROUPBY(B2:B500, E2:E500, SUM)\n→ Renvoie automatiquement :\n   Bretagne       | 127 650 €\n   Île-de-France  | 245 820 €\n   PACA           | 189 340 €\n   ... (une ligne par région, triées alphabétiquement)\n\nCas 2 — Nombre de transactions par commercial :\n=GROUPBY(C2:C500, E2:E500, COUNT)\n→ Affiche combien de ventes chaque commercial a réalisées.\n   Jean Dupont | 47 | Sophie Martin | 62 | ...\n\nCas 3 — Ventes moyennes par produit :\n=GROUPBY(D2:D500, E2:E500, AVERAGE)\n→ CA moyen par produit. Identifie immédiatement les produits les plus rentables.\n\nCas 4 — Grouper par 2 critères simultanément (Région × Produit) :\n=GROUPBY(B2:C500, E2:E500, SUM)\n→ Croise la région et le produit → tableau croisé dynamique EN FORMULE !\n   Bretagne | Produit A | 45 200 €\n   Bretagne | Produit B | 82 450 €\n   ...\n\nAvantage vs TCD classique :\n• Dynamique sans \"Actualiser\" → résultats en temps réel\n• Utilisable dans d'autres formules (FILTER, SORT, XLOOKUP...)\n• Peut être imbriqué : =SUM(GROUPBY(...))",
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
      "🔍 REDUCE & SCAN — Le Calculateur Cumulatif\n\nBesoin de calculer un cumul, un produit en chaîne ou une opération qui s'accumule ligne après ligne ? REDUCE condense un tableau en une seule valeur. SCAN fait pareil mais garde toutes les étapes intermédiaires.\n\n📐 Comment ça marche ?\nVous fournissez une valeur de départ, un tableau et une fonction LAMBDA avec un accumulateur. REDUCE parcourt chaque élément et accumule le résultat. SCAN fait de même mais renvoie chaque étape.\n\n📝 Syntaxe :\n=REDUCE(valeur_initiale, tableau, LAMBDA(accumulateur, valeur, calcul))\n=SCAN(valeur_initiale, tableau, LAMBDA(accumulateur, valeur, calcul))\n\n• valeur_initiale : le point de départ (souvent 0 pour une somme, 1 pour un produit)\n• tableau : les données à parcourir\n• accumulateur : le résultat cumulé à chaque étape\n• valeur : l'élément courant du tableau\n\n💡 Exemple concret :\nVous avez les mouvements bancaires d'un compte en B2:B25 :\n  B2=+5 000 (dépôt initial) | B3=-250 | B4=+1 200 | B5=-890 | ...\n\nCas 1 — REDUCE : Calculer le solde FINAL après tous les mouvements :\n=REDUCE(0, B2:B25, LAMBDA(solde, mvt, solde + mvt))\n→ Renvoie UNE seule valeur : le solde total final.\n   Note : équivalent à =SOMME(B2:B25) ici, mais REDUCE peut faire des opérations bien plus complexes !\n\nCas 2 — SCAN : Afficher le solde après CHAQUE mouvement :\n=SCAN(0, B2:B25, LAMBDA(solde, mvt, solde + mvt))\n→ Renvoie 24 valeurs intermédiaires :\n   0 → 5 000 → 4 750 → 5 950 → 5 060 → ...\n   Parfait pour tracer un graphique d'évolution du solde !\n\nCas 3 — REDUCE pour calculer les intérêts composés :\nTaux mensuels en C2:C12 (ex: 0,02 ; 0,015 ; -0,01 ; ...) :\n=REDUCE(1, C2:C12, LAMBDA(acc, taux, acc * (1 + taux)))\n→ Renvoie le facteur multiplicateur total après 12 mois.\n   Impossible à calculer simplement avec SOMME ou PRODUIT !\n\nDifférence fondamentale :\n• REDUCE → 1 seule valeur finale (résultat de l'accumulation totale)\n• SCAN → N valeurs (toutes les étapes intermédiaires de l'accumulation)",
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
      "🔀 TOCOL & TOROW — Le Convertisseur de Formes\n\nVous avez un tableau 2D et vous voulez tout mettre dans une seule colonne ou une seule ligne ? TOCOL aplatit un tableau en une colonne unique. TOROW l'aplatit en une ligne unique.\n\n📐 Comment ça marche ?\nVous passez un tableau (même sur plusieurs lignes et colonnes) et la fonction le convertit en un vecteur unidimensionnel. Vous pouvez choisir d'ignorer les cellules vides ou les erreurs.\n\n📝 Syntaxe :\n=TOCOL(tableau, [ignorer], [par_colonne])\n=TOROW(tableau, [ignorer], [par_colonne])\n\n• tableau : la plage de données à convertir\n• ignorer (optionnel) : 0 = rien, 1 = vides, 2 = erreurs, 3 = vides+erreurs\n• par_colonne (optionnel) : FAUX = lire par ligne (défaut), VRAI = lire par colonne\n\n💡 Exemple concret :\nVous avez un planning de formation 4 semaines × 5 jours (A1:E4) :\n  Colonnes A→E : Lundi, Mardi, Mercredi, Jeudi, Vendredi\n  Lignes 1→4   : Semaine 1, Semaine 2, Semaine 3, Semaine 4\n\nCas 1 — TOCOL : Convertir le planning en liste verticale :\n=TOCOL(A1:E4)\n→ Renvoie 20 cellules dans une seule colonne (lecture par ligne) :\n   S1-Lun | S1-Mar | S1-Mer | S1-Jeu | S1-Ven | S2-Lun | ...\n\nCas 2 — TOCOL avec gestion des cases vides (jours fériés) :\n=TOCOL(A1:E4, 1)\n→ Ignore = 1 pour ignorer les cellules vides.\n   Renvoie uniquement les jours réellement planifiés, sans les cases vides !\n\nCas 3 — TOROW : Mettre des KPI mensuels en ligne pour un dashboard :\nVos valeurs Jan→Déc sont en colonne A1:A12 :\n=TOROW(A1:A12)\n→ Renvoie les 12 valeurs sur UNE SEULE LIGNE.\n   Parfait pour alimenter un graphique horizontal ou une ligne de tableau de bord.\n\nCas 4 — TOCOL + UNIQUE : Extraire la liste sans doublons d'un tableau 2D :\n=UNIQUE(TOCOL(A1:E10))\n→ Aplatit le tableau, puis supprime les doublons → liste unique en une formule !\n\nOptions de l'argument \"ignorer\" :\n  0 = conserver tout | 1 = ignorer les vides | 2 = ignorer les erreurs | 3 = ignorer vides ET erreurs",
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
      "🏹 OFFSET — Le Navigateur de Cellules\n\nOFFSET est le GPS d'Excel : partez d'une cellule de référence, déplacez-vous de N lignes et N colonnes, et récupérez une plage de la taille que vous voulez. Indispensable pour créer des plages dynamiques.\n\n📐 Comment ça marche ?\nVous donnez un point de départ (une cellule), un décalage en lignes et colonnes, puis optionnellement la taille de la plage à renvoyer. OFFSET ne déplace pas les données : elle renvoie une référence vers la nouvelle position.\n\n📝 Syntaxe :\n=OFFSET(référence, lignes, colonnes, [hauteur], [largeur])\n\n• référence : la cellule de départ (ex: A1)\n• lignes : décalage vertical (positif = vers le bas, négatif = vers le haut)\n• colonnes : décalage horizontal (positif = droite, négatif = gauche)\n• hauteur (optionnel) : nombre de lignes de la plage résultante\n• largeur (optionnel) : nombre de colonnes de la plage résultante\n\n💡 Exemple concret :\nCas 1 — Récupérer une valeur décalée de 3 lignes et 2 colonnes depuis A1 :\n=OFFSET(A1, 3, 2)\n→ Renvoie la valeur de C4 (A=col 1, +2=col 3=C ; ligne 1+3=ligne 4).\n   Utile pour naviguer dans un tableau sans connaître les coordonnées exactes.\n\nCas 2 — Plage dynamique pour un graphique qui s'étend automatiquement :\n=SUM(OFFSET(A2, 0, 0, COUNTA(A:A)-1, 1))\n→ Additionne TOUTES les valeurs non vides de la colonne A, même les nouvelles.\n   Quand vous ajoutez une ligne en bas, la somme s'actualise automatiquement !\n\nCas 3 — Dashboard paramétrable : moyenne des N derniers mois :\nLa cellule B1 contient le nombre de mois à analyser (ex: 3, 6 ou 12) :\n=AVERAGE(OFFSET(A100, -B1+1, 0, B1, 1))\n→ Calcule la moyenne des 3 dernières valeurs si B1=3, des 6 dernières si B1=6.\n   Il suffit de changer B1 pour modifier la fenêtre d'analyse !\n\nCas 4 — Navigation dans un catalogue pour un sélecteur déroulant :\nVotre liste de catégories est en A1:A5, les produits correspondants en B1:F5 :\n=OFFSET(A1, MATCH(G1, A1:A5, 0)-1, 1, 1, 5)\n→ Renvoie les 5 produits de la catégorie sélectionnée dans G1.\n\nUtilisations typiques d'OFFSET :\n• Plages dynamiques dans les graphiques\n• Lookups relatifs à une position variable\n• Tableaux de bord paramétrables\n• Calculs de moyennes mobiles sur N périodes",
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
