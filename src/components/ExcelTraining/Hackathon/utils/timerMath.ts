/**
 * Calculs purs pour l'ajustement manuel du timer hackathon.
 *
 * Le temps restant est toujours recalculé à partir de `startTime`
 * (durée totale - temps écoulé depuis startTime), y compris pour tous les
 * clients synchronisés via Firebase. Ajuster le temps restant "en dur"
 * (timeLeftSeconds) serait donc écrasé au prochain recalcul : il faut
 * déplacer `startTime` à la place.
 */

export interface TimerAdjustment {
  type: "add" | "set";
  seconds: number;
}

export interface AdjustedTimer {
  newStartTime: number;
  newTimeLeftSeconds: number;
}

/**
 * Calcule le nouveau startTime et le nouveau temps restant suite à un ajustement.
 *
 * @param currentStartTime - startTime actuel (ms epoch)
 * @param totalDurationSeconds - durée totale de la session (ex: 7200 = 120 min)
 * @param adjustment - { type: "add", seconds } pour ajouter/retirer du temps,
 *                      { type: "set", seconds } pour définir le temps restant exact
 * @param nowMs - horodatage courant (ms epoch), injectable pour les tests
 */
export function computeAdjustedTimer(
  currentStartTime: number,
  totalDurationSeconds: number,
  adjustment: TimerAdjustment,
  nowMs: number
): AdjustedTimer {
  const newStartTime =
    adjustment.type === "add"
      ? currentStartTime + adjustment.seconds * 1000
      : nowMs - (totalDurationSeconds * 1000 - adjustment.seconds * 1000);

  const newElapsedMs = nowMs - newStartTime;
  const newTimeLeftSeconds = Math.max(
    0,
    Math.floor((totalDurationSeconds * 1000 - newElapsedMs) / 1000)
  );

  return { newStartTime, newTimeLeftSeconds };
}
