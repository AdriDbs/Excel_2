import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  timeLeft: number;
  timerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const Timer = ({
  timeLeft,
  timerRunning,
  toggleTimer,
  resetTimer,
}: TimerProps) => {
  // Formater le temps en minutes:secondes
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`text-3xl font-mono font-bold mb-2 ${
          timeLeft < 10 ? "text-red-600 animate-pulse" : ""
        }`}
      >
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          {timerRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default Timer;
