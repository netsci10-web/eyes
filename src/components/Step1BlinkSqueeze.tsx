import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, AlertCircle, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step1Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
}

type Phase = "BLINK" | "SQUEEZE" | "OPEN";

export default function Step1BlinkSqueeze({ isActive, onComplete, speak }: Step1Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [phase, setPhase] = useState<Phase>("BLINK");
  const [phaseSeconds, setPhaseSeconds] = useState(2);
  const [repsCompleted, setRepsCompleted] = useState(0);

  // Initialize and guide
  useEffect(() => {
    if (isActive && isPlaying) {
      speak("첫 번째 단계인 마이봄샘 자극 운동을 시작합니다. 화면 가이드에 맞춰 눈을 깜빡이세요.");
    }
  }, [isActive]);

  // Voice coaching on phase changes
  useEffect(() => {
    if (!isPlaying) return;

    if (phase === "BLINK") {
      speak("가볍게 눈을 감으세요");
    } else if (phase === "SQUEEZE") {
      speak("눈꺼풀을 꽉 쥐어짜듯 감으세요");
    } else if (phase === "OPEN") {
      speak("눈을 크게 뜨세요");
    }
  }, [phase, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setRepsCompleted(10);
            speak("마이봄샘 자극 운동이 완료되었습니다. 다음 단계를 이어서 시작하세요.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            // Transition phases: BLINK (2s) -> SQUEEZE (2s) -> OPEN (2s)
            setPhase((curr) => {
              if (curr === "BLINK") return "SQUEEZE";
              if (curr === "SQUEEZE") return "OPEN";
              // "OPEN" transition leads to "BLINK"
              setRepsCompleted((r) => Math.min(10, r + 1));
              return "BLINK";
            });
            return 2; // Each phase is 2 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, secondsLeft, onComplete]);

  const togglePlay = () => {
    if (!isPlaying && secondsLeft === 60) {
      setRepsCompleted(0);
      setPhase("BLINK");
      setPhaseSeconds(2);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setPhase("BLINK");
    setPhaseSeconds(2);
    setRepsCompleted(0);
  };

  // Helper colors for current phase
  const getPhaseColor = () => {
    if (phase === "BLINK") return "bg-indigo-500 text-white";
    if (phase === "SQUEEZE") return "bg-sky-600 text-white";
    return "bg-emerald-500 text-white";
  };

  const getPhaseLabel = () => {
    if (phase === "BLINK") return "1단계: 가볍게 감기 (Blink)";
    if (phase === "SQUEEZE") return "2단계: 꽉 지긋이 감기 (Squeeze)";
    return "3단계: 크게 뜨기 (Open Wide)";
  };

  const getPhaseDesc = () => {
    if (phase === "BLINK") return "눈의 긴장을 풀고 가볍게 감으세요.";
    if (phase === "SQUEEZE") return "눈꺼풀 주위 근육을 동원해 마이봄샘을 지긋이 압박합니다.";
    return "눈을 시원하게 아주 크게 떠서 눈물막을 균일하게 펴주세요.";
  };

  return (
    <div id="step-1-container" className="flex flex-col items-center space-y-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-2" id="step1-header-title">
          <Eye className="w-5 h-5 text-indigo-500" />
          <span>1단계: 마이봄샘 자극 및 눈물막 안정화</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-lg">
          완전한 깜빡임과 적정 자극(Squeeze)은 안구 건조를 완화하고 눈물의 수분층을 굳건히 지키는 지질(기름) 분비를 강력히 촉진합니다. (총 10회 루프)
        </p>
      </div>

      {/* Main Display: Eye Animation */}
      <div className="relative w-full max-w-sm h-64 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden" id="step1-visual-canvas">
        {/* Phase Badge */}
        <div className={`absolute top-4 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${getPhaseColor()}`}>
          {getPhaseLabel()}
        </div>

        {/* Repetition Indicator */}
        <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 bg-white/80 px-2 py-1 rounded border border-slate-100">
          완료 횟수: <span className="font-bold text-slate-800">{repsCompleted}/10</span>
        </div>

        {/* Animated Eye Visual */}
        <div className="w-48 h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "BLINK" && (
              <motion.svg
                key="blink-eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-40 h-20 text-indigo-500"
                viewBox="0 0 100 40"
                fill="none"
              >
                {/* Blink: Soft curve line representing closed eyelid */}
                <path d="M10,20 C30,22 70,22 90,20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M10,20 C30,18 70,18 90,20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
              </motion.svg>
            )}

            {phase === "SQUEEZE" && (
              <motion.svg
                key="squeeze-eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-40 h-20 text-sky-600"
                viewBox="0 0 100 40"
                fill="none"
              >
                {/* Squeeze: Tightly closed, jagged squints, tension indicators */}
                <path d="M10,20 L40,25 L50,15 L60,25 L90,20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                {/* Tension lines */}
                <path d="M20,10 L15,5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M80,10 L85,5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M20,30 L15,35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M80,30 L85,35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </motion.svg>
            )}

            {phase === "OPEN" && (
              <motion.svg
                key="open-eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-40 h-20 text-emerald-500"
                viewBox="0 0 100 40"
                fill="none"
              >
                {/* Open: Wide open football shape with iris and pupil */}
                <path d="M10,20 C30,2 70,2 90,20 C70,38 30,38 10,20 Z" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Iris */}
                <circle cx="50" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="#E2E8F0" />
                {/* Pupil */}
                <circle cx="50" cy="20" r="7" fill="currentColor" />
                {/* Reflex reflection sparkle */}
                <circle cx="47" cy="17" r="2.5" fill="white" />
                <Sparkles className="w-5 h-5 absolute text-emerald-400 animate-pulse" style={{ top: "35%", left: "35%" }} />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Phase Description */}
        <div className="mt-2 text-center px-4">
          <p className="text-sm font-semibold text-slate-700 h-5 transition-colors duration-300">
            {getPhaseDesc()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            이 단계 시간: {phaseSeconds}초 남음
          </p>
        </div>

        {/* Radial Sync Breath Ring */}
        {isPlaying && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                phase === "BLINK" ? "bg-indigo-500" : phase === "SQUEEZE" ? "bg-sky-600" : "bg-emerald-500"
              }`}
              style={{ width: `${(phaseSeconds / 2) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Control Actions & Timer */}
      <div className="flex items-center space-x-6 w-full max-w-sm justify-between">
        <div className="text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">전체 진행도</div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            id="step1-play-btn"
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all ${
              isPlaying
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>훈련 시작</span>
              </>
            )}
          </button>

          <button
            onClick={resetExercise}
            id="step1-reset-btn"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Checklist instructions */}
      <div className="w-full max-w-sm border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">안내사항</h4>
        <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
          <li>1회 루프는 6초(감기 2초 ➔ 쥐어짜기 2초 ➔ 크게 뜨기 2초)입니다.</li>
          <li>쥐어짜는 단계에서 미간을 너무 찌푸리기보단, 눈꺼풀 지질선의 압박에 집중하세요.</li>
          <li>안경이나 렌즈를 착용한 상태에서도 편안히 훈련 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}
