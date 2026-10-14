import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Compass, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step2Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
}

type AccomState = "NEAR" | "FAR";

const LETTERS = ["E", "Ш", "M", "W", "C", "O", "A", "8", "5"];

export default function Step2Accommodative({ isActive, onComplete, speak }: Step2Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [focusState, setFocusState] = useState<AccomState>("NEAR");
  const [cycleSeconds, setCycleSeconds] = useState(5);
  const [currentLetter, setCurrentLetter] = useState("E");
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Trigger speech on step initiation
  useEffect(() => {
    if (isActive && isPlaying) {
      speak("두 번째 단계인 조절 피로 완화 훈련을 시작합니다. 화면 중앙의 글씨를 자세히 보거나, 먼 곳을 바라보며 조절력 유연성을 회복하세요.");
    }
  }, [isActive]);

  // Voice coaching on focus shift
  useEffect(() => {
    if (!isPlaying) return;

    if (focusState === "NEAR") {
      speak("가운데 글씨에 초점을 또렷이 맞추세요");
    } else {
      speak("화면 너머 먼 벽이나 창 밖을 보며 눈에 힘을 빼세요");
    }
  }, [focusState, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak("조절 피로 완화 훈련이 끝났습니다. 잘하셨습니다.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        setCycleSeconds((prev) => {
          if (prev <= 1) {
            setFocusState((curr) => {
              const nextState = curr === "NEAR" ? "FAR" : "NEAR";
              if (nextState === "NEAR") {
                // Change letter to keep attention high
                const randIndex = Math.floor(Math.random() * LETTERS.length);
                setCurrentLetter(LETTERS[randIndex]);
                setCyclesCompleted((c) => c + 1);
              }
              return nextState;
            });
            return 5; // Swap every 5 seconds
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
      setCyclesCompleted(0);
      setFocusState("NEAR");
      setCycleSeconds(5);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setFocusState("NEAR");
    setCycleSeconds(5);
    setCyclesCompleted(0);
    setCurrentLetter("E");
  };

  return (
    <div id="step-2-container" className="flex flex-col items-center space-y-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-2" id="step2-header-title">
          <Compass className="w-5 h-5 text-indigo-500" />
          <span>2단계: 모양체 근육 이완 및 조절 피로 완화</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-lg">
          가까운 곳을 집중해 보다가(모양체 수축), 먼 곳을 편히 주시하는(모양체 이완) 동작을 번갈아 수행하여 가성 근시 유발 및 조절 피로를 완전 차단합니다.
        </p>
      </div>

      {/* Visual Workspace */}
      <div className="relative w-full max-w-sm h-64 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden" id="step2-visual-canvas">
        {/* State Badge */}
        <div className={`absolute top-4 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          focusState === "NEAR" ? "bg-indigo-500 text-white" : "bg-teal-500 text-white animate-pulse"
        }`}>
          {focusState === "NEAR" ? "근거리 집중: 화면의 글자 응시" : "원거리 이완: 모니터 너머 벽/풍경 주시"}
        </div>

        {/* Counter */}
        <div className="absolute top-4 right-4 text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
          완료 주기: <span className="font-bold text-white">{cyclesCompleted}/6회</span>
        </div>

        {/* Interactive Visualizer */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {focusState === "NEAR" ? (
              <motion.div
                key="near-visual"
                initial={{ opacity: 0, scale: 0.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex flex-col items-center justify-center"
              >
                {/* Micro focus target */}
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-white shadow-xl">
                  <span className="text-2xl font-bold text-indigo-600 font-mono select-none">
                    {currentLetter}
                  </span>
                </div>
                {/* Concentric rings scaling to draw eye's focus tight */}
                <div className="absolute w-28 h-28 rounded-full border border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: "12s" }} />
                <div className="absolute w-36 h-36 rounded-full border border-indigo-400/20 animate-ping" style={{ animationDuration: "3s" }} />
                <p className="text-xs text-indigo-300 mt-4 font-semibold">이 글자에 집중!</p>
              </motion.div>
            ) : (
              <motion.div
                key="far-visual"
                initial={{ opacity: 0, scale: 1.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.2 }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                className="flex flex-col items-center justify-center text-center space-y-2"
              >
                {/* Diffuse, soft circles representing looking beyond */}
                <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-400/40 blur-xs flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20" />
                </div>
                <div className="absolute w-40 h-40 rounded-full border border-teal-500/20 animate-pulse" />
                
                <p className="text-xs text-teal-300 font-semibold max-w-[200px]">
                  화면에서 초점을 풀고 <br />
                  <span className="text-teal-200 underline underline-offset-4 font-bold">방 건너편이나 창밖</span>을 바라보세요.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic bottom ticker bar */}
        {isPlaying && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                focusState === "NEAR" ? "bg-indigo-500" : "bg-teal-500"
              }`}
              style={{ width: `${(cycleSeconds / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Phase progress text */}
        <div className="absolute bottom-4 text-xs font-semibold text-slate-400">
          다음 초점 전환까지: <span className="text-white font-mono">{cycleSeconds}초</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-6 w-full max-w-sm justify-between">
        <div className="text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">남은 훈련 시간</div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            id="step2-play-btn"
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
            id="step2-reset-btn"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide notes */}
      <div className="w-full max-w-sm border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">안내사항</h4>
        <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
          <li><strong>가까이 주시할 때:</strong> 글씨의 획이 또렷하게 맺힐 정도로 정교하게 눈의 초점을 집중하세요.</li>
          <li><strong>멀리 바라볼 때:</strong> 모니터 뒤 최소 3m 이상 떨어진 임의의 물체나 창밖 가로등, 산을 멍하니 본다는 기분으로 응시하여 모양체 근육 긴장을 완전히 이완하세요.</li>
        </ul>
      </div>
    </div>
  );
}
