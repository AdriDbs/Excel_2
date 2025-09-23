import React, { useState, useEffect } from "react";
import { ExtendedNavigationProps, HackathonViewType } from "../types";
import { Student } from "../../../types/database";
import { useProgressManager } from "../../../hooks/useProgressManager";
import HackathonLanding from "./HackathonLanding";
import WorkInProgressSection from "../WorkInProgress/WorkInProgressSection";
import ScoreboardApp from "./Scoreboard/ScoreboardApp";
import StudentInterface from "./StudentView/StudentInterface";
import { HackathonProvider, useHackathon } from "./context/HackathonContext";

// Interface pour les props du conteneur Hackathon
interface HackathonContainerProps extends ExtendedNavigationProps {
  // Props spécifiques au Hackathon peuvent être ajoutées ici
}

// Composant interne avec accès au contexte
const HackathonContent: React.FC<HackathonContainerProps> = ({
  navigateTo,
  currentUser,
  onProgressUpdate,
}) => {
  const [currentView, setCurrentView] = useState<HackathonViewType>("landing");
  const { setRegisteredStudent } = useHackathon();

  // Hook de progression pour les étudiants
  const progressManager =
    currentUser?.role === "student"
      ? useProgressManager({ userId: currentUser.id })
      : null;

  // Enregistrer l'étudiant dans le contexte Hackathon
  useEffect(() => {
    if (currentUser?.role === "student") {
      // Convertir l'utilisateur en Student pour le hackathon
      const hackathonStudent = {
        id: currentUser.id,
        name: currentUser.name,
        teamId: 0, // Sera défini lors de l'inscription à une équipe
        answers: {},
        hintsUsed: [],
      };
      setRegisteredStudent(hackathonStudent);
    }
  }, [currentUser, setRegisteredStudent]);

  // Fonction pour gérer la completion d'un niveau
  const handleLevelComplete = async (
    level: number,
    score: number,
    timeSpent: number
  ) => {
    if (!progressManager || !currentUser || currentUser.role !== "student") {
      return;
    }

    const currentProgress = progressManager.hackathonProgress;

    const success = await progressManager.updateHackathonProgress({
      currentLevel: Math.max(level + 1, currentProgress.currentLevel),
      levelsCompleted: Array.from(new Set([...currentProgress.levelsCompleted, level])),
      totalScore: currentProgress.totalScore + score,
      individualContributions: {
        ...currentProgress.individualContributions,
        [level]: {
          score,
          timeSpent,
          completedAt: new Date().toISOString(),
        },
      },
    });

    if (success && onProgressUpdate) {
      onProgressUpdate("hackathon", progressManager.hackathonProgress);
    }
  };

  // Fonction pour naviguer vers différentes vues du hackathon
  const navigateToView = (view: HackathonViewType) => {
    setCurrentView(view);
  };

  // Fonction pour revenir au menu principal
  const goBackToMenu = () => {
    navigateTo("menu");
  };

  // Fonction pour revenir au landing du hackathon
  const goBackToLanding = () => {
    setCurrentView("landing");
  };

  // Rendu conditionnel selon la vue actuelle
  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return (
          <HackathonLanding
            navigateTo={navigateTo}
            setHackathonView={navigateToView}
            goBackToMenu={goBackToMenu}
            currentUser={currentUser}
          />
        );

      case "student":
        return (
          <StudentInterface
            navigateTo={navigateToView}
            goBackToLanding={goBackToLanding}
            currentUser={currentUser}
            onLevelComplete={handleLevelComplete}
          />
        );

      case "scoreboard":
        return (
          <ScoreboardApp
            navigateTo={navigateToView}
            goBackToLanding={goBackToLanding}
          />
        );

      case "workInProgress":
      default:
        return (
          <WorkInProgressSection
            navigateTo={goBackToLanding}
            title="Hackathon Excel"
            message="Cette fonctionnalité est en cours de développement."
          />
        );
    }
  };

  return <div className="hackathon-container">{renderCurrentView()}</div>;
};

// Composant principal avec Provider
const HackathonContainer: React.FC<HackathonContainerProps> = (props) => {
  return (
    <HackathonProvider>
      <HackathonContent {...props} />
    </HackathonProvider>
  );
};

export default HackathonContainer;

