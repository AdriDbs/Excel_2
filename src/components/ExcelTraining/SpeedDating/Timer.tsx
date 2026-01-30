import React, { memo, useMemo } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  timeLeft: number;
  timerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const Timer: React.FC<TimerProps> = memo(({
  timeLeft,
  timerRunning,
  toggleTimer,
  resetTimer,
}) => {
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, [timeLeft]);

  const isLowTime = timeLeft < 10;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`text-3xl font-mono font-bold mb-2 transition-colors ${
          isLowTime ? "text-bearing-red animate-pulse" : "text-bearing-red-60"
        }`}
      >
        {formattedTime}
      </div>
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className="bg-bearing-gray-20 hover:bg-bearing-gray-30 text-bearing-gray-60 rounded-full p-2 transition-colors"
          aria-label={timerRunning ? "Pause" : "Play"}
        >
          {timerRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="bg-bearing-gray-20 hover:bg-bearing-gray-30 text-bearing-gray-60 rounded-full p-2 transition-colors"
          aria-label="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
});

Timer.displayName = "Timer";

export default Timer;
