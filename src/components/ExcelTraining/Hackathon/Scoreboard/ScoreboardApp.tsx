import React, { useState, useEffect } from "react";
import {
  Clock,
  Trophy,
  Users,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Settings,
  Zap,
  Target,
  X,
  MessageCircle,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NavigationProps } from "../../types";
import { useHackathon, FinalBonuses, SPEED_BONUS_SCALE, ACCURACY_BONUS_SCALE } from "../context/HackathonContext";
import { hackathonLevels } from "../services/hackathonService";
import SessionControlOverlay from "./SessionControlOverlay";
import InstructorChatPanel from "./InstructorChatPanel";
import LeaderboardAnimation from "./LeaderboardAnimation";
import { useTeamAlerts } from "../hooks/useTeamAlerts";

interface ScoreboardProps extends NavigationProps {
  goBackToLanding: () => void;
}

const ScoreboardApp = ({ goBackToLanding, navigateTo }: ScoreboardProps) => {
  const {
    state,
    setTimeLeftSeconds,
    setIsGlobalView,
    endCurrentSession,
    setNotification,
    formatTime,
    applyFinalBonuses,
    stopTimer,
  } = useHackathon();

  const {
    teams,
    timeLeftSeconds,
    notification,
    sessionId,
    sessionActive,
    isSessionStarted,
    bonusApplied,
    bonusAppliedAt,
  } = state;

  // Alertes en temps réel
  const { alerts, dismissAlert, dismissAllAlerts, soundEnabled, setSoundEnabled } = useTeamAlerts();

  // État pour le classement précédent (pour les animations)
  const [previousRanking, setPreviousRanking] = useState<number[]>([]);
  const [rankChanges, setRankChanges] = useState<{ [key: number]: string }>({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI panels
  const [showControlOverlay, setShowControlOverlay] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusPreview, setBonusPreview] = useState<FinalBonuses | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);

  // Trier les équipes par score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Définir la vue comme globale
  useEffect(() => {
    setIsGlobalView(true);
    return () => { setIsGlobalView(false); };
  }, [setIsGlobalView]);

  // Vérifier les changements de classement et mettre à jour les animations
  useEffect(() => {
    if (previousRanking.length > 0) {
      const currentRanking = sortedTeams.map((team) => team.id);
      const changes: { [key: number]: string } = {};

      currentRanking.forEach((teamId, index) => {
        const prevIndex = previousRanking.indexOf(teamId);
        if (prevIndex !== -1 && prevIndex > index) {
          changes[teamId] = "rank-up";
        }
      });

      if (Object.keys(changes).length > 0) {
        setRankChanges(changes);
        setTimeout(() => setRankChanges({}), 3000);
      }
    }
    setPreviousRanking(sortedTeams.map((team) => team.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedTeams.map((t) => t.score).join("-")]);

  // Vérifier si on est dans les 5 dernières minutes
  useEffect(() => {
    setIsUrgent(timeLeftSeconds <= 5 * 60);
  }, [timeLeftSeconds]);

  // Vérifier si la session est active
  useEffect(() => {
    if (!sessionActive && sessionId) {
      goBackToLanding();
    }
  }, [sessionActive, sessionId, goBackToLanding]);

  // Fonction pour passer à 5 minutes
  const setToFiveMinutes = () => {
    setTimeLeftSeconds(5 * 60);
  };

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNotification("Données rafraîchies", "success");
      setIsRefreshing(false);
    }, 500);
  };

  // Fonction pour terminer la session
  const handleEndSession = async () => {
    if (!sessionId) return;
    if (window.confirm("Êtes-vous sûr de vouloir terminer cette session ? Cette action est irréversible.")) {
      setIsEndingSession(true);
      try {
        const result = await endCurrentSession();
        if (result) goBackToLanding();
      } catch (error) {
        console.error("Error ending session:", error);
        setNotification("Erreur lors de la terminaison de la session", "error");
      } finally {
        setIsEndingSession(false);
      }
    }
  };

  // Prévisualiser les bonus finaux (sans les appliquer)
  const handlePreviewBonuses = () => {
    const totalLevels = 16;
    const finishedTeams = [...teams]
      .filter((t) => (t.completedLevels?.length ?? 0) >= totalLevels && t.completionTime)
      .sort((a, b) => (a.completionTime ?? 0) - (b.completionTime ?? 0));
    const allTeamsByErrors = [...teams].sort((a, b) => (a.errors ?? 0) - (b.errors ?? 0));

    const preview: FinalBonuses = {
      speedBonuses: finishedTeams.map((team, index) => ({
        teamId: team.id,
        teamName: team.name,
        bonus: SPEED_BONUS_SCALE[index] ?? SPEED_BONUS_SCALE[SPEED_BONUS_SCALE.length - 1],
        rank: index + 1,
      })),
      accuracyBonuses: allTeamsByErrors.map((team, index) => ({
        teamId: team.id,
        teamName: team.name,
        bonus: ACCURACY_BONUS_SCALE[index] ?? ACCURACY_BONUS_SCALE[ACCURACY_BONUS_SCALE.length - 1],
        rank: index + 1,
        errors: team.errors ?? 0,
      })),
    };
    setBonusPreview(preview);
    setShowBonusModal(true);
  };

  const handleApplyBonuses = () => {
    applyFinalBonuses();
    setShowBonusModal(false);
    setNotification("Bonus finaux appliqués avec succès ! Timer arrêté.", "success");
  };

  // Forcer l'arrêt du timer (instructeur uniquement)
  const handleStopTimer = () => {
    if (window.confirm("Êtes-vous sûr de vouloir forcer la fin du timer ? Cette action est irréversible.")) {
      stopTimer();
      setNotification("Timer arrêté. Le décompte final est maintenant disponible.", "success");
    }
  };

  // Le bouton "Appliquer les bonus finaux" est accessible uniquement si le timer est terminé
  const canApplyBonuses = state.timerStopped || timeLeftSeconds <= 0;

  // Si aucune session n'est active
  if (!sessionId) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex items-center justify-center">
        <div className="bg-gray-800 max-w-md p-8 rounded-xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-bp-red-400" />
          <h2 className="text-2xl font-bold mb-4">Aucune session active</h2>
          <p className="mb-6">
            Veuillez créer ou rejoindre une session depuis la page d'accueil du hackathon.
          </p>
          <button
            onClick={goBackToLanding}
            className="px-4 py-2 bg-bp-red-400 hover:bg-bp-red-500 rounded-lg"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const bonusAppliedDate = bonusAppliedAt
    ? new Date(bonusAppliedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      {/* Bouton de retour */}
      <button
        onClick={goBackToLanding}
        className="mb-8 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md absolute top-4 left-4 z-20"
      >
        <ArrowLeft size={20} />
        Retour à l'accueil
      </button>

      {/* Fond avec effet grille */}
      <div className="fixed inset-0 bg-grid opacity-20 z-0"></div>

      {/* En-tête et chronomètre */}
      <div className="text-center mb-6 relative z-10 pt-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-bp-red-400 bg-clip-text text-transparent mb-2">
          Escape Excel: Le Dossier Perdu 2.0
        </h1>

        {sessionId && (
          <p className="text-md text-gray-400 mb-4">Session ID: {sessionId}</p>
        )}

        <div className="flex items-center justify-center mt-4">
          <div
            className={`
            flex items-center bg-gray-800 rounded-lg px-4 py-2 border shadow-lg
            ${
              state.timerStopped
                ? "border-gray-600 opacity-60"
                : isUrgent
                ? "border-red-500 animate-pulse shadow-red-500/30"
                : isSessionStarted
                ? "border-green-500 shadow-green-500/30"
                : "border-cyan-500"
            }
          `}
          >
            <Clock
              className={`mr-2 ${
                state.timerStopped
                  ? "text-gray-500"
                  : isUrgent
                  ? "text-red-500"
                  : isSessionStarted
                  ? "text-green-500"
                  : "text-cyan-400"
              }`}
            />
            <span
              className={`text-2xl font-mono ${
                state.timerStopped
                  ? "text-gray-500"
                  : isUrgent
                  ? "text-red-500"
                  : isSessionStarted
                  ? "text-green-500"
                  : "text-cyan-400"
              }`}
            >
              {state.timerStopped ? "00:00:00" : formatTime(timeLeftSeconds)}
            </span>
            {state.timerStopped && (
              <span className="ml-3 text-xs text-gray-500 font-medium">⏹ Arrêté</span>
            )}
          </div>
        </div>
      </div>

      {/* ══ SECTION ALERTES ══════════════════════════════════════════════════ */}
      <div className="mb-6 relative z-10">
        <div
          className={`rounded-xl border ${
            alerts.length > 0 ? "border-orange-700/60 bg-orange-950/30" : "border-gray-700 bg-gray-800/40"
          }`}
        >
          {/* En-tête alertes */}
          <button
            onClick={() => setAlertsCollapsed((c) => !c)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white flex items-center gap-2">
                ⚠️ Alertes
              </span>
              {alerts.length > 0 ? (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              ) : (
                <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  0
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle son */}
              <button
                onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                title={soundEnabled ? "Désactiver le son" : "Activer le son de notification"}
                className={`p-1 rounded transition-colors ${soundEnabled ? "text-cyan-400 hover:text-cyan-300" : "text-gray-500 hover:text-gray-300"}`}
              >
                {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
              {alerts.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); dismissAllAlerts(); }}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Tout masquer
                </button>
              )}
              {alertsCollapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
            </div>
          </button>

          {/* Corps alertes */}
          {!alertsCollapsed && (
            <div className="px-4 pb-3">
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-1">
                  Aucune alerte active. Toutes les équipes sont dans les temps. ✅
                </p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                        alert.type === 'phase_ending'
                          ? 'bg-red-900/40 border-red-700/60 text-red-200'
                          : 'bg-orange-900/40 border-orange-700/60 text-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span>{alert.type === 'phase_ending' ? '🔴' : '🟠'}</span>
                        <span>{alert.message}</span>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-3 text-gray-400 hover:text-white flex-shrink-0 transition-colors"
                        title="Ignorer cette alerte"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bouton de rafraîchissement manuel */}
      <div className="flex justify-center mb-4">
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="bg-bp-red-400 hover:bg-bp-red-500 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Rafraîchissement..." : "Rafraîchir les données"}
        </button>
      </div>

      {/* Classement simplifié */}
      <div className="mb-8 bg-gray-800 rounded-xl p-4 relative z-10">
        <div className="flex items-center mb-4">
          <Trophy className="text-bp-red-400 mr-2" size={24} />
          <h2 className="text-xl font-bold">Classement</h2>
        </div>

        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 mb-2 px-4">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Équipe</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-center">Erreurs</div>
          <div className="col-span-3">Progression</div>
        </div>

        {sortedTeams.length > 0 ? (
          sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`
                grid grid-cols-12 gap-4 bg-gray-700/40 p-4 rounded-lg mb-2 items-center transition-all duration-500
                ${rankChanges[team.id] === "rank-up" ? "bg-green-700/40 animate-highlight" : ""}
              `}
            >
              <div className="col-span-1">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${
                    index === 0
                      ? "bg-yellow-500 text-gray-900"
                      : index === 1
                      ? "bg-gray-400 text-gray-900"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-gray-600 text-white"
                  }
                `}
                >
                  {index + 1}
                </div>
              </div>

              <div className="col-span-4 font-medium text-white">
                {team.name}
                {rankChanges[team.id] === "rank-up" && (
                  <span className="ml-2 text-green-400 text-sm animate-bounce">▲</span>
                )}
                {team.studentIds && team.studentIds.length > 0 && (
                  <span className="ml-2 text-blue-300 text-xs">
                    ({team.studentIds.length} participants)
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right font-bold text-cyan-400">
                {team.score}
              </div>

              <div className="col-span-2 text-center">
                <span className={`font-bold text-sm ${(team.errors ?? 0) === 0 ? "text-green-400" : (team.errors ?? 0) < 5 ? "text-yellow-400" : "text-red-400"}`}>
                  {team.errors ?? 0} ❌
                </span>
              </div>

              <div className="col-span-3">
                <div className="flex h-3 space-x-1">
                  {hackathonLevels.map((_, levelIndex) => (
                    <div
                      key={levelIndex}
                      className={`
                        h-full flex-1 rounded-full
                        ${
                          team.completedLevels && team.completedLevels.includes(levelIndex)
                            ? "bg-green-500"
                            : levelIndex === team.currentLevel
                            ? "bg-cyan-500 enhanced-shimmer"
                            : "bg-gray-600"
                        }
                      `}
                      title={hackathonLevels[levelIndex].name}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-6 text-gray-400">
            <p>Aucune équipe disponible. Utilisez le bouton "Rafraîchir les données" ci-dessus.</p>
          </div>
        )}
      </div>

      {/* Tableau des scores par équipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all hover:shadow-cyan-900/30 hover:shadow-lg"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="bg-gray-700 p-2 rounded-lg mr-3">
                    <Users className="text-cyan-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">{team.name}</h2>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{team.score}</div>
              </div>

              <div className="p-4">
                <div className="flex space-x-1 mb-4">
                  {hackathonLevels.map((level, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        team.completedLevels && team.completedLevels.includes(index)
                          ? "bg-green-500"
                          : index === team.currentLevel
                          ? "bg-cyan-500 enhanced-shimmer"
                          : "bg-gray-600"
                      }`}
                      title={level.name}
                    ></div>
                  ))}
                </div>

                <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Erreurs :</span>
                    <span className={`font-bold text-lg ${(team.errors ?? 0) === 0 ? "text-green-400" : (team.errors ?? 0) < 5 ? "text-yellow-400" : "text-red-400"}`}>
                      {team.errors ?? 0} ❌
                    </span>
                  </div>
                  {team.completionTime && (
                    <span className="text-xs text-green-400 flex items-center gap-1">✓ Terminé</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 text-center p-8 bg-gray-800 rounded-xl">
            <AlertCircle size={48} className="mx-auto mb-4 text-bp-red-400" />
            <h3 className="text-xl font-bold mb-2">Aucune équipe disponible</h3>
            <p className="text-gray-400 mb-4">
              Utilisez le bouton "Rafraîchir les données" ci-dessus pour mettre à jour l'affichage.
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'actions */}
      <div className="mt-10 text-center relative z-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowControlOverlay(true)}
          className="bg-bp-red-500 hover:bg-bp-red-400 text-white font-bold py-2 px-6 rounded-lg border border-blue-600 transition-colors shadow-lg flex items-center gap-2"
        >
          <Settings size={20} />
          Contrôle de session
        </button>

        <button
          onClick={() => setShowChatPanel(true)}
          className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg border border-indigo-600 transition-colors shadow-lg flex items-center gap-2"
        >
          <MessageCircle size={20} />
          Chat des équipes
        </button>

        <button
          onClick={setToFiveMinutes}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg border border-gray-700 transition-colors shadow-lg"
        >
          Passer à 5 minutes
        </button>

        {/* Bouton ⏹ Terminer le timer — distinct du bouton Terminer la session */}
        {!state.timerStopped && (
          <button
            onClick={handleStopTimer}
            disabled={!isSessionStarted}
            title={!isSessionStarted ? "La session n'est pas encore démarrée" : "Forcer la fin du timer"}
            className={`font-bold py-2 px-6 rounded-lg border transition-colors shadow-lg flex items-center gap-2 ${
              !isSessionStarted
                ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                : "bg-orange-700 hover:bg-orange-600 border-orange-600 text-white"
            }`}
          >
            ⏹ Terminer le timer
          </button>
        )}

        {/* Bouton bonus — non réappuyable après application, désactivé si timer en cours */}
        <div className="relative group">
          <button
            onClick={bonusApplied || !canApplyBonuses ? undefined : handlePreviewBonuses}
            disabled={bonusApplied || !canApplyBonuses}
            className={`font-bold py-2 px-6 rounded-lg border transition-colors shadow-lg flex items-center gap-2 ${
              bonusApplied
                ? "bg-green-900/50 border-green-700 text-green-300 cursor-not-allowed"
                : !canApplyBonuses
                ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                : "bg-yellow-700 hover:bg-yellow-600 border-yellow-600 text-white"
            }`}
          >
            <Trophy size={20} />
            {bonusApplied
              ? `✅ Bonus appliqués le ${bonusAppliedDate}`
              : "Appliquer les bonus finaux"}
          </button>
          {!bonusApplied && !canApplyBonuses && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded-lg px-3 py-2 text-center shadow-lg z-50">
              Le décompte final sera disponible une fois le timer terminé
            </div>
          )}
        </div>

        {/* Bouton classement animé — visible après les bonus */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className={`font-bold py-2 px-6 rounded-lg border transition-colors shadow-lg flex items-center gap-2 ${
            bonusApplied
              ? "bg-yellow-600 hover:bg-yellow-500 border-yellow-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
          }`}
        >
          🏆 Afficher le classement final
        </button>

        <button
          onClick={handleEndSession}
          disabled={isEndingSession}
          className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg border border-red-700 transition-colors shadow-lg flex items-center gap-2"
        >
          {isEndingSession ? <RefreshCw className="animate-spin" size={20} /> : null}
          Terminer la session
        </button>
      </div>

      {/* Notification */}
      {notification.visible && (
        <div
          className={`
          fixed bottom-6 right-6 max-w-md p-4 rounded-lg shadow-lg z-50
          ${
            notification.type === "success"
              ? "bg-green-800 border-l-4 border-green-500"
              : notification.type === "hint"
              ? "bg-yellow-800 border-l-4 border-yellow-500"
              : "bg-red-800 border-l-4 border-red-500"
          }
        `}
        >
          {notification.message}
        </div>
      )}

      {/* CSS */}
      <style>
        {`
        .bg-grid {
          background-image:
            linear-gradient(to right, rgba(25, 25, 35, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(25, 25, 35, 0.8) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .enhanced-shimmer {
          position: relative;
          overflow: hidden;
        }
        .enhanced-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          animation: shimmer 1.5s infinite ease-in-out;
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes highlight {
          0% { box-shadow: 0 0 0 rgba(74,222,128,0); transform: scale(1); }
          50% { box-shadow: 0 0 15px rgba(74,222,128,0.5); transform: scale(1.02); }
          100% { box-shadow: 0 0 0 rgba(74,222,128,0); transform: scale(1); }
        }
        .animate-highlight {
          animation: highlight 1s ease-in-out 2;
        }
        `}
      </style>

      {/* Overlay contrôle de session */}
      {showControlOverlay && (
        <SessionControlOverlay onClose={() => setShowControlOverlay(false)} />
      )}

      {/* Panel chat formateur */}
      {showChatPanel && sessionId && (
        <InstructorChatPanel
          sessionId={sessionId}
          teams={teams}
          onClose={() => setShowChatPanel(false)}
        />
      )}

      {/* Animation classement final */}
      {showLeaderboard && (
        <LeaderboardAnimation
          teams={sortedTeams}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Modal des bonus finaux */}
      {showBonusModal && bonusPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-yellow-400" size={28} />
                Bonus Finaux
              </h2>
              <button
                onClick={() => setShowBonusModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bonus rapidité */}
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                  <Zap size={20} />
                  Bonus Rapidité (équipes ayant tout terminé)
                </h3>
                {bonusPreview.speedBonuses.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">
                    Aucune équipe n'a complété tous les exercices.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bonusPreview.speedBonuses.map((b) => (
                      <div key={b.teamId} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${b.rank === 1 ? "bg-yellow-500 text-gray-900" : b.rank === 2 ? "bg-gray-400 text-gray-900" : b.rank === 3 ? "bg-amber-700 text-white" : "bg-gray-600 text-white"}`}>
                            {b.rank}
                          </span>
                          <span className="text-white font-medium">{b.teamName}</span>
                        </div>
                        <span className="text-cyan-400 font-bold">+{b.bonus} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bonus précision */}
              <div>
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-3">
                  <Target size={20} />
                  Bonus Précision (moins d'erreurs)
                </h3>
                <div className="space-y-2">
                  {bonusPreview.accuracyBonuses.map((b) => (
                    <div key={b.teamId} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${b.rank === 1 ? "bg-yellow-500 text-gray-900" : b.rank === 2 ? "bg-gray-400 text-gray-900" : b.rank === 3 ? "bg-amber-700 text-white" : "bg-gray-600 text-white"}`}>
                          {b.rank}
                        </span>
                        <span className="text-white font-medium">{b.teamName}</span>
                        <span className="text-gray-400 text-sm">({b.errors} erreur{b.errors !== 1 ? "s" : ""})</span>
                      </div>
                      <span className="text-green-400 font-bold">+{b.bonus} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barème */}
              <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
                <p className="font-medium text-gray-300 mb-2">Barème des bonus :</p>
                <p>Rapidité (1er→{SPEED_BONUS_SCALE[0]}, 2e→{SPEED_BONUS_SCALE[1]}, 3e→{SPEED_BONUS_SCALE[2]}, 4e→{SPEED_BONUS_SCALE[3]}, 5e+→{SPEED_BONUS_SCALE[4]} pts)</p>
                <p className="mt-1">Précision (1er→{ACCURACY_BONUS_SCALE[0]}, 2e→{ACCURACY_BONUS_SCALE[1]}, 3e→{ACCURACY_BONUS_SCALE[2]}, 4e→{ACCURACY_BONUS_SCALE[3]}, 5e+→{ACCURACY_BONUS_SCALE[4]} pts)</p>
              </div>

              {/* Avertissement */}
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-sm text-yellow-200">
                ⚠️ Cette action est irréversible. Le timer sera arrêté et les bonus ne pourront plus être réappliqués.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBonusModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApplyBonuses}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy size={20} />
                  Appliquer les bonus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreboardApp;
