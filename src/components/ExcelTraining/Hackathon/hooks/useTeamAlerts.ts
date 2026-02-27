import { useState, useEffect, useRef } from 'react';
import { useHackathon, PHASE_TIMINGS, PHASE_BOUNDARIES } from '../context/HackathonContext';
import { TeamAlert } from '../types';

const getPhaseForLevel = (levelIndex: number): number => {
  const phase = PHASE_BOUNDARIES.find(
    (p) => levelIndex >= p.firstLevel && levelIndex <= p.lastLevel
  );
  return phase?.id ?? 0;
};

const TOTAL_LEVELS = 16;

export const useTeamAlerts = () => {
  const { state } = useHackathon();
  const { teams } = state;
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevAlertCountRef = useRef(0);

  // Son de notification quand de nouvelles alertes apparaissent
  useEffect(() => {
    if (!soundEnabled) return;
    const alerts = computeAlerts();
    if (alerts.length > prevAlertCountRef.current) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } catch {
        // Ignore audio errors silently
      }
    }
    prevAlertCountRef.current = alerts.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, soundEnabled]);

  const computeAlerts = (): TeamAlert[] => {
    const alerts: TeamAlert[] = [];
    const now = Date.now();

    for (const team of teams) {
      const currentLevel = team.currentLevel || 0;
      const completedLevels = team.completedLevels || [];
      const phaseStartTimestamps = team.phaseStartTimestamps || {};

      // Ignorer les équipes ayant tout terminé
      if (completedLevels.length >= TOTAL_LEVELS) continue;

      const currentPhaseId = getPhaseForLevel(currentLevel);
      const phaseBoundary = PHASE_BOUNDARIES.find((p) => p.id === currentPhaseId);
      if (!phaseBoundary) continue;

      const phaseTiming = PHASE_TIMINGS[currentPhaseId];
      if (!phaseTiming) continue;

      const phaseStartTime = phaseStartTimestamps[currentPhaseId];
      if (!phaseStartTime) continue; // Pas de timestamp = impossible de calculer

      const phaseElapsedMs = now - phaseStartTime;
      const elapsedMinutes = phaseElapsedMs / 60000;

      // Exercices validés dans la phase courante
      const exercisesInPhase = completedLevels.filter(
        (l) => l >= phaseBoundary.firstLevel && l <= phaseBoundary.lastLevel
      ).length;

      const totalPhaseExercises = phaseTiming.exercises;
      const phaseComplete = exercisesInPhase >= totalPhaseExercises;

      if (phaseComplete) continue;

      const minPerEx = phaseTiming.duration / phaseTiming.exercises;

      // ── Alerte Type 1 : Retard sur l'exercice courant (orange) ──────────
      // Déclenchée si elapsed > (exercicesValidés + 1) × tempsParExercice
      const expectedMinutes = (exercisesInPhase + 1) * minPerEx;
      if (elapsedMinutes > expectedMinutes) {
        const alertId = `overtime-${team.id}-${currentPhaseId}-${exercisesInPhase}`;
        if (!dismissedAlerts.has(alertId)) {
          alerts.push({
            id: alertId,
            teamId: team.id,
            teamName: team.name,
            phaseId: currentPhaseId,
            type: 'overtime_exercise',
            message: `${team.name} – Phase ${currentPhaseId} : En retard sur l'exercice ${exercisesInPhase + 1} (${Math.floor(elapsedMinutes)} min écoulées)`,
          });
        }
      }

      // ── Alerte Type 2 : Moins de 5 min avant la fin de phase (rouge) ────
      const phaseDurationMs = phaseTiming.duration * 60000;
      const timeRemainingInPhaseMs = phaseDurationMs - phaseElapsedMs;
      if (timeRemainingInPhaseMs <= 5 * 60000 && timeRemainingInPhaseMs > 0) {
        const alertId = `phase-ending-${team.id}-${currentPhaseId}`;
        if (!dismissedAlerts.has(alertId)) {
          alerts.push({
            id: alertId,
            teamId: team.id,
            teamName: team.name,
            phaseId: currentPhaseId,
            type: 'phase_ending',
            message: `${team.name} – Phase ${currentPhaseId} : Moins de 5 min restantes ! (phase non terminée)`,
          });
        }
      }
    }

    // Trier : rouge (phase_ending) avant orange (overtime_exercise)
    return alerts.sort((a, b) => {
      if (a.type === 'phase_ending' && b.type !== 'phase_ending') return -1;
      if (b.type === 'phase_ending' && a.type !== 'phase_ending') return 1;
      return a.teamName.localeCompare(b.teamName);
    });
  };

  const alerts = computeAlerts();

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const dismissAllAlerts = () => {
    setDismissedAlerts(new Set(alerts.map((a) => a.id)));
  };

  return { alerts, dismissAlert, dismissAllAlerts, soundEnabled, setSoundEnabled };
};
