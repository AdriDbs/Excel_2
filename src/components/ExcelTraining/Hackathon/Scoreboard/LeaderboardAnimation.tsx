import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Trophy } from 'lucide-react';
import { Team } from '../types';

interface LeaderboardAnimationProps {
  teams: Team[];
  onClose: () => void;
}

type AnimStage = 'intro' | 'suspense' | 'reveal' | 'done';

const MEDALS = ['🥇', '🥈', '🥉'];
const CONFETTI_COLORS = [
  '#003E7E', '#00A3E0', '#FF6B35', '#FFD700', '#00C851',
  '#FF3D47', '#9C27B0', '#4CAF50', '#FF9800', '#E91E63',
];

// Génère N pièces de confetti avec positions/délais aléatoires
const generateConfetti = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
  }));

const confettiPieces = generateConfetti(60);

const LeaderboardAnimation: React.FC<LeaderboardAnimationProps> = ({ teams, onClose }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const totalTeams = sortedTeams.length;

  // step 0 = intro, step 1..totalTeams = revealing (last→first), step totalTeams+1 = done
  const [step, setStep] = useState(0);
  const [suspenseProgress, setSuspenseProgress] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animStage, setAnimStage] = useState<AnimStage>('intro');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const restart = () => {
    clearAll();
    setStep(0);
    setSuspenseProgress(0);
    setRevealedIndices([]);
    setShowConfetti(false);
    setAnimStage('intro');
  };

  useEffect(() => {
    clearAll();

    if (step === 0) {
      setAnimStage('intro');
      timeoutRef.current = setTimeout(() => setStep(1), 2200);
      return clearAll;
    }

    if (step >= 1 && step <= totalTeams) {
      setAnimStage('suspense');
      setSuspenseProgress(0);
      const loadDuration = 1100;
      const startTime = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / loadDuration) * 100);
        setSuspenseProgress(progress);

        if (elapsed >= loadDuration) {
          clearAll();
          // teamIndex dans sortedTeams à révéler (on révèle du dernier au premier)
          const teamIndex = totalTeams - step;
          setRevealedIndices((prev) => [...prev, teamIndex]);
          setAnimStage('reveal');

          const isWinner = teamIndex === 0;
          if (isWinner) {
            setShowConfetti(true);
          }

          timeoutRef.current = setTimeout(
            () => {
              if (step < totalTeams) {
                setStep((s) => s + 1);
              } else {
                setAnimStage('done');
                setStep(totalTeams + 1);
              }
            },
            isWinner ? 3000 : 1600
          );
        }
      }, 40);

      return clearAll;
    }

    if (step === totalTeams + 1) {
      setAnimStage('done');
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => () => clearAll(), []);

  const isRevealed = (index: number) => revealedIndices.includes(index);
  const isLatest = (index: number) =>
    revealedIndices[revealedIndices.length - 1] === index;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* ── Confetti ────────────────────────────────────────────────────── */}
      {showConfetti &&
        confettiPieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'fixed',
              left: `${p.left}%`,
              top: '-20px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
              transform: `rotate(${p.rotation}deg)`,
              zIndex: 60,
            }}
          />
        ))}

      {/* ── Bouton fermer ───────────────────────────────────────────────── */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-70 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
      >
        <X size={22} />
      </button>

      {/* ── Bouton recommencer ──────────────────────────────────────────── */}
      {animStage !== 'intro' && (
        <button
          onClick={restart}
          className="absolute top-4 left-4 z-70 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={16} />
          Recommencer
        </button>
      )}

      {/* ══ INTRO ══════════════════════════════════════════════════════════ */}
      {animStage === 'intro' && (
        <div className="text-center animate-pulse-slow">
          <Trophy size={80} className="mx-auto mb-6 text-yellow-400" style={{ filter: 'drop-shadow(0 0 30px #FFD700)' }} />
          <h1
            className="text-5xl md:text-7xl font-black text-white tracking-widest"
            style={{ textShadow: '0 0 40px rgba(255,215,0,0.6)' }}
          >
            🏆 CLASSEMENT FINAL
          </h1>
          <p className="mt-4 text-gray-400 text-lg animate-pulse">Préparez-vous…</p>
        </div>
      )}

      {/* ══ RÉVÉLATION + RÉSULTAT FINAL ═══════════════════════════════════ */}
      {(animStage === 'suspense' || animStage === 'reveal' || animStage === 'done') && (
        <div className="w-full max-w-2xl px-4">
          {/* Titre compact */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Trophy className="text-yellow-400" size={36} />
              CLASSEMENT FINAL
            </h2>
          </div>

          {/* ── Barre de suspense ─────────────────────────────────────── */}
          {animStage === 'suspense' && (
            <div className="mb-6">
              <div className="text-center text-gray-300 text-sm mb-2 animate-pulse">
                Révélation en cours…
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full rounded-full transition-none"
                  style={{
                    width: `${suspenseProgress}%`,
                    background: 'linear-gradient(90deg, #003E7E, #00A3E0, #FF6B35)',
                    boxShadow: '0 0 12px rgba(0,163,224,0.6)',
                    transition: 'width 40ms linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Liste des équipes (de la première à la dernière place) ── */}
          <div className="space-y-3">
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              const revealed = isRevealed(index);
              const latest = isLatest(index);
              const isFirst = index === 0;

              if (!revealed) {
                return (
                  <div
                    key={team.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between opacity-40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-lg">
                        ?
                      </span>
                      <span className="text-gray-600 font-bold text-lg">???</span>
                    </div>
                    <span className="text-gray-600 font-mono text-xl">— pts</span>
                  </div>
                );
              }

              return (
                <div
                  key={team.id}
                  className={`
                    rounded-xl p-4 flex items-center justify-between border
                    ${latest ? 'leaderboard-slide-up' : ''}
                    ${isFirst && showConfetti
                      ? 'bg-gradient-to-r from-yellow-900/60 to-yellow-700/40 border-yellow-500 shadow-2xl shadow-yellow-500/30'
                      : index === 1
                      ? 'bg-gray-700/60 border-gray-500'
                      : index === 2
                      ? 'bg-amber-900/40 border-amber-700'
                      : 'bg-gray-800/60 border-gray-700'
                    }
                  `}
                  style={isFirst && showConfetti ? { boxShadow: '0 0 40px rgba(255,215,0,0.3)' } : undefined}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${index === 0 ? 'bg-yellow-500 text-gray-900' : index === 1 ? 'bg-gray-400 text-gray-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-600 text-white'}
                      `}
                    >
                      {rank <= 3 ? MEDALS[rank - 1] : rank}
                    </span>
                    <div>
                      <p className={`font-bold text-lg ${isFirst ? 'text-yellow-300' : 'text-white'}`}>
                        {team.name}
                      </p>
                      {isFirst && showConfetti && (
                        <p className="text-yellow-400 text-sm animate-bounce">🎉 FÉLICITATIONS !</p>
                      )}
                    </div>
                  </div>
                  <div className={`font-mono text-2xl font-black ${isFirst ? 'text-yellow-300' : 'text-cyan-400'}`}>
                    {team.score.toLocaleString()} pts
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message final */}
          {animStage === 'done' && (
            <div className="text-center mt-8 animate-fade-in">
              <p className="text-gray-400 text-sm">
                Classement final avec bonus appliqués
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CSS animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.03); }
        }
        .leaderboard-slide-up {
          animation: slideUpIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LeaderboardAnimation;
