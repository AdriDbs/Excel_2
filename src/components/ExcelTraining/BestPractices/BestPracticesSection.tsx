import React, { useState } from "react";
import { ArrowLeft, Check, AlertTriangle, Info, Lightbulb, PanelLeft, BarChart, Zap, Sparkles, Hash } from "lucide-react";
import { NavigationProps } from "../types";
import { useExcelLanguage } from "../../../contexts/ExcelLanguageContext";
import { translateExcelTerms } from "../../../constants/excelFunctionTranslations";

const BestPracticesSection: React.FC<NavigationProps> = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState("organization");
  const { excelLanguage } = useExcelLanguage();
  const t = (text: string) => translateExcelTerms(text, excelLanguage);

  const tabs = [
    { id: "organization", label: "Organisation", icon: <PanelLeft size={18} /> },
    { id: "performance", label: "Performance", icon: <Lightbulb size={18} /> },
    { id: "formatting", label: "Mise en forme", icon: <BarChart size={18} /> },
    { id: "dynamic", label: "Fonctions Dynamiques", icon: <Zap size={18} /> },
    { id: "advanced-formulas", label: "Formules Avancées", icon: <Hash size={18} /> },
    { id: "copilot", label: "Copilot Excel", icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo("menu")}
          className="mb-8 bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">
            Bonnes Pratiques <span className="text-bp-red-400">Excel</span>
          </h1>
          <p className="text-xl text-bp-red-100 max-w-3xl mx-auto">
            Découvrez les meilleures pratiques pour créer des fichiers Excel
            professionnels, performants et maintenables
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-bp-red-600 p-1 rounded-lg flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-5 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-bp-red-700 font-bold"
                    : "text-white hover:bg-bp-red-500"
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
              <h2 className="text-2xl font-bold mb-6 text-bp-red-600">
                Organisation Optimale des Fichiers Excel
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
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
                      <div className="w-6 h-6 bg-bp-red-400 rounded"></div>
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
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Structure standardisée des onglets
                </h3>
                <p className="mb-4">
                  Adoptez une structure cohérente pour tous vos fichiers d'analyse :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold text-bp-red-600 mb-2">Onglets essentiels</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
                        <div>
                          <span className="font-bold">Menu/Accueil</span> - Point d'entrée
                          avec navigation hyperlinked
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
                        <div>
                          <span className="font-bold">Paramètres</span> - Variables globales,
                          scénarios, contrôles
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
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
              <h2 className="text-2xl font-bold mb-6 text-bp-red-600">
                Optimisation des Performances
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
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
                          <span className="text-bp-red-500 font-bold">+40-60%</span> sur les grands jeux de données
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
                          <span className="text-bp-red-500 font-bold">+70-90%</span> sur les formules multiples
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
                          <span className="text-bp-red-500 font-bold">+20-30%</span> sur les grandes tables
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
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
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
                  <h4 className="font-bold text-bp-red-600 mb-2">Approche hybride optimale</h4>
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
              <h2 className="text-2xl font-bold mb-6 text-bp-red-600">
                Mise en forme professionnelle
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Graphiques professionnels
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Principes de base</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
                        <div>
                          Utilisez un <span className="font-medium">onglet dédié</span> pour les données formatées spécifiquement pour les graphiques
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
                        <div>
                          Limitez-vous à <span className="font-medium">5-7 catégories</span> maximum par graphique pour la lisibilité
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
                        <div>
                          Choisissez une <span className="font-medium">palette de couleurs cohérente</span> avec votre charte graphique
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 text-bp-red-500">•</div>
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
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Helper columns and tables
                </h3>
                <p className="mb-4">
                  Les colonnes et tables d'aide sont essentielles pour les analyses complexes, mais doivent être bien organisées :
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">Bonnes pratiques</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                      <span>Placez les colonnes d'aide directement à droite de vos données principales pour une meilleure traçabilité</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                      <span>Colorez le fond des colonnes d'aide (gris clair) pour les distinguer visuellement des données principales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                      <span>Nommez clairement les colonnes d'aide avec un préfixe commun (ex: "calc_", "hlp_", "tmp_")</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                      <span>Documentez l'objectif de chaque colonne d'aide dans un commentaire de cellule ou une feuille de documentation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
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
                    <h4 className="font-bold text-bp-red-600 mb-2">Avantages métier</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                        <span>Décomposition de problèmes complexes en étapes compréhensibles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                        <span>Meilleure auditabilité des calculs lors des contrôles qualité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                        <span>Simplification des dépannages et débogages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                        <span>Optimisation des performances en décomposant les calculs lourds</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
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
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                          <span>Cohérence des formules entre collaborateurs internationaux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                          <span>Documentation et support en ligne majoritairement en anglais</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                          <span>Évite les problèmes de conversion de formules entre versions linguistiques</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Impact client</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                          <span>Facilite le partage avec les clients internationaux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
                          <span>Standard dans la plupart des grandes entreprises</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={18} className="text-bp-red-500 mt-1 flex-shrink-0" />
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
          {activeTab === "dynamic" && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-bp-red-600">
                Fonctions Dynamiques Excel
              </h2>
              <p className="text-gray-600 mb-6">
                Depuis Excel 365, une nouvelle génération de fonctions transforme radicalement la façon de travailler avec les données. Ces fonctions — présentées dans le Speed Dating et le Hackathon — renvoient des <span className="font-semibold">tableaux entiers</span> qui se répandent automatiquement dans les cellules voisines (<em>spilling</em>), sans manipulation manuelle.
              </p>

              {/* Qu'est-ce qu'une fonction dynamique ? */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Zap className="text-bp-red-500" size={20} />
                  Qu'est-ce qu'une fonction dynamique ?
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                  <p className="mb-3">
                    Une <span className="font-bold">fonction dynamique</span> (ou <em>dynamic array function</em>) est une formule qui peut renvoyer plusieurs valeurs à la fois, remplissant automatiquement une plage de cellules à partir d'une seule formule.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h4 className="font-bold text-gray-700 mb-2">Avant (fonctions classiques)</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> Une formule = une seule valeur</li>
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> Copier-coller sur chaque ligne manuellement</li>
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> Formules rigides, difficiles à mettre à jour</li>
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> Risque d'oublier de copier la formule sur les nouvelles lignes</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h4 className="font-bold text-gray-700 mb-2">Après (fonctions dynamiques)</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> Une formule = un tableau de valeurs</li>
                        <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> Propagation automatique (<em>spill</em>) dans les cellules voisines</li>
                        <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> Mise à jour automatique si les données sources changent</li>
                        <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> Combinables entre elles pour des analyses puissantes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                    <p className="text-sm">
                      <span className="font-bold">Prérequis :</span> Les fonctions dynamiques sont disponibles dans <span className="font-bold">Excel 365</span> et <span className="font-bold">Excel 2021</span>. Elles ne fonctionnent pas dans les versions antérieures (2019 et avant).
                    </p>
                  </div>
                </div>
              </div>

              {/* Avantages clés */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Pourquoi les adopter ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">⚡</div>
                    <h4 className="font-bold text-green-800 mb-1">Productivité</h4>
                    <p className="text-sm text-gray-600">
                      Une seule formule remplace des dizaines de formules copiées-collées. Moins de temps passé à maintenir des colonnes d'aide répétitives.
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">🔄</div>
                    <h4 className="font-bold text-purple-800 mb-1">Dynamisme</h4>
                    <p className="text-sm text-gray-600">
                      Les résultats se mettent à jour automatiquement dès que les données sources changent. Aucune manipulation manuelle nécessaire.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">🧩</div>
                    <h4 className="font-bold text-blue-800 mb-1">Combinabilité</h4>
                    <p className="text-sm text-gray-600">
                      Les fonctions s'imbriquent facilement entre elles. <span className="font-mono text-xs">FILTER</span>, <span className="font-mono text-xs">SORT</span>, <span className="font-mono text-xs">XLOOKUP</span> combinés créent des analyses puissantes en une ligne.
                    </p>
                  </div>
                </div>
              </div>

              {/* Les fonctions clés */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Les fonctions dynamiques essentielles
                </h3>

                <div className="space-y-4">
                  {/* XLOOKUP */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">🔍</span>
                      <div>
                        <span className="font-bold text-gray-800">XLOOKUP</span>
                        <span className="ml-2 text-sm text-gray-500">— Le successeur de RECHERCHEV</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Recherche dans <strong>n'importe quelle direction</strong> (gauche, droite, haut, bas) et peut renvoyer <strong>plusieurs colonnes</strong> en une seule formule. Gère nativement les erreurs avec son 4ᵉ argument.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =XLOOKUP("Sophie Martin", B2:B500, C2:E500, "Introuvable")
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Renvoie 3 colonnes d'un coup : Service, Grade, Salaire</p>
                    </div>
                  </div>

                  {/* FILTER */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">🧹</span>
                      <div>
                        <span className="font-bold text-gray-800">FILTER</span>
                        <span className="ml-2 text-sm text-gray-500">— Filtrage dynamique en formule</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Extrait les lignes correspondant à un ou plusieurs critères, <strong>sans modifier les données source</strong>. Combine conditions ET (<code className="text-xs bg-gray-100 px-1 rounded">*</code>) et OU (<code className="text-xs bg-gray-100 px-1 rounded">+</code>).
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =FILTER(A2:E500, (B2:B500="Paris")*(E2:E500&gt;5000))
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Ventes à Paris ET supérieures à 5 000 €, mis à jour en temps réel</p>
                    </div>
                  </div>

                  {/* SORT & UNIQUE */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">🔤</span>
                      <div>
                        <span className="font-bold text-gray-800">SORT / UNIQUE</span>
                        <span className="ml-2 text-sm text-gray-500">— Tri et dédoublonnage dynamiques</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>SORT</strong> trie un tableau dans l'ordre souhaité. <strong>UNIQUE</strong> élimine les doublons. Combinés à FILTER, ils créent des listes déroulantes et des classements entièrement automatiques.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =SORT(FILTER(A2:E500, B2:B500="Paris"), 3, -1)
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Ventes de Paris triées par CA décroissant, sans aucune manipulation</p>
                    </div>
                  </div>

                  {/* SEQUENCE */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">🔢</span>
                      <div>
                        <span className="font-bold text-gray-800">SEQUENCE</span>
                        <span className="ml-2 text-sm text-gray-500">— Génération automatique de séquences</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Génère des séries de nombres, de dates, ou de grilles sans saisie manuelle. Idéal pour créer des en-têtes de tableaux, des numéros de lignes ou des calendriers.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =DATE(2025,1,1) + SEQUENCE(30,1,0,1)
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Génère 30 dates consécutives à partir du 1er janvier 2025</p>
                    </div>
                  </div>

                  {/* VSTACK & HSTACK */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">📚</span>
                      <div>
                        <span className="font-bold text-gray-800">VSTACK / HSTACK</span>
                        <span className="ml-2 text-sm text-gray-500">— Consolidation sans copier-coller</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Empile des tableaux verticalement (VSTACK) ou horizontalement (HSTACK). Parfait pour consolider des données réparties sur plusieurs onglets ou fichiers.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =VSTACK(Q1!A2:D31, Q2!A2:D32, Q3!A2:D33, Q4!A2:D34)
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Consolide 4 trimestres en un seul tableau, mis à jour automatiquement</p>
                    </div>
                  </div>

                  {/* GROUPBY */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">📊</span>
                      <div>
                        <span className="font-bold text-gray-800">GROUPBY</span>
                        <span className="ml-2 text-sm text-gray-500">— Tableau croisé dynamique en formule</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Regroupe et agrège des données <strong>sans créer de TCD</strong>. Le résultat est utilisable directement dans d'autres formules, contrairement aux tableaux croisés dynamiques classiques.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =GROUPBY(B2:B500, E2:E500, SUM)
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Total des ventes par région, dynamique et imbricable</p>
                    </div>
                  </div>

                  {/* LET & LAMBDA */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <span className="text-2xl">🧠</span>
                      <div>
                        <span className="font-bold text-gray-800">LET / MAP / BYROW / BYCOL</span>
                        <span className="ml-2 text-sm text-gray-500">— Programmation dans Excel</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>LET</strong> crée des variables nommées pour simplifier les formules complexes. <strong>MAP</strong>, <strong>BYROW</strong> et <strong>BYCOL</strong> appliquent une transformation personnalisée à chaque élément, ligne ou colonne d'un tableau.
                      </p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        =LET(ca, C2, couts, B2, marge, (ca-couts)/ca, marge)
                      </div>
                      <p className="text-xs text-gray-500 mt-1">→ Formule lisible avec variables nommées, facile à auditer et maintenir</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonnes pratiques d'utilisation */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Bonnes pratiques d'utilisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">À faire</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Laisser les colonnes de <em>spill</em> libres de tout contenu pour éviter l'erreur <code className="bg-gray-100 px-1 rounded text-xs">#EPARS!</code></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Utiliser la notation <code className="bg-gray-100 px-1 rounded text-xs">A1#</code> (opérateur de déversement) pour référencer toute la plage dynamique d'une formule</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Combiner les fonctions dynamiques avec des <strong>Tableaux Excel structurés</strong> pour une mise à jour encore plus automatique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Utiliser <strong>LET</strong> pour nommer les sous-formules et rendre les imbrications lisibles</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-800 mb-2">À éviter</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Mettre du contenu dans les cellules où la formule dynamique va se déverser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Utiliser des fonctions dynamiques dans des classeurs partagés avec des collaborateurs sous Excel 2019 ou antérieur</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Imbriquer plus de 4-5 niveaux sans utiliser LET pour nommer les étapes intermédiaires</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exemple d'analyse complète */}
              <div className="bg-bp-red-50 border border-bp-red-200 rounded-xl p-5">
                <h4 className="font-bold text-bp-red-700 mb-3 text-lg">Exemple : analyse complète en une formule</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Grâce aux fonctions dynamiques, une analyse qui nécessitait autrefois plusieurs onglets de calculs intermédiaires peut s'écrire en une seule formule :
                </p>
                <div className="font-mono text-xs bg-white border border-bp-red-100 p-3 rounded-lg mb-3">
                  =TAKE(SORT(GROUPBY(B2:B500, E2:E500, SUM), 2, -1), 5)
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Résultat :</span> Top 5 des régions par chiffre d'affaires total, trié du plus grand au plus petit — dynamique, sans TCD, sans colonne d'aide.
                </p>
              </div>
            </div>
          )}

          {activeTab === "advanced-formulas" && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-bp-red-600">
                Formules Avancées
              </h2>
              <p className="text-gray-600 mb-6">
                Deux techniques qui changent la vie une fois maîtrisées : référencer automatiquement le résultat complet d'une formule dynamique avec l'opérateur <code className="bg-gray-100 px-1 rounded">#</code>, et construire des conditions sophistiquées avec de simples opérateurs <code className="bg-gray-100 px-1 rounded">*</code> et <code className="bg-gray-100 px-1 rounded">+</code>.
              </p>

              {/* Section A : Champs nommés et opérateur # */}
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Hash className="text-bp-red-500" size={20} />
                  Champs nommés et l'opérateur # (déversement)
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                  <h4 className="font-bold text-blue-800 mb-2">Nommer une plage ou une cellule</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Sélectionnez une plage, tapez un nom dans la <strong>zone de nom</strong> (à gauche de la barre de formule) et validez avec Entrée — ou passez par <strong>Formules {'>'} Gestionnaire de noms</strong> (<code className="bg-white px-1 rounded text-xs">Ctrl+F3</code>). Vous pouvez ensuite écrire <code className="bg-white px-1 rounded text-xs">{t("=SUM(Ventes)")}</code> plutôt que <code className="bg-white px-1 rounded text-xs">{t("=SUM(B2:B500)")}</code> — bien plus lisible et moins sujet aux erreurs de plage.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-4">
                  <h4 className="font-bold text-purple-800 mb-2">L'opérateur # : récupérer tout un résultat déversé</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Quand une formule dynamique (voir l'onglet précédent) se <strong>déverse</strong> sur plusieurs cellules, taper le nom — ou l'adresse — de la <strong>cellule d'origine</strong> suivi de <code className="bg-white px-1 rounded text-xs">#</code> référence <strong>automatiquement toute la plage déversée</strong>, quelle que soit sa taille. Si le nombre de résultats change (données sources modifiées), la référence <code className="bg-white px-1 rounded text-xs">#</code> s'ajuste toute seule.
                  </p>
                  <div className="font-mono text-xs bg-white p-3 rounded border border-purple-100 mb-2">
                    B2: {t("=FILTER(A2:D500, C2:C500=\"Paris\")")} <span className="text-gray-400">→ se déverse sur B2:E47</span><br />
                    Ailleurs : <span className="font-bold">=SUM(B2#)</span> <span className="text-gray-400">→ prend toute la plage déversée, même si elle passe à B2:E52 le lendemain</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Combiné à un <strong>champ nommé</strong>, c'est encore plus lisible : nommez la cellule d'origine (ex: <code className="bg-white px-1 rounded text-xs">Resultat_Filtre</code>), puis écrivez <code className="bg-white px-1 rounded text-xs">Resultat_Filtre#</code> partout ailleurs — la formule s'adapte, et le nom explique ce qu'elle contient.
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                    <p className="text-sm">
                      <span className="font-bold">Lien avec le Speed Dating :</span> toutes les fonctions vues en Speed Dating ({t("XLOOKUP")}, {t("FILTER")}, {t("UNIQUE")}, {t("SEQUENCE")}, {t("SORT")}, {t("VSTACK")}, {t("HSTACK")}, {t("GROUPBY")}...) sont des fonctions dynamiques : dès qu'elles se déversent, <code className="bg-white px-1 rounded text-xs">#</code> permet de récupérer <strong>tout leur résultat</strong> ailleurs dans le classeur, sans jamais avoir à retaper ni recalculer la plage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section B : Conditions avec * et + */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Zap className="text-bp-red-500" size={20} />
                  Conditions sophistiquées avec * et +
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Un test comme <code className="bg-white px-1 rounded text-xs">(A1:A100="1")</code> renvoie un tableau de <strong>VRAI/FAUX</strong> — une valeur par cellule de la plage. En arithmétique, Excel traite <code className="bg-white px-1 rounded text-xs">VRAI</code> comme <strong>1</strong> et <code className="bg-white px-1 rounded text-xs">FAUX</code> comme <strong>0</strong>. Cela permet de combiner plusieurs conditions avec de simples opérateurs :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">*</span>
                        ET logique
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">Le produit ne vaut 1 que si <strong>toutes</strong> les conditions sont vraies (1×1=1, sinon 0).</p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        (A1:A100="1")*(B1:B100&lt;&gt;"Non")
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">+</span>
                        OU logique
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">La somme vaut au moins 1 dès qu'<strong>une</strong> des conditions est vraie (1+0=1, 1+1=2 — toujours non-nul donc "vrai").</p>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        (B1:B100="Paris")+(B1:B100="Lyon")
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4">
                  <h4 className="font-bold text-bp-red-600 mb-2">Compter ou sommer selon plusieurs conditions</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    En enveloppant le produit des conditions dans {t("SUM")}, on compte directement le nombre de lignes qui vérifient <strong>toutes</strong> les conditions à la fois :
                  </p>
                  <div className="font-mono text-xs bg-white p-3 rounded border border-green-100 mb-2">
                    {t("=SUM((A1:A100=\"1\")*(B1:B100<>\"Non\"))")}
                  </div>
                  <p className="text-xs text-gray-500">→ Nombre de lignes où la colonne A vaut "1" ET où la colonne B ne vaut pas "Non".</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h4 className="font-bold text-purple-800 mb-2">Condition sur le contenu d'une cellule : {t("ISNUMBER")}({t("SEARCH")}(...))</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Ni {t("COUNTIF")} ni un simple <code className="bg-white px-1 rounded text-xs">=</code> ne permettent de tester si une cellule <strong>contient</strong> un mot au milieu d'un texte plus long. La combinaison {t("SEARCH")} (renvoie une position si le texte est trouvé, une erreur sinon) + {t("ISNUMBER")} (transforme ce résultat en VRAI/FAUX) répond exactement à ce besoin — et se combine avec {'*'} comme n'importe quelle autre condition :
                  </p>
                  <div className="font-mono text-xs bg-white p-3 rounded border border-purple-100 mb-2">
                    {t("=SUM(ISNUMBER(SEARCH(\"XXX\";A1:A100))*(B1:B100<>\"Non\"))")}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">→ Combien de cellules de A1:A100 contiennent "XXX" ET n'ont pas "Non" en colonne B.</p>
                  <p className="text-xs text-gray-600">
                    Astuce : {t("SEARCH")} ignore la casse (majuscules/minuscules) ; pour une recherche sensible à la casse, utilisez {t("FIND")} à la place (même principe, syntaxe identique).
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm">
                    <span className="font-bold">Alternative "propre" :</span> pour des cas simples, {t("SUMIFS")}/{t("COUNTIFS")} restent plus lisibles et souvent plus rapides. La technique {'*'}/{'+'} devient indispensable dès que la condition ne peut pas s'exprimer avec les fonctions <code className="bg-white px-1 rounded text-xs">.SI.ENS</code> classiques — recherche partielle de texte, conditions calculées, combinaisons complexes de ET/OU imbriqués.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "copilot" && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-bp-red-600">
                Copilot dans Excel
              </h2>
              <p className="text-gray-600 mb-6">
                Copilot est l'assistant IA intégré à Excel (Microsoft 365 Copilot). Il comprend le contexte de votre feuille et peut générer des formules, résumer des données, créer des visualisations ou expliquer une formule existante — en langage naturel.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm">
                    <span className="font-bold">Prérequis :</span> licence <strong>Microsoft 365 Copilot</strong> active, et des données organisées en <strong>Tableau Excel structuré</strong> (<code className="bg-white px-1 rounded text-xs">Ctrl+T</code>) — Copilot s'appuie sur les tableaux nommés, pas sur des plages de cellules brutes.
                  </p>
                </div>
              </div>

              {/* Ce que Copilot sait bien faire */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Sparkles className="text-bp-red-500" size={20} />
                  Ce que Copilot sait bien faire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">🧮</div>
                    <h4 className="font-bold text-blue-800 mb-1">Générer des formules</h4>
                    <p className="text-sm text-gray-600">Décrivez le calcul voulu en langage naturel ; Copilot propose une formule (à toujours vérifier).</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-bold text-green-800 mb-1">Résumer et analyser</h4>
                    <p className="text-sm text-gray-600">Identifier tendances, valeurs aberrantes ou grandes lignes d'un tableau sans construire de TCD manuellement.</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-bold text-purple-800 mb-1">Créer des visualisations</h4>
                    <p className="text-sm text-gray-600">Générer un graphique ou une mise en forme conditionnelle adaptée sur simple demande.</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">💡</div>
                    <h4 className="font-bold text-orange-800 mb-1">Expliquer une formule</h4>
                    <p className="text-sm text-gray-600">"Explique-moi cette formule" décompose une formule complexe existante étape par étape.</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">🔍</div>
                    <h4 className="font-bold text-red-800 mb-1">Détecter des anomalies</h4>
                    <p className="text-sm text-gray-600">Repérer doublons, valeurs manquantes ou incohérences dans un tableau volumineux.</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">✍️</div>
                    <h4 className="font-bold text-gray-700 mb-1">Démarrer plus vite</h4>
                    <p className="text-sm text-gray-600">Dégrossir une analyse ou un premier jet de mise en forme, à affiner ensuite manuellement.</p>
                  </div>
                </div>
              </div>

              {/* Bonnes pratiques */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Bonnes pratiques d'utilisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">À faire</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Convertir vos données en <strong>Tableau Excel</strong> avant de solliciter Copilot</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Nommer précisément les colonnes dans votre demande (elles doivent correspondre aux en-têtes réels)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Toujours vérifier</strong> la formule ou le résultat généré sur un cas connu avant de l'utiliser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Décomposer une demande complexe en plusieurs prompts successifs plutôt qu'un seul prompt géant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">Utiliser Copilot pour démarrer, puis affiner avec les fonctions dynamiques maîtrisées manuellement</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-800 mb-2">À éviter</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Faire confiance aveuglément à une formule générée sans la tester</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Soumettre des données confidentielles ou client sans vérifier la politique de confidentialité de l'organisation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">Interroger Copilot sur des plages non structurées, cellules fusionnées ou en-têtes irréguliers — il perd le contexte</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-1 flex-shrink-0">✗</span>
                        <span className="text-sm">L'utiliser comme substitut à la compréhension des fonctions de base : il faut savoir relire et corriger ce qu'il génère</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prompts efficaces vs vagues */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-bp-red-500 flex items-center gap-2">
                  <Check className="text-bp-red-500" size={20} />
                  Formuler une bonne demande
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="border border-red-200 p-3 text-left">Prompt vague</th>
                        <th className="border border-red-200 p-3 text-left">Prompt efficace</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3 text-sm text-gray-500 italic">"Analyse mes données"</td>
                        <td className="border border-gray-200 p-3 text-sm">"Résume les 3 principales tendances de CA par région dans le tableau Ventes2026, et signale les régions en baisse"</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 p-3 text-sm text-gray-500 italic">"Fais-moi une formule"</td>
                        <td className="border border-gray-200 p-3 text-sm">"Dans la colonne Statut du tableau Commandes, ajoute une formule qui affiche 'Retard' si DateLivraison {'>'} DateLimite, sinon 'OK'"</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3 text-sm text-gray-500 italic">"Fais un graphique"</td>
                        <td className="border border-gray-200 p-3 text-sm">"Crée un graphique en barres du CA total par trimestre à partir du tableau Ventes2026, trié par ordre chronologique"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm">
                    <span className="font-bold">Limites actuelles :</span> Copilot ne voit que les données chargées dans le classeur ouvert (pas de connexion à des sources externes non importées), reste peu fiable pour générer des macros VBA complexes, et ses réponses doivent systématiquement être vérifiées avant diffusion — comme pour toute IA générative.
                  </p>
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