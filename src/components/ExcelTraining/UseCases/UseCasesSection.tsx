import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
  Database,
  BarChart2,
} from "lucide-react";
import { NavigationProps } from "../types";
import UseCaseCard from "./UseCaseCard";
import { useCasesData } from "./useCasesData";
import { UseCase } from "./types";

const UseCasesSection = ({ navigateTo }: NavigationProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  // Extraire toutes les catégories uniques
  const allCategories = Array.from(
    new Set(useCasesData.map((useCase) => useCase.category))
  );

  // Extraire toutes les fonctions uniques
  const allFunctions = Array.from(
    new Set(
      useCasesData.flatMap((useCase) =>
        useCase.functions.map((func) => func.name)
      )
    )
  ).sort();

  // Fonction de recherche améliorée qui vérifie dans tous les champs pertinents
  const searchInUseCase = (useCase: UseCase, term: string): boolean => {
    const lowerTerm = term.toLowerCase();

    // Recherche dans les champs principaux
    if (
      useCase.title.toLowerCase().includes(lowerTerm) ||
      useCase.description.toLowerCase().includes(lowerTerm) ||
      useCase.category.toLowerCase().includes(lowerTerm) ||
      useCase.implementation.toLowerCase().includes(lowerTerm) ||
      useCase.example.toLowerCase().includes(lowerTerm) ||
      useCase.exampleSource.toLowerCase().includes(lowerTerm)
    ) {
      return true;
    }

    // Recherche dans les bénéfices
    if (
      useCase.benefits.some((benefit) =>
        benefit.toLowerCase().includes(lowerTerm)
      )
    ) {
      return true;
    }

    // Recherche dans les fonctions (nom, description et exemple)
    if (
      useCase.functions.some(
        (func) =>
          func.name.toLowerCase().includes(lowerTerm) ||
          func.description.toLowerCase().includes(lowerTerm) ||
          (func.example && func.example.toLowerCase().includes(lowerTerm))
      )
    ) {
      return true;
    }

    // Si aucune correspondance n'est trouvée
    return false;
  };

  // Filtrer les cas d'utilisation selon les critères
  const filteredUseCases = useCasesData.filter((useCase) => {
    const matchesSearch =
      searchTerm === "" || searchInUseCase(useCase, searchTerm);

    const matchesCategory =
      selectedCategory === null || useCase.category === selectedCategory;

    const matchesFunction =
      selectedFunction === null ||
      useCase.functions.some((func) => func.name === selectedFunction);

    return matchesSearch && matchesCategory && matchesFunction;
  });

  // Function to get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Conseil en Stratégie":
      case "Stratégie & Transformation":
        return <TrendingUp size={18} className="text-bp-red-400" />;
      case "Conseil en Management":
        return <BarChart2 size={18} className="text-bp-red-400" />;
      case "Conseil en Transformation":
        return <Database size={18} className="text-bp-red-400" />;
      case "Conseil IT":
        return <FileText size={18} className="text-bp-red-400" />;
      default:
        return <FileText size={18} className="text-bp-red-400" />;
    }
  };

  // Vérifier si un terme de recherche met en évidence un cas d'usage spécifique
  const getSearchMatchInfo = (useCase: UseCase): string | null => {
    if (!searchTerm) return null;

    const lowerTerm = searchTerm.toLowerCase();
    const matchTypes: string[] = [];

    if (useCase.title.toLowerCase().includes(lowerTerm)) {
      matchTypes.push("titre");
    }
    if (useCase.description.toLowerCase().includes(lowerTerm)) {
      matchTypes.push("description");
    }
    if (useCase.implementation.toLowerCase().includes(lowerTerm)) {
      matchTypes.push("implémentation");
    }
    if (
      useCase.benefits.some((benefit) =>
        benefit.toLowerCase().includes(lowerTerm)
      )
    ) {
      matchTypes.push("bénéfice");
    }
    if (
      useCase.functions.some((func) =>
        func.name.toLowerCase().includes(lowerTerm)
      )
    ) {
      matchTypes.push("nom de fonction");
    }
    if (
      useCase.functions.some((func) =>
        func.description.toLowerCase().includes(lowerTerm)
      )
    ) {
      matchTypes.push("description de fonction");
    }
    if (useCase.example.toLowerCase().includes(lowerTerm)) {
      matchTypes.push("exemple");
    }

    return matchTypes.length > 0 ? matchTypes.join(", ") : null;
  };

  return (
    <div className="min-h-screen bg-bp-red-700 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo("menu")}
          className="mb-8 bg-bp-red-500 hover:bg-bp-red-400 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">
            Fiches Mémo <span className="text-bp-red-400">Cas d'Usage</span>
          </h1>
          <p className="text-xl text-bp-red-200/80 max-w-3xl mx-auto">
            Des exemples concrets d'utilisation des fonctions Excel avancées
            dans des contextes professionnels de conseil
          </p>
        </div>

        {/* Search and filters */}
        <div className="bg-bp-red-600/80 backdrop-filter backdrop-blur-sm rounded-xl p-6 mb-8 border border-bp-red-600/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-bp-red-400" />
              </div>
              <input
                type="text"
                className="bg-gray-700/80 border border-bp-red-500/70 text-bp-red-100 placeholder-bp-red-200/60 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Rechercher partout dans les cas d'usage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-bp-red-400 hover:text-bp-red-200 p-1"
                    title="Effacer la recherche"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Category filter */}
            <div>
              <select
                className="bg-gray-700/80 border border-bp-red-500/70 text-bp-red-100 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={selectedCategory || ""}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value === "" ? null : e.target.value
                  )
                }
              >
                <option value="">Tous les domaines</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Function filter */}
            <div>
              <select
                className="bg-gray-700/80 border border-bp-red-500/70 text-bp-red-100 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={selectedFunction || ""}
                onChange={(e) =>
                  setSelectedFunction(
                    e.target.value === "" ? null : e.target.value
                  )
                }
              >
                <option value="">Toutes les fonctions</option>
                {allFunctions.map((func) => (
                  <option key={func} value={func}>
                    {func}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter information */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="text-bp-red-400 flex items-center">
              <Filter size={16} className="mr-1" />
              <span>Filtres actifs:</span>
            </div>

            {selectedCategory || selectedFunction || searchTerm ? (
              <>
                {selectedCategory && (
                  <span className="bg-yellow-900/70 text-bp-red-200 px-3 py-1 rounded-full text-sm flex items-center">
                    {getCategoryIcon(selectedCategory)}
                    <span className="ml-1">{selectedCategory}</span>
                  </span>
                )}

                {selectedFunction && (
                  <span className="bg-yellow-900/70 text-bp-red-200 px-3 py-1 rounded-full text-sm">
                    {selectedFunction}
                  </span>
                )}

                {searchTerm && (
                  <span className="bg-yellow-900/70 text-bp-red-200 px-3 py-1 rounded-full text-sm flex items-center">
                    <Search size={14} className="mr-1" />
                    {searchTerm}
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    setSelectedFunction(null);
                  }}
                  className="bg-bp-red-500 hover:bg-bp-red-400 text-bp-red-200 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Réinitialiser
                </button>
              </>
            ) : (
              <span className="text-bp-red-200/70 text-sm">Aucun</span>
            )}

            <div className="ml-auto text-bp-red-200/70 text-sm">
              {filteredUseCases.length} résultat
              {filteredUseCases.length !== 1 ? "s" : ""}
              {searchTerm && filteredUseCases.length > 0 && (
                <span className="ml-1">
                  pour "<span className="text-bp-red-200">{searchTerm}</span>"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((useCase) => {
            const matchInfo = getSearchMatchInfo(useCase);
            return (
              <div key={useCase.id} className="flex flex-col">
                {searchTerm && matchInfo && (
                  <div className="bg-yellow-900/40 rounded-t-lg px-3 py-1 text-xs text-bp-red-200/80 border-t border-l border-r border-bp-red-500/40">
                    Correspondance trouvée dans: {matchInfo}
                  </div>
                )}
                <div
                  className={`flex-1 ${
                    searchTerm && matchInfo ? "rounded-t-none" : ""
                  }`}
                >
                  <UseCaseCard useCase={useCase} />
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredUseCases.length === 0 && (
          <div className="bg-bp-red-600/80 backdrop-filter backdrop-blur-sm rounded-xl p-8 text-center border border-bp-red-600/50">
            <div className="text-bp-red-400 text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h2>
            <p className="text-bp-red-200/70 mb-4">
              Aucun cas d'usage ne correspond à votre recherche "{searchTerm}"
              {selectedCategory && (
                <span> dans la catégorie "{selectedCategory}"</span>
              )}
              {selectedFunction && (
                <span> utilisant la fonction "{selectedFunction}"</span>
              )}
              .
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
                setSelectedFunction(null);
              }}
              className="bg-bp-red-500 hover:bg-bp-red-400 text-bp-red-200 px-4 py-2 rounded-lg text-sm flex items-center mx-auto"
            >
              <RefreshCw size={14} className="mr-2" />
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UseCasesSection;
