import React, { useState } from "react";
import { ArrowLeft, Check, AlertTriangle, Info, Lightbulb, PanelLeft, BarChart } from "lucide-react";
import { NavigationProps } from "../types";

const BestPracticesSection: React.FC<NavigationProps> = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState("organization");

  const tabs = [
    { id: "organization", label: "Organisation", icon: <PanelLeft size={18} /> },
    { id: "performance", label: "Performance", icon: <Lightbulb size={18} /> },
    { id: "formatting", label: "Mise en forme", icon: <BarChart size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo("menu")}
          className="mb-8 bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">
            Bonnes Pratiques <span className="text-yellow-400">Excel</span>
          </h1>
          <p className="text-xl text-green-200 max-w-3xl mx-auto">
            Découvrez les meilleures pratiques pour créer des fichiers Excel
            professionnels, performants et maintenables
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-md flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-green-900 font-bold"
                    : "text-white hover:bg-green-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white text-gray-800 rounded-xl p-6 shadow-xl">
          {activeTab === "organization" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-800">
                Organisation Optimale des Fichiers Excel
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Code couleur par onglet
                </h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="mb-3">
                    Utilisez un système de codage couleur cohérent pour vos onglets afin
                    d'identifier rapidement leur fonction :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                      <span>Données brutes et imports</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                      <span>Calculs et analyses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                      <span>Tableaux de bord et visualisations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded"></div>
                      <span>Paramètres et contrôles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-500 rounded"></div>
                      <span>Documentation et meta-données</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded"></div>
                      <span>Onglets temporaires ou en construction</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Info size={18} className="mt-1 flex-shrink-0 text-blue-500" />
                  <p className="text-sm">
                    Cette approche améliore considérablement la navigation et la
                    maintenance des fichiers complexes, particulièrement en équipe.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Structure standardisée des onglets
                </h3>
                <p className="mb-4">
                  Adoptez une structure cohérente pour tous vos fichiers d'analyse :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold text-green-800 mb-2">Onglets essentiels</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          <span className="font-bold">Menu/Accueil</span> - Point d'entrée
                          avec navigation hyperlinked
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          <span className="font-bold">Paramètres</span> - Variables globales,
                          scénarios, contrôles
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          <span className="font-bold">Documentation</span> - Sources,
                          hypothèses, méthodologie
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-bold text-blue-800 mb-2">Bénéfices</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-blue-600">✓</div>
                        <div>
                          Accélère l'orientation dans les fichiers complexes
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-blue-600">✓</div>
                        <div>
                          Facilite le transfert de fichiers entre collègues
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-blue-600">✓</div>
                        <div>
                          Permet la création de modèles réutilisables
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-blue-600">✓</div>
                        <div>
                          Réduit le temps d'appropriation par les clients
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                    <p>
                      <span className="font-bold">Conseil professionnel :</span> Créez un
                      modèle standard pour votre équipe/département avec ces onglets
                      pré-configurés pour gagner du temps et assurer la cohérence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-800">
                Optimisation des Performances
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Fonctions à faible impact mémoire
                </h3>
                <p className="mb-4">
                  Certaines fonctions sont beaucoup plus efficaces en termes d'utilisation mémoire et de vitesse de calcul :
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="border border-green-300 p-3 text-left">À privilégier</th>
                        <th className="border border-green-300 p-3 text-left">À éviter</th>
                        <th className="border border-green-300 p-3 text-left">Gain de performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-green-300 p-3">
                          SUM avec des arrays en conditions
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =SUM((data_range&gt;10)*(data_range&lt;20)*values_range)
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          SUMIFS ou SUMPRODUCT
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =SUMIFS(values_range, data_range, "&gt;10", data_range, "&lt;20")
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          <span className="text-green-600 font-bold">+40-60%</span> sur les grands jeux de données
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-green-300 p-3">
                          Références directes aux cellules
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =A1+B1+C1
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          Utilisation excessive d'INDIRECT
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =INDIRECT("A"&amp;ROW())+INDIRECT("B"&amp;ROW())
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          <span className="text-green-600 font-bold">+70-90%</span> sur les formules multiples
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-green-300 p-3">
                          INDEX/MATCH avec une recherche restreinte
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =INDEX(results, MATCH(lookup_value, lookup_column, 0))
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          VLOOKUP sur de très grandes plages
                          <div className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded">
                            =VLOOKUP(lookup_value, entire_table, col_index, FALSE)
                          </div>
                        </td>
                        <td className="border border-green-300 p-3">
                          <span className="text-green-600 font-bold">+20-30%</span> sur les grandes tables
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-blue-800 mb-2">Avantages concrets</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Temps de calcul réduit jusqu'à 10X</span> sur des fichiers de plusieurs centaines de milliers de lignes
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Taille de fichier réduite</span> facilitant le partage par email et l'ouverture rapide
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Moins de crashes</span> lors des analyses complexes ou des rafraîchissements de données
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Tables vs. Champs dynamiques
                </h3>
                <p className="mb-4">
                  Savoir quand utiliser chaque technologie est crucial pour l'équilibre entre performance et fonctionnalités :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Tables Excel</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>Facilite les références structurées (ex: TableName[ColumnName])</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>S'étend automatiquement lors de l'ajout de données</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>Filtres et tris intégrés et faciles à utiliser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">-</div>
                        <span>Performances réduites sur des millions de lignes</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">Champs Dynamiques</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <div className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>Performances supérieures sur de très grands volumes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>Modèle de données plus puissant avec relations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">+</div>
                        <span>Fonctions DAX pour analyses avancées</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">-</div>
                        <span>Courbe d'apprentissage plus raide</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Approche hybride optimale</h4>
                  <ol className="space-y-2 list-decimal pl-5">
                    <li>
                      <span className="font-medium">Utilisez des Tables Excel</span> pour les données sources de taille modérée (moins de 100 000 lignes)
                    </li>
                    <li>
                      <span className="font-medium">Migrez vers les Champs Dynamiques</span> lorsque vos données dépassent 100 000 lignes
                    </li>
                    <li>
                      <span className="font-medium">Créez des tables d'extraction</span> à partir des Champs Dynamiques pour les analyses ponctuelles
                    </li>
                    <li>
                      <span className="font-medium">Maintenez une couche de présentation</span> séparée du modèle de données pour les rapports clients
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === "formatting" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-800">
                Mise en forme professionnelle
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Graphiques professionnels
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Principes de base</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          Utilisez un <span className="font-medium">onglet dédié</span> pour les données formatées spécifiquement pour les graphiques
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          Limitez-vous à <span className="font-medium">5-7 catégories</span> maximum par graphique pour la lisibilité
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          Choisissez une <span className="font-medium">palette de couleurs cohérente</span> avec votre charte graphique
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-green-600">•</div>
                        <div>
                          Intégrez les <span className="font-medium">données directement dans le graphique</span> plutôt que d'utiliser une légende séparée quand c'est possible
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Graphiques interactifs</h4>
                    <p className="mb-3">
                      Les graphiques Excel peuvent être rendus interactifs sans code complexe :
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</div>
                        <span>Utilisez des contrôles de formulaire ou des segments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</div>
                        <span>Liez les sélections à une cellule de paramètre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</div>
                        <span>Utilisez INDIRECT ou INDEX pour extraire les données correspondantes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">4</div>
                        <span>Créez des plages dynamiques nommées</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                    <p>
                      <span className="font-bold">Conseil professionnel :</span> Vous n'avez pas besoin de ThinkCell pour la plupart des graphiques professionnels. Excel natif peut créer des graphiques de qualité présentation si vous maîtrisez les techniques avancées.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Helper columns and tables
                </h3>
                <p className="mb-4">
                  Les colonnes et tables d'aide sont essentielles pour les analyses complexes, mais doivent être bien organisées :
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">Bonnes pratiques</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>Placez les colonnes d'aide directement à droite de vos données principales pour une meilleure traçabilité</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>Colorez le fond des colonnes d'aide (gris clair) pour les distinguer visuellement des données principales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>Nommez clairement les colonnes d'aide avec un préfixe commun (ex: "calc_", "hlp_", "tmp_")</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>Documentez l'objectif de chaque colonne d'aide dans un commentaire de cellule ou une feuille de documentation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>Pour les tables d'aide complexes, créez un onglet séparé avec un préfixe de nommage clair (ex: "hlp_LookupValues")</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Colonnes d'aide typiques</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">•</div>
                        <span>Colonnes de transformation et standardisation de format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">•</div>
                        <span>Colonnes de calculs intermédiaires pour formules complexes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">•</div>
                        <span>Drapeaux et indicateurs (flags) pour filtrage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">•</div>
                        <span>Colonnes de classement et regroupement</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Avantages métier</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>Décomposition de problèmes complexes en étapes compréhensibles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>Meilleure auditabilité des calculs lors des contrôles qualité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>Simplification des dépannages et débogages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>Optimisation des performances en décomposant les calculs lourds</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Excel en Anglais
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
                  <p className="mb-4">
                    Utiliser Excel en anglais plutôt qu'en français présente de nombreux avantages pour les consultants :
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Avantages pratiques</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Cohérence des formules entre collaborateurs internationaux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Documentation et support en ligne majoritairement en anglais</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Évite les problèmes de conversion de formules entre versions linguistiques</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Impact client</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Facilite le partage avec les clients internationaux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Standard dans la plupart des grandes entreprises</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                          <span>Meilleure compatibilité avec les autres outils (VBA, Power BI, etc.)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                    <p>
                      <span className="font-bold">Comment configurer Excel en anglais :</span> Allez dans les paramètres Office, sélectionnez "Langue" et téléchargez le pack linguistique anglais. Redémarrez Office et sélectionnez l'anglais comme langue d'édition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestPracticesSection;