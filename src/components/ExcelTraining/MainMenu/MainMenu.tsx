import React, { useState, useMemo, useCallback } from "react";
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
import { BRAND } from "../../../constants/brand";

interface MainMenuProps extends NavigationProps {
  currentUser?: Student | Instructor;
  onLogout?: () => void;
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  highlight: string;
  description: string;
  descriptionColor: string;
  content: React.ReactNode;
  progress?: {
    current: number;
    total: number;
    label: string;
  };
  buttonText: string;
  buttonGradient: string;
  progressGradient: string;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  icon,
  title,
  highlight,
  description,
  descriptionColor,
  content,
  progress,
  buttonText,
  buttonGradient,
  progressGradient,
  onClick,
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:shadow-bp-lg transform hover:scale-[1.02] border border-white/20">
    <div className="flex items-center mb-6">
      <div className={`${buttonGradient} p-3 rounded-full mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">
          {title} <span className="text-bp-red-400">{highlight}</span>
        </h3>
        <p className={descriptionColor}>{description}</p>
      </div>
    </div>
    <div className="mb-6">
      {content}
      {progress && (
        <>
          <div className="w-full bg-bp-gray-500/50 rounded-full h-2 mt-2">
            <div
              className={`${progressGradient} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className={`text-xs ${descriptionColor} mt-1`}>{progress.label}</p>
        </>
      )}
    </div>
    <button
      onClick={onClick}
      className={`w-full ${buttonGradient} text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-bp hover:brightness-110`}
    >
      {buttonText}
    </button>
  </div>
);

const MainMenu: React.FC<MainMenuProps> = ({ navigateTo, currentUser, onLogout }) => {
  const [showInstructorDashboard, setShowInstructorDashboard] = useState(false);

  const welcomeMessage = useMemo(() => {
    if (!currentUser) return "Bienvenue dans la formation Excel BearingPoint";

    if (currentUser.role === "instructor") {
      return `Bienvenue, ${currentUser.name}`;
    }

    const student = currentUser as Student;
    const speedDatingCompleted = Object.values(student.speedDatingProgress).filter(
      (p) => p.completed
    ).length;
    return `Bienvenue, ${student.name} - ${speedDatingCompleted} fonctions maîtrisées`;
  }, [currentUser]);

  const progressStats = useMemo(() => {
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
  }, [currentUser]);

  const handleNavigate = useCallback((section: string) => {
    navigateTo(section as any);
  }, [navigateTo]);

  const menuCards = useMemo(() => [
    {
      key: "speedDating",
      icon: <Code size={32} />,
      title: "Speed Dating",
      highlight: "Excel",
      description: "Découvrez 12 fonctions Excel avancées en format rapide et interactif",
      descriptionColor: "text-bp-red-200",
      content: (
        <div className="flex items-center justify-between text-sm mb-2">
          <span>XLOOKUP • FILTER • UNIQUE • SEQUENCE • SORT • LET</span>
          <span className="text-bp-red-200">⚡ 3 min / fonction</span>
        </div>
      ),
      progress: progressStats ? {
        current: progressStats.speedDatingCompleted,
        total: 12,
        label: `${progressStats.speedDatingCompleted}/12 fonctions complétées`,
      } : undefined,
      buttonText: "Commencer le Speed Dating",
      buttonGradient: "bg-gradient-to-r from-bp-red-500 to-bp-red-400",
      progressGradient: "bg-gradient-to-r from-bp-red-500 to-bp-red-400",
      section: "functions",
    },
    {
      key: "hackathon",
      icon: <CheckSquare size={32} />,
      title: "Hackathon:",
      highlight: "Le Dossier Perdu",
      description: "Résolvez un cas d'usage complexe BearingPoint en équipe (2h)",
      descriptionColor: "text-bp-red-100",
      content: (
        <div className="flex items-center justify-between text-sm mb-2">
          <span>7 niveaux • Analyse de données • Dashboard final</span>
          <span className="text-bp-red-200">🏆 2000 pts max</span>
        </div>
      ),
      progress: progressStats ? {
        current: progressStats.hackathonLevel,
        total: 7,
        label: `Niveau ${progressStats.hackathonLevel}/7 atteint`,
      } : undefined,
      buttonText: "Rejoindre le Hackathon",
      buttonGradient: "bg-gradient-to-r from-bp-red-600 to-bp-red-500",
      progressGradient: "bg-gradient-to-r from-bp-red-600 to-bp-red-500",
      section: "hackathonLanding",
    },
    {
      key: "useCases",
      icon: <FileText size={32} />,
      title: "Cas d'Usage",
      highlight: "BearingPoint",
      description: "Explorez 5 cas d'usage métier issus de missions réelles",
      descriptionColor: "text-bp-gray-200",
      content: (
        <div className="space-y-1 text-sm text-bp-gray-200">
          <p>• Optimisation de portefeuille clients</p>
          <p>• Allocation stratégique des ressources</p>
          <p>• Détection d'anomalies financières</p>
          <p>• Analyse prédictive de churn</p>
        </div>
      ),
      buttonText: "Explorer les Cas d'Usage",
      buttonGradient: "bg-gradient-to-r from-bp-gray-500 to-bp-gray-400",
      progressGradient: "bg-gradient-to-r from-bp-gray-500 to-bp-gray-400",
      section: "useCases",
    },
    {
      key: "bestPractices",
      icon: <BookOpen size={32} />,
      title: "Bonnes",
      highlight: "Pratiques",
      description: "Maîtrisez l'art de créer des fichiers Excel professionnels",
      descriptionColor: "text-bp-red-300",
      content: (
        <div className="space-y-1 text-sm text-bp-red-300">
          <p>• Organisation et structure des fichiers</p>
          <p>• Optimisation des performances</p>
          <p>• Standards de mise en forme</p>
          <p>• Techniques de validation</p>
        </div>
      ),
      buttonText: "Découvrir les Bonnes Pratiques",
      buttonGradient: "bg-gradient-to-r from-bp-red-400 to-bp-red-300",
      progressGradient: "bg-gradient-to-r from-bp-red-400 to-bp-red-300",
      section: "bestPractices",
    },
  ], [progressStats]);

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec informations utilisateur */}
        <div className="flex justify-between items-start mb-8 pt-8">
          <header className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={BRAND.logos.full}
                alt={BRAND.name}
                className="h-8"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h1 className="text-4xl font-bold">
                Formation Excel Avancé
              </h1>
            </div>
            <p className="text-xl text-bp-red-100 mb-4">{welcomeMessage}</p>

            {/* Statistiques de progression pour les étudiants */}
            {progressStats && (
              <div className="flex gap-4 mb-4 flex-wrap">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Trophy className="text-bp-red-400" size={20} />
                  <span className="text-sm">
                    Score total: <strong>{progressStats.totalScore}</strong>
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Target className="text-bp-red-200" size={20} />
                  <span className="text-sm">
                    Fonctions: <strong>{progressStats.speedDatingCompleted}</strong>
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Code className="text-bp-red-300" size={20} />
                  <span className="text-sm">
                    Hackathon: <strong>Niveau {progressStats.hackathonLevel}</strong>
                  </span>
                </div>
              </div>
            )}
          </header>

          {/* Zone utilisateur */}
          {currentUser && (
            <div className="flex items-center gap-4">
              {currentUser.role === "instructor" && (
                <button
                  onClick={() => setShowInstructorDashboard(true)}
                  className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-bp"
                >
                  <Settings size={20} />
                  Réglages
                </button>
              )}

              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <User className="text-bp-red-200" size={20} />
                <div className="text-right">
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-bp-red-100">
                    {currentUser.role === "instructor" ? "Instructeur" : "Étudiant"}
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-bp-red-400 hover:bg-bp-red-500 text-white p-2 rounded-full transition-all duration-300 hover:shadow-bp"
                  title="Se déconnecter"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Objectifs de formation */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4 text-bp-red-400">
            Objectifs de la formation
          </h2>
          <p className="text-white mb-4">
            Cette formation intensive vise à transformer votre maîtrise d'Excel
            en un véritable avantage concurrentiel. À l'issue de ce parcours,
            vous serez capable de :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              "Exploiter les formules dynamiques pour automatiser vos analyses complexes et réduire votre temps de traitement par 10",
              "Manipuler des millions de lignes avec fluidité grâce aux nouvelles fonctions de tableaux dynamiques",
              "Créer des dashboards interactifs impressionnants qui transforment vos données en insights actionnables",
              "Résoudre des cas d'usage complexes BearingPoint dans un environnement de hackathon stimulant",
            ].map((objective, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="text-bp-red-400 mt-1">✓</div>
                <p>{objective}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {menuCards.map((card) => (
            <MenuCard
              key={card.key}
              icon={card.icon}
              title={card.title}
              highlight={card.highlight}
              description={card.description}
              descriptionColor={card.descriptionColor}
              content={card.content}
              progress={card.progress}
              buttonText={card.buttonText}
              buttonGradient={card.buttonGradient}
              progressGradient={card.progressGradient}
              onClick={() => handleNavigate(card.section)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-bp-red-200 text-sm">
          <p>© 2024 BearingPoint - Formation Excel Avancé - Version interactive</p>
          {currentUser && (
            <p className="mt-2 text-xs">
              Connecté en tant que {currentUser.role === "instructor" ? "Instructeur" : "Étudiant"} •
              Dernière activité: {new Date(currentUser.lastActivity).toLocaleString("fr-FR")}
            </p>
          )}
        </footer>
      </div>

      {/* Dashboard Instructeur */}
      {showInstructorDashboard && currentUser?.role === "instructor" && (
        <InstructorDashboard
          currentUser={currentUser as Instructor}
          onClose={() => setShowInstructorDashboard(false)}
        />
      )}
    </div>
  );
};

export default MainMenu;
