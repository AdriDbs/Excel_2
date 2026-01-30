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
          isLowTime ? "text-bp-red-400 animate-pulse" : "text-bp-red-500"
        }`}
      >
        {formattedTime}
      </div>
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className="bg-bp-gray-100 hover:bg-bp-gray-200 text-bp-gray-500 rounded-full p-2 transition-colors"
          aria-label={timerRunning ? "Pause" : "Play"}
        >
          {timerRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="bg-bp-gray-100 hover:bg-bp-gray-200 text-bp-gray-500 rounded-full p-2 transition-colors"
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
