import React, { useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Code,
  FileText,
  Settings,
  User,
  LogOut,
  Trophy,
  Target,
} from "lucide-react";
import { NavigationProps } from "../types";
import { Student, Instructor } from "../../../types/database";
import InstructorDashboard from "../InstructorDashboard";

// Interface pour les props étendues du menu principal
interface MainMenuProps extends NavigationProps {
  currentUser?: Student | Instructor;
  onLogout?: () => void;
}

// Composant pour le menu principal
const MainMenu = ({ navigateTo, currentUser, onLogout }: MainMenuProps) => {
  const [showInstructorDashboard, setShowInstructorDashboard] = useState(false);

  const getWelcomeMessage = () => {
    if (!currentUser) return "Bienvenue dans la formation Excel BearingPoint";

    if (currentUser.role === "instructor") {
      return `Bienvenue, ${currentUser.name}`;
    } else {
      const student = currentUser as Student;
      const speedDatingCompleted = Object.values(
        student.speedDatingProgress
      ).filter((p) => p.completed).length;
      return `Bienvenue, ${student.name} - ${speedDatingCompleted} fonctions maîtrisées`;
    }
  };

  const getProgressStats = () => {
    if (!currentUser || currentUser.role !== "student") return null;

    const student = currentUser as Student;
    const speedDatingProgress = Object.values(student.speedDatingProgress);
    const completed = speedDatingProgress.filter((p) => p.completed).length;
    const totalScore = speedDatingProgress.reduce((sum, p) => sum + p.score, 0);

    return {
      speedDatingCompleted: completed,
      totalScore: totalScore + student.hackathonProgress.totalScore,
      hackathonLevel: student.hackathonProgress.currentLevel,
    };
  };

  const progressStats = getProgressStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec informations utilisateur */}
        <div className="flex justify-between items-start mb-8 pt-8">
          <header className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              Formation Excel Avancé{" "}
              <span className="text-yellow-400">BearingPoint</span>
            </h1>
            <p className="text-xl text-blue-200 mb-4">{getWelcomeMessage()}</p>

            {/* Statistiques de progression pour les étudiants */}
            {progressStats && (
              <div className="flex gap-4 mb-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={20} />
                  <span className="text-sm">
                    Score total: <strong>{progressStats.totalScore}</strong>
                  </span>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Target className="text-green-400" size={20} />
                  <span className="text-sm">
                    Fonctions:{" "}
                    <strong>{progressStats.speedDatingCompleted}</strong>
                  </span>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Code className="text-purple-400" size={20} />
                  <span className="text-sm">
                    Hackathon:{" "}
                    <strong>Niveau {progressStats.hackathonLevel}</strong>
                  </span>
                </div>
              </div>
            )}
          </header>

          {/* Zone utilisateur */}
          {currentUser && (
            <div className="flex items-center gap-4">
              {/* Bouton réglages pour les instructeurs */}
              {currentUser.role === "instructor" && (
                <button
                  onClick={() => setShowInstructorDashboard(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
                >
                  <Settings size={20} />
                  Réglages
                </button>
              )}

              {/* Informations utilisateur */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <User className="text-blue-200" size={20} />
                <div className="text-right">
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-blue-200">
                    {currentUser.role === "instructor"
                      ? "Instructeur"
                      : "Étudiant"}
                  </p>
                </div>
              </div>

              {/* Bouton déconnexion */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-300 hover:shadow-md"
                  title="Se déconnecter"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Objectifs de formation */}
        <div className="max-w-3xl mx-auto bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">
            Objectifs de la formation
          </h2>
          <p className="text-white mb-4">
            Cette formation intensive vise à transformer votre maîtrise d'Excel
            en un véritable avantage concurrentiel. À l'issue de ce parcours,
            vous serez capable de :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-2">
              <div className="text-green-400 mt-1">✓</div>
              <p>
                Exploiter les formules dynamiques pour automatiser vos analyses
                complexes et réduire votre temps de traitement par 10
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-green-400 mt-1">✓</div>
              <p>
                Manipuler des millions de lignes avec fluidité grâce aux
                nouvelles fonctions de tableaux dynamiques
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-green-400 mt-1">✓</div>
              <p>
                Créer des dashboards interactifs impressionnants qui
                transforment vos données en insights actionnables
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-green-400 mt-1">✓</div>
              <p>
                Résoudre des cas d'usage complexes BearingPoint dans un
                environnement de hackathon stimulant
              </p>
            </div>
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {/* Speed Dating Excel */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-20 transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full mr-4">
                <Code size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Speed Dating <span className="text-yellow-400">Excel</span>
                </h3>
                <p className="text-blue-200">
                  Découvrez 12 fonctions Excel avancées en format rapide et
                  interactif
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>XLOOKUP • FILTER • UNIQUE • SEQUENCE • SORT • LET</span>
                <span className="text-yellow-300">⚡ 3 min / fonction</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: progressStats
                      ? `${(progressStats.speedDatingCompleted / 12) * 100}%`
                      : "0%",
                  }}
                ></div>
              </div>
              {progressStats && (
                <p className="text-xs text-blue-200 mt-1">
                  {progressStats.speedDatingCompleted}/12 fonctions complétées
                </p>
              )}
            </div>
            <button
              onClick={() => navigateTo("functions")}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Commencer le Speed Dating
            </button>
          </div>

          {/* Hackathon */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-20 transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
                <CheckSquare size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Hackathon:{" "}
                  <span className="text-yellow-400">Le Dossier Perdu</span>
                </h3>
                <p className="text-purple-200">
                  Résolvez un cas d'usage complexe BearingPoint en équipe (2h)
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>7 niveaux • Analyse de données • Dashboard final</span>
                <span className="text-yellow-300">🏆 2000 pts max</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: progressStats
                      ? `${(progressStats.hackathonLevel / 7) * 100}%`
                      : "0%",
                  }}
                ></div>
              </div>
              {progressStats && (
                <p className="text-xs text-purple-200 mt-1">
                  Niveau {progressStats.hackathonLevel}/7 atteint
                </p>
              )}
            </div>
            <button
              onClick={() => navigateTo("hackathonLanding")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Rejoindre le Hackathon
            </button>
          </div>

          {/* Cas d'usage BearingPoint */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-20 transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full mr-4">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Cas d'Usage{" "}
                  <span className="text-yellow-400">BearingPoint</span>
                </h3>
                <p className="text-emerald-200">
                  Explorez 5 cas d'usage métier issus de missions réelles
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="space-y-1 text-sm text-emerald-200">
                <p>• Optimisation de portefeuille clients</p>
                <p>• Allocation stratégique des ressources</p>
                <p>• Détection d'anomalies financières</p>
                <p>• Analyse prédictive de churn</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo("useCases")}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Explorer les Cas d'Usage
            </button>
          </div>

          {/* Bonnes Pratiques */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 hover:bg-opacity-20 transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full mr-4">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Bonnes <span className="text-yellow-400">Pratiques</span>
                </h3>
                <p className="text-orange-200">
                  Maîtrisez l'art de créer des fichiers Excel professionnels
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="space-y-1 text-sm text-orange-200">
                <p>• Organisation et structure des fichiers</p>
                <p>• Optimisation des performances</p>
                <p>• Standards de mise en forme</p>
                <p>• Techniques de validation</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo("bestPractices")}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Découvrir les Bonnes Pratiques
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-blue-300 text-sm">
          <p>
            © 2024 BearingPoint - Formation Excel Avancé - Version interactive
          </p>
          {currentUser && (
            <p className="mt-2 text-xs">
              Connecté en tant que{" "}
              {currentUser.role === "instructor" ? "Instructeur" : "Étudiant"} •
              Dernière activité:{" "}
              {new Date(currentUser.lastActivity).toLocaleString("fr-FR")}
            </p>
          )}
        </footer>
      </div>

      {/* Dashboard Instructeur */}
      {showInstructorDashboard &&
        currentUser &&
        currentUser.role === "instructor" && (
          <InstructorDashboard
            currentUser={currentUser as Instructor}
            onClose={() => setShowInstructorDashboard(false)}
          />
        )}
    </div>
  );
};

export default MainMenu;
