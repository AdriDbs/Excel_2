import React, { useState, useEffect } from "react";
import { ExtendedNavigationProps, HackathonViewType } from "../types";
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
  const { state, loadStudentFromFirebase } = useHackathon();

  const isInstructor = currentUser?.role === "instructor";
  const isStudent = currentUser?.role === "student";

  // Hook de progression pour les étudiants
  const progressManagerInstance = useProgressManager({ userId: currentUser?.id ?? "" });
  const progressManager = isStudent ? progressManagerInstance : null;

  // Charger l'étudiant enregistré depuis Firebase au montage
  useEffect(() => {
    if (isStudent && currentUser && state.sessionId) {
      loadStudentFromFirebase(state.sessionId, currentUser.id);
    }
  }, [isStudent, currentUser?.id, state.sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rediriger automatiquement l'étudiant vers sa vue s'il est déjà enregistré
  useEffect(() => {
    if (isStudent && state.registeredStudent && state.sessionId && currentView === "landing") {
      setCurrentView("student");
    }
  }, [isStudent, state.registeredStudent, state.sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Fonction wrapper pour convertir string vers HackathonViewType avec role guards
  const handleSetHackathonView = (view: string) => {
    // Guard: instructor cannot access student view
    if (isInstructor && view === "student") {
      navigateToView("landing");
      return;
    }
    // Guard: student cannot access global/scoreboard views
    if (isStudent && (view === "global" || view === "scoreboard")) {
      navigateToView("landing");
      return;
    }

    if (view === "student" || view === "global" || view === "landing" || view === "scoreboard") {
      navigateToView(view as HackathonViewType);
    } else {
      navigateToView("landing");
    }
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
            setHackathonView={handleSetHackathonView}
            currentUser={currentUser}
          />
        );

      case "student":
        // Block instructor from accessing student view
        if (isInstructor) {
          return (
            <HackathonLanding
              navigateTo={navigateTo}
              setHackathonView={handleSetHackathonView}
              currentUser={currentUser}
            />
          );
        }
        return (
          <StudentInterface
            navigateTo={navigateTo}
            goBackToLanding={goBackToLanding}
            currentUser={currentUser}
            onLevelComplete={handleLevelComplete}
          />
        );

      case "scoreboard":
      case "global":
        return (
          <ScoreboardApp
            navigateTo={navigateTo}
            goBackToLanding={goBackToLanding}
          />
        );

      default:
        return (
          <WorkInProgressSection
            navigateTo={navigateTo}
            title="Hackathon Excel"
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
