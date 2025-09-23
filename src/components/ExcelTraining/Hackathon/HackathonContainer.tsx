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
      levelsCompleted: [
        ...new Set([...currentProgress.levelsCompleted, level]),
      ],
      totalScore: currentProgress.totalScore + score,
      individualContributions: {
        ...currentProgress.individualContributions,
        [level]: {
          score: score,
          timeSpent: timeSpent,
          completedAt: new Date().toISOString(),
        },
      },
    });

    if (success && onProgressUpdate) {
      onProgressUpdate("hackathon", progressManager.hackathonProgress);
    }
  };

  // Fonction pour définir la vue courante du hackathon
  const setHackathonView = (view: string) => {
    if (view === "student" || view === "global") {
      setCurrentView(view as HackathonViewType);
    } else {
      setCurrentView("landing");
    }
  };

  // Fonction pour revenir à la landing page
  const goBackToLanding = () => {
    setCurrentView("landing");
  };

  // Écouter les événements de fin de session pour revenir à la landing page
  useEffect(() => {
    const handleSessionEnd = () => {
      if (currentView !== "landing") {
        setCurrentView("landing");
      }
    };

    window.addEventListener("hackathon_session_ended", handleSessionEnd);

    return () => {
      window.removeEventListener("hackathon_session_ended", handleSessionEnd);
    };
  }, [currentView]);

  // Contenu à afficher selon la vue actuelle
  const renderContent = () => {
    if (currentView === "landing") {
      return (
        <HackathonLanding
          navigateTo={navigateTo}
          setHackathonView={setHackathonView}
          currentUser={currentUser}
        />
      );
    } else if (currentView === "student") {
      return (
        <StudentInterface
          navigateTo={navigateTo}
          goBackToLanding={goBackToLanding}
          currentUser={currentUser}
          onLevelComplete={handleLevelComplete}
        />
      );
    } else if (currentView === "global") {
      return (
        <ScoreboardApp
          navigateTo={navigateTo}
          goBackToLanding={goBackToLanding}
          currentUser={currentUser}
        />
      );
    }

    // Fallback vers la landing page
    return (
      <HackathonLanding
        navigateTo={navigateTo}
        setHackathonView={setHackathonView}
        currentUser={currentUser}
      />
    );
  };

  return renderContent();
};

// Composant principal qui encapsule tout dans le provider
const HackathonContainer: React.FC<HackathonContainerProps> = (props) => {
  return (
    <HackathonProvider>
      <HackathonContent {...props} />
    </HackathonProvider>
  );
};

export default HackathonContainer;
