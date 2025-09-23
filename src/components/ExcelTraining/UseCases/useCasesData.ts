import { UseCase } from "./types";

export const useCasesData: UseCase[] = [
  {
    id: 1,
    title: "Optimisation de la performance financière",
    category: "Conseil en Management",
    description:
      "Analyse approfondie des indicateurs financiers pour identifier les opportunités d'optimisation des coûts et d'amélioration de la rentabilité opérationnelle.",
    functions: [
      {
        name: "XLOOKUP",
        description:
          "Permet d'établir des correspondances précises entre les données financières issues de différents systèmes d'information.",
        example:
          '=XLOOKUP(ID_transaction, registre_comptable[ID], registre_comptable[Montant], "Non réconcilié", 0)',
      },
      {
        name: "FILTER",
        description:
          "Isole les transactions selon des critères multiples pour faciliter l'analyse des écarts et anomalies financières.",
        example:
          "=FILTER(transactions, (montant>seuils)*(date>=date_début)*(date<=date_fin))",
      },
      {
        name: "UNIQUE",
        description:
          "Identifie les entités juridiques ou centres de coûts uniques pour assurer une allocation correcte des charges.",
        example: "=UNIQUE(registre_coûts[Centre_Coût])",
      },
    ],
    benefits: [
      "Réduction des coûts opérationnels de 12-15% grâce à l'identification précise des inefficiences",
      "Automatisation du reporting financier réduisant le temps de production de 75%",
      "Amélioration de la qualité et fiabilité des données financières consolidées",
      "Simplification des processus d'audit et réduction des risques de non-conformité",
      "Détection précoce des dérives budgétaires permettant des actions correctives rapides",
    ],
    implementation:
      "Structurez les données financières en tables liées par centre de coûts et entités. Utilisez XLOOKUP pour réconcilier les transactions entre systèmes, puis FILTER pour isoler les écarts significatifs. Créez un tableau de bord dynamique avec analyses de sensibilité permettant d'évaluer différents scénarios d'optimisation des coûts.",
    example:
      "Pour un groupe industriel réalisant 2,5 milliards d'euros de chiffre d'affaires, nous avons mis en place un système intégré d'analyse financière qui a permis d'identifier 37M€ d'économies potentielles en seulement huit semaines. L'automatisation des réconciliations inter-systèmes a éliminé plus de 200 heures de travail manuel mensuel pour l'équipe finance.",
    exampleSource: "Directeur Financier, Groupe Industriel International",
    related: "Rationalisation des investissements stratégiques",
  },
  {
    id: 2,
    title: "Tableau de bord exécutif multi-dimensions",
    category: "Conseil en Stratégie",
    description:
      "Création d'un tableau de bord stratégique permettant à la direction générale de suivre les KPIs critiques et d'analyser les performances selon plusieurs axes (géographique, ligne de produit, segment client).",
    functions: [
      {
        name: "GROUPBY",
        description:
          "Agrège les données selon de multiples dimensions pour créer des vues synthétiques adaptées aux besoins de la direction.",
        example:
          '=GROUPBY(données_ventes, colonne_région, colonne_segment, {"CA", LAMBDA(x, SUM(x))}, {"Marge", LAMBDA(x, AVERAGE(x))})',
      },
      {
        name: "VSTACK",
        description:
          "Consolide les données issues de différentes filiales ou systèmes d'information en un référentiel unique.",
        example: "=VSTACK(données_europe, données_amériques, données_asie)",
      },
      {
        name: "CHOOSECOLS",
        description:
          "Sélectionne précisément les métriques pertinentes pour le comité exécutif parmi la multitude de données disponibles.",
        example: "=CHOOSECOLS(données_consolidées, 1, 3, 8, 12)",
      },
      {
        name: "LET",
        description:
          "Améliore la lisibilité et la maintenabilité des formules complexes en définissant clairement les variables intermédiaires.",
        example:
          '=LET(données_traitées, VSTACK(données_EMEA, données_APAC), résumé, GROUPBY(données_traitées, 2, {"Total", LAMBDA(x, SUM(x))}), résumé)',
      },
    ],
    benefits: [
      "Alignement stratégique renforcé grâce à une vision unifiée et partagée des KPIs prioritaires",
      "Réduction du cycle de décision de 3 semaines à 3 jours pour les arbitrages stratégiques",
      "Détection précoce des tendances de marché et des signaux faibles",
      "Allocation des ressources optimisée à partir de données consolidées fiables",
      "Amélioration de la gouvernance avec une meilleure traçabilité des décisions",
    ],
    implementation:
      "Commencez par identifier les 7-10 indicateurs critiques en collaboration avec le comité exécutif. Consolidez les données sources avec VSTACK, puis créez des tableaux croisés dynamiques avancés avec GROUPBY. Définissez plusieurs niveaux de granularité pour permettre des analyses drill-down par le management. Intégrez des prévisions et des analyses d'écarts pour contextualiser les performances.",
    example:
      "Pour un leader mondial des services B2B, nous avons développé un tableau de bord exécutif qui a transformé le pilotage stratégique. Le CEO a témoigné que 'ce dashboard nous a permis d'identifier une opportunité de repositionnement sur un segment émergent représentant aujourd'hui 22% de notre croissance, alors qu'il était invisible dans nos anciens rapports'.",
    exampleSource: "PDG, Groupe international de services B2B",
    related: "Optimisation de la performance financière",
  },
  {
    id: 3,
    title: "Scoring et segmentation client avancée",
    category: "Conseil en Stratégie",
    description:
      "Méthodologie de scoring et segmentation multidimensionnelle des clients basée sur la valeur actuelle, le potentiel de développement, le coût de service et la probabilité de churn.",
    functions: [
      {
        name: "MAP",
        description:
          "Applique des modèles de scoring complexes à chaque client pour créer des indices de valeur composites.",
        example:
          "=MAP(clients, LAMBDA(client, valeur_actuelle*0.4 + potentiel*0.3 + fidélité*0.2 + rentabilité*0.1))",
      },
      {
        name: "REDUCE",
        description:
          "Calcule des métriques agrégées pour chaque segment client comme la valeur vie client (CLV) ou le coût d'acquisition.",
        example:
          "=REDUCE(0, revenus_projetés, LAMBDA(acc, val, acc + val/(1+taux_actualisation)^INDEX(périodes, SEQUENCE(ROWS(val)))))",
      },
      {
        name: "TRANSPOSE",
        description:
          "Réorganise les données clients pour faciliter l'analyse par attribut plutôt que par client.",
        example: "=TRANSPOSE(matrice_attributs_clients)",
      },
      {
        name: "BYROW",
        description:
          "Applique des formules de scoring spécifiques à chaque ligne client pour créer des matrices de segmentation.",
        example:
          '=BYROW(données_clients, LAMBDA(client, SI(INDEX(client,3)>seuil_1*ET(INDEX(client,5)<seuil_2),"Premium","Standard")))',
      },
    ],
    benefits: [
      "Augmentation de 18% du revenu par client sur les segments identifiés à fort potentiel",
      "Réduction du churn de 35% grâce à des stratégies de rétention ciblées par micro-segment",
      "Optimisation du budget marketing avec une amélioration du ROI de 27%",
      "Personnalisation de l'expérience client basée sur des insights data-driven",
      "Clarification de la stratégie commerciale avec des objectifs adaptés par segment",
    ],
    implementation:
      "Identifiez d'abord les variables clés de segmentation en collaboration avec les équipes commerciales et marketing. Construisez une matrice de scoring avec MAP, puis appliquez BYROW pour assigner des segments. Utilisez REDUCE pour calculer la valeur à vie estimée de chaque segment. Finalisez avec la création de playbooks commerciaux différenciés par segment et des KPIs de suivi d'efficacité.",
    example:
      "Notre équipe a accompagné un acteur majeur des services professionnels dans la refonte de sa stratégie de segmentation clients. En intégrant 23 variables d'analyse dans un modèle multidimensionnel, nous avons identifié 5 micro-segments à haute valeur précédemment non détectés. La réallocation des ressources commerciales basée sur cette segmentation a généré une croissance additionnelle de 14,2M€ en 18 mois.",
    exampleSource:
      "Directeur Commercial, Entreprise de Services Professionnels",
    related: "Optimisation du parcours client omnicanal",
  },
  {
    id: 4,
    title: "Détection de fraudes et anomalies financières",
    category: "Conseil en Management",
    description:
      "Système avancé de détection d'anomalies et de comportements frauduleux dans les données financières, transactionnelles et opérationnelles permettant d'identifier les risques avant qu'ils n'impactent l'entreprise.",
    functions: [
      {
        name: "SEQUENCE",
        description:
          "Génère des séquences pour l'analyse chronologique des transactions et la détection de patterns temporels suspects.",
        example: "=SEQUENCE(ROWS(transactions))",
      },
      {
        name: "FILTER",
        description:
          "Isole les transactions présentant des caractéristiques atypiques selon les règles métier définies et les seuils statistiques.",
        example:
          "=FILTER(transactions, ABS((montant-AVERAGE(montant))/STDEV(montant))>3)",
      },
      {
        name: "LET",
        description:
          "Améliore la lisibilité des analyses complexes en décomposant le processus de détection en étapes logiques.",
        example:
          "=LET(moyenne, AVERAGE(valeurs), écart_type, STDEV(valeurs), seuil, 2.5*écart_type, FILTER(données, ABS(valeurs-moyenne)>seuil))",
      },
      {
        name: "BYROW",
        description:
          "Applique des tests de détection personnalisés à chaque transaction pour identifier les anomalies multidimensionnelles.",
        example:
          "=BYROW(transactions, LAMBDA(r, OU(r[montant]>seuil_montant, ET(r[délai]<seuil_délai, r[fréquence]>seuil_fréquence))))",
      },
    ],
    benefits: [
      "Identification précoce des fraudes potentielles réduisant les pertes financières de 82%",
      "Diminution du taux de faux positifs de 65% par rapport aux méthodes traditionnelles",
      "Réduction du temps d'investigation de 12 jours à 4 heures grâce à la priorisation intelligente",
      "Amélioration de la conformité réglementaire et réduction des risques de sanctions",
      "Renforcement de la confiance des investisseurs et partenaires grâce à des contrôles internes robustes",
    ],
    implementation:
      "Commencez par établir une baseline statistique pour chaque type de transaction et entité. Utilisez SEQUENCE pour numéroter les transactions, puis LET pour définir les variables de contrôle. Appliquez FILTER avec des critères combinés pour détecter les anomalies simples, puis BYROW pour les patterns complexes. Intégrez un système de scoring d'anomalies pour prioriser les investigations et réduire les faux positifs.",
    example:
      "Pour une institution financière gérant plus de 20 millions de transactions mensuelles, nous avons implémenté un système de détection d'anomalies qui a permis d'identifier une fraude sophistiquée impliquant 14 entités différentes et représentant un risque de 4,7M€. Le système a détecté le schéma frauduleux trois mois avant qu'il n'aurait été visible par les contrôles traditionnels.",
    exampleSource:
      "Directeur Conformité, Institution Financière Internationale",
    related: "Optimisation de la performance financière",
  },
  {
    id: 5,
    title: "Allocation stratégique des ressources humaines",
    category: "Conseil en Transformation",
    description:
      "Système d'aide à la décision pour optimiser l'allocation des talents aux projets et missions en fonction de leurs compétences, disponibilités, aspirations et coûts, maximisant ainsi la valeur créée et la satisfaction des consultants.",
    functions: [
      {
        name: "CHOOSECOLS",
        description:
          "Sélectionne précisément les attributs pertinents pour l'analyse du matching entre consultants et projets.",
        example: "=CHOOSECOLS(profils_consultants, {1, 4, 7, 9, 12})",
      },
      {
        name: "FILTER",
        description:
          "Identifie les consultants disponibles répondant aux critères de compétences et d'expérience requis pour un projet spécifique.",
        example:
          "=FILTER(consultants, (disponibilité>=durée_projet)*(niveau_expertise>=niveau_requis))",
      },
      {
        name: "SORT",
        description:
          "Classe les consultants éligibles selon un score composite d'adéquation au projet et de développement professionnel.",
        example: "=SORT(consultants_disponibles, {4, -1, 7, -1})",
      },
      {
        name: "MAP",
        description:
          "Calcule des scores d'adéquation personnalisés pour chaque consultant selon les exigences spécifiques du projet.",
        example:
          "=MAP(consultants, LAMBDA(c, score_technique*0.4 + score_sectoriel*0.3 + score_soft_skills*0.2 + score_développement*0.1))",
      },
    ],
    benefits: [
      "Amélioration du taux d'utilisation des ressources de 68% à 84%",
      "Augmentation de la satisfaction des consultants de 23 points (NPS)",
      "Réduction du turnover de 28% grâce à une meilleure adéquation entre aspirations et missions",
      "Optimisation des coûts de déplacement et logistique de 31%",
      "Amélioration de la satisfaction client grâce à des équipes mieux adaptées aux enjeux spécifiques",
    ],
    implementation:
      "Créez une base de données des compétences, expériences et aspirations des consultants. Utilisez FILTER pour identifier les profils éligibles selon les critères techniques. Avec MAP, calculez un score composite intégrant l'adéquation technique, le développement professionnel et les contraintes logistiques. Finalisez avec SORT pour prioriser les meilleurs matchs et visualisez les résultats dans un tableau de bord de staffing.",
    example:
      "Notre cabinet a transformé son processus d'allocation des consultants avec cette approche data-driven. En six mois, nous avons constaté une augmentation de 17% de notre marge opérationnelle, principalement due à l'amélioration du taux d'utilisation et à la réduction des coûts logistiques. Plus significatif encore, notre turnover a diminué de 31% grâce à une meilleure prise en compte des aspirations professionnelles dans l'attribution des missions.",
    exampleSource: "Managing Partner, Cabinet de Conseil International",
    related: "Planification stratégique des compétences",
  },
  {
    id: 6,
    title: "Simulation de scénarios d'investissement stratégiques",
    category: "Conseil en Stratégie",
    description:
      "Modèle avancé d'évaluation et de simulation permettant aux dirigeants d'analyser l'impact de différents scénarios d'investissement sur la performance financière, la position concurrentielle et la création de valeur à long terme.",
    functions: [
      {
        name: "SEQUENCE",
        description:
          "Génère des périodes temporelles pour les projections financières et l'actualisation des flux.",
        example: "=SEQUENCE(10, 1, 2023, 1)",
      },
      {
        name: "LAMBDA",
        description:
          "Crée des fonctions personnalisées pour modéliser des relations complexes entre variables stratégiques.",
        example:
          "=LAMBDA(investissement, croissance_marché, part_marché_initiale, FONCTION_CROISSANCE(investissement, croissance_marché, part_marché_initiale))",
      },
      {
        name: "MAP",
        description:
          "Applique des modèles financiers à chaque période et scénario pour générer des projections complètes.",
        example:
          "=MAP(périodes, LAMBDA(t, flux_initial*(1+taux_croissance)^(t-année_initiale)))",
      },
      {
        name: "SCAN",
        description:
          "Calcule les résultats cumulatifs comme la valeur actualisée nette ou le retour sur investissement cumulé.",
        example:
          "=SCAN(0, flux_futurs, LAMBDA(acc, flux, acc + flux/(1+wacc)^SEQUENCE(ROWS(flux))))",
      },
    ],
    benefits: [
      "Réduction du risque d'investissement grâce à une analyse probabiliste des scénarios",
      "Amélioration du ROI des investissements stratégiques de 24% en moyenne",
      "Communication plus efficace avec le conseil d'administration et les investisseurs",
      "Alignement renforcé entre stratégie d'entreprise et allocation de capital",
      "Capacité à évaluer l'impact de disruptions potentielles sur le positionnement stratégique",
    ],
    implementation:
      "Définissez les variables clés de votre modèle stratégique (investissements, parts de marché, prix, etc.). Créez des séquences temporelles avec SEQUENCE, puis définissez des LAMBDA pour modéliser les relations entre variables. Utilisez MAP pour projeter les performances sous différents scénarios, et SCAN pour calculer les métriques cumulatives comme la VAN. Créez un tableau de bord interactif permettant de comparer visuellement les scénarios.",
    example:
      "Pour un acteur majeur de l'industrie pharmaceutique, nous avons développé un modèle de simulation permettant d'évaluer l'impact de différentes allocations de son budget R&D (1,2 milliard d'euros) entre développement interne, acquisitions et partenariats. Le modèle a identifié une allocation optimale générant une valeur additionnelle estimée à 2,7 milliards d'euros sur 10 ans par rapport à la stratégie initiale.",
    exampleSource: "VP Stratégie, Groupe Pharmaceutique Fortune 500",
    related: "Optimisation de portefeuille d'activités",
  },
  {
    id: 7,
    title: "Analyse d'expérience client et parcours omnicanal",
    category: "Conseil en Transformation",
    description:
      "Méthodologie intégrée d'analyse de l'expérience client à travers tous les points de contact pour identifier les irritants, opportunités d'amélioration et leviers de différenciation.",
    functions: [
      {
        name: "FILTER",
        description:
          "Isole les interactions clients correspondant à des parcours ou segments spécifiques pour une analyse ciblée.",
        example:
          '=FILTER(interactions, (segment=segment_cible)*(statut="Insatisfait"))',
      },
      {
        name: "GROUPBY",
        description:
          "Agrège les feedback clients par canal, étape du parcours ou problématique pour identifier les tendances.",
        example:
          '=GROUPBY(feedback, colonne_canal, colonne_étape, {"Score Moyen", LAMBDA(x, AVERAGE(x))})',
      },
      {
        name: "BYROW",
        description:
          "Analyse chaque interaction pour catégoriser les problèmes et déterminer leur impact sur la satisfaction globale.",
        example:
          '=BYROW(verbatims, LAMBDA(v, SI(ESTNUM(CHERCHE("problème",v)),"Négatif",SI(ESTNUM(CHERCHE("excellent",v)),"Positif","Neutre"))))',
      },
      {
        name: "VSTACK",
        description:
          "Consolide les données d'expérience client issues de différents canaux et systèmes pour une vue unifiée.",
        example:
          "=VSTACK(données_web, données_app, données_centre_appels, données_magasins)",
      },
    ],
    benefits: [
      "Augmentation du Net Promoter Score (NPS) de 18 points en 12 mois",
      "Réduction de 47% des abandons dans le tunnel de conversion",
      "Diminution du coût de service de 23% grâce à l'optimisation des canaux",
      "Amélioration du customer lifetime value de 31% sur les segments prioritaires",
      "Identification précise des investissements CX à plus fort impact ROI",
    ],
    implementation:
      "Cartographiez d'abord les parcours clients clés à travers tous les canaux. Consolidez les données d'interactions avec VSTACK. Utilisez FILTER pour isoler les points problématiques, puis GROUPBY pour identifier les irritants récurrents. Avec BYROW, catégorisez les verbatims pour une analyse qualitative. Créez un tableau de bord d'expérience client avec des scores par étape du parcours et des recommandations d'optimisation priorisées.",
    example:
      "Pour un leader de la banque de détail, nous avons analysé plus de 2 millions d'interactions clients à travers 7 canaux différents. Cette approche a permis d'identifier 23 irritants majeurs dont la résolution a généré une augmentation de la satisfaction de 24% et une réduction des coûts de service de 17,3M€ annuels. Plus remarquable encore, le taux de conversion des parcours digitaux a augmenté de 31%, générant un accroissement de revenus estimé à 44M€.",
    exampleSource:
      "Directeur de l'Expérience Client, Groupe Bancaire International",
    related: "Scoring et segmentation client avancée",
  },
  {
    id: 8,
    title: "Transformation digitale des processus opérationnels",
    category: "Conseil IT",
    description:
      "Méthodologie de diagnostic, priorisation et transformation des processus opérationnels grâce aux technologies digitales (RPA, IA, workflow automation) pour améliorer l'efficacité, réduire les coûts et créer de nouveaux avantages compétitifs.",
    functions: [
      {
        name: "SORT",
        description:
          "Priorise les processus selon leur potentiel d'amélioration, complexité de transformation et impact stratégique.",
        example: "=SORT(processus, {colonne_valeur, -1, colonne_effort, 1})",
      },
      {
        name: "FILTER",
        description:
          "Identifie les processus candidats à l'automatisation selon des critères prédéfinis (volume, standardisation, risque).",
        example:
          "=FILTER(processus, (volume>seuil_volume)*(standardisation>seuil_standard)*(risque<seuil_risque))",
      },
      {
        name: "TAKE",
        description:
          "Extrait un nombre spécifique de processus prioritaires pour constituer la première vague de transformation.",
        example: "=TAKE(processus_priorisés, 5)",
      },
      {
        name: "REDUCE",
        description:
          "Calcule l'impact cumulé de la transformation en termes de réduction des coûts, gains de productivité ou amélioration de qualité.",
        example:
          '=REDUCE(0, FILTER(processus, quick_wins="Oui"), LAMBDA(acc, p, acc + p[gains_estimés]))',
      },
    ],
    benefits: [
      "Réduction des coûts opérationnels de 25-40% sur les processus transformés",
      "Amélioration de la productivité des équipes de 35% en moyenne",
      "Réduction des erreurs et reprises de 78% grâce à l'automatisation",
      "Accélération des temps de traitement de 60-90% sur les processus clients critiques",
      "Libération de capacité des équipes pour des tâches à plus forte valeur ajoutée",
    ],
    implementation:
      "Cartographiez tous les processus opérationnels avec leurs caractéristiques clés (volume, fréquence, temps de traitement, etc.). Utilisez FILTER pour identifier les candidats à l'automatisation selon vos critères spécifiques. Appliquez SORT pour prioriser les processus selon leur ratio valeur/effort, puis TAKE pour sélectionner la première vague d'implémentation. Calculez avec REDUCE l'impact financier cumulé pour justifier l'investissement.",
    example:
      "Pour un leader de l'assurance, nous avons analysé 240 processus opérationnels et identifié 45 candidats prioritaires à la transformation digitale. La mise en œuvre sur les 15 premiers processus a généré 28M€ d'économies annuelles récurrentes et réduit les délais de traitement des sinistres de 72%, augmentant significativement la satisfaction client. Le ROI des technologies d'automatisation a été atteint en moins de 8 mois.",
    exampleSource: "COO, Compagnie d'Assurance Européenne",
    related: "Allocation stratégique des ressources humaines",
  },
];
