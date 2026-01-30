import React, { useState, useEffect } from "react";
import { SectionType } from "./types";
import { Student, Instructor } from "../../types/database";
import { databaseService } from "../../services/databaseService";

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
  const [currentUser, setCurrentUser] = useState<Student | Instructor | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur connecté dans le localStorage
    const checkExistingUser = () => {
      try {
        const storedUserId = localStorage.getItem(
          "bearingpoint_current_user_id"
        );
        if (storedUserId) {
          const user = databaseService.getUserById(storedUserId);
          if (user) {
            setCurrentUser(user);
            databaseService.updateLastActivity(user.id);
          } else {
            // L'utilisateur n'existe plus dans la base de données
            localStorage.removeItem("bearingpoint_current_user_id");
          }
        }
      } catch (error) {
        console.error("Error checking existing user:", error);
        localStorage.removeItem("bearingpoint_current_user_id");
      }
      setIsInitialized(true);
    };

    checkExistingUser();
  }, []);

  const navigateTo = (section: SectionType) => {
    setCurrentSection(section);

    // Mettre à jour l'activité de l'utilisateur
    if (currentUser) {
      databaseService.updateLastActivity(currentUser.id);
    }
  };

  const handleUserSelected = (user: Student | Instructor) => {
    setCurrentUser(user);
    localStorage.setItem("bearingpoint_current_user_id", user.id);
    setCurrentSection("menu");
  };

  const handleViewAsGuest = () => {
    setCurrentUser(null);
    localStorage.removeItem("bearingpoint_current_user_id");
    setCurrentSection("menu");
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      setCurrentUser(null);
      localStorage.removeItem("bearingpoint_current_user_id");
      setCurrentSection("menu");
    }
  };

  const handleProgressUpdate = (
    progressType: "speedDating" | "hackathon",
    progress: any
  ) => {
    if (currentUser && currentUser.role === "student") {
      const success = databaseService.updateUserProgress(
        currentUser.id,
        progressType,
        progress
      );
      if (success) {
        // Rafraîchir les données de l'utilisateur
        const updatedUser = databaseService.getUserById(currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      }
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
