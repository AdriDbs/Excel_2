import React, { useState } from "react";
import { SectionType } from "./types";
import { Student, Instructor } from "../../types/database";
import { databaseService } from "../../services/databaseService";
import { useUser } from "../../contexts/UserContext";

// Composants
import WelcomeScreen from "./WelcomeScreen";
import MainMenu from "./MainMenu/MainMenu";
import ExcelSpeedDating from "./SpeedDating/ExcelSpeedDating";
import BestPracticesSection from "./BestPractices/BestPracticesSection";
import UseCasesSection from "./UseCases/UseCasesSection";
import WorkInProgressSection from "./WorkInProgress/WorkInProgressSection";
import HackathonContainer from "./Hackathon/HackathonContainer";

// Composant principal qui gère la navigation entre les sections et l'authentification
const ExcelTraining: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionType>("menu");

  // Utiliser le UserContext pour la gestion des utilisateurs avec Firebase
  const {
    currentUser,
    isInitialized,
    isFirebaseConnected,
    loginUser,
    logoutUser,
    updateUserProgress,
  } = useUser();

  const navigateTo = (section: SectionType) => {
    setCurrentSection(section);

    // Mettre à jour l'activité de l'utilisateur (géré par le contexte)
    if (currentUser) {
      databaseService.updateLastActivity(currentUser.id);
    }
  };

  const handleUserSelected = async (user: Student | Instructor) => {
    await loginUser(user);
    setCurrentSection("menu");
  };

  const handleViewAsGuest = async () => {
    await logoutUser();
    setCurrentSection("menu");
  };

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await logoutUser();
      setCurrentSection("menu");
    }
  };

  const handleProgressUpdate = async (
    progressType: "speedDating" | "hackathon",
    progress: any
  ) => {
    if (currentUser && currentUser.role === "student") {
      await updateUserProgress(progressType, progress);
    }
  };

  // Afficher l'écran de bienvenue si pas d'utilisateur connecté
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bp-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bp-red-400"></div>
      </div>
    );
  }

  // Afficher l'écran de sélection de rôle si pas d'utilisateur
  if (!currentUser) {
    return (
      <WelcomeScreen
        onUserSelected={handleUserSelected}
        onViewAsGuest={handleViewAsGuest}
      />
    );
  }

  // Rendu conditionnel basé sur la section courante
  switch (currentSection) {
    case "menu":
      return (
        <MainMenu
          navigateTo={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );

    case "functions":
      return (
        <ExcelSpeedDating
          navigateTo={navigateTo}
          currentUser={currentUser}
          onProgressUpdate={(progress) =>
            handleProgressUpdate("speedDating", progress)
          }
        />
      );

    case "bestPractices":
      return <BestPracticesSection navigateTo={navigateTo} />;

    case "hackathon":
      return (
        <WorkInProgressSection
          title="Hackathon: Le Dossier Perdu"
          navigateTo={navigateTo}
        />
      );

    case "hackathonLanding":
      return (
        <HackathonContainer
          navigateTo={navigateTo}
          currentUser={currentUser}
          onProgressUpdate={(progress) =>
            handleProgressUpdate("hackathon", progress)
          }
        />
      );

    case "useCases":
      return <UseCasesSection navigateTo={navigateTo} />;

    default:
      return (
        <MainMenu
          navigateTo={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
  }
};

export default ExcelTraining;
