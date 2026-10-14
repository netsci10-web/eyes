import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Activity, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step3Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
}

// Positions as percentages of container (x, y)
const POSITIONS = [
  { x: 15, y: 15, label: "좌측 상단" },
  { x: 85, y: 15, label: "우측 상단" },
  { x: 15, y: 85, label: "좌측 하단" },
  { x: 85, y: 85, label: "우측 하단" },
  { x: 50, y: 50, label: "중앙" },
  { x: 15, y: 50, label: "좌측 중앙" },
  { x: 85, y: 50, label: "우측 중앙" },
  { x: 50, y: 15, label: "중앙 상단" },
  { x: 50, y: 85, label: "중앙 하단" },
];

export default function Step3Saccades({ isActive, onComplete, speak }: Step3Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [targetLabel, setTargetLabel] = useState("중앙");
  const [jumpSpeedMs, setJumpSpeedMs] = useState(1000); // 1000ms, 750ms, 500ms
  const [jumpCount, setJumpCount] = useState(0);
  const [lastPosIndex, setLastPosIndex] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger speech
  useEffect(() => {
    if (isActive && isPlaying) {
      speak("세 번째 단계인 정밀 단속 안구 운동을 시작합니다. 머리는 움직이지 말고, 화면에 나타나는 밝은 주황색 점을 시선만으로 신속하게 추적하십시오.");
    }
  }, [isActive]);

  // Voice cues (spontaneous cues every few jumps)
  useEffect(() => {
    if (!isPlaying) return;

    if (jumpCount % 12 === 1) {
      speak("머리를 고정하고 눈동자만 빠르게 움직이세요");
    }
  }, [jumpCount, isPlaying]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    let jumpInterval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      // 1. Core countdown timer
      timerInterval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak("단속 안구 추적 운동이 성공적으로 완료되었습니다.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 2. Saccade target jump interval
      jumpInterval = setInterval(() => {
        setTargetPos((prev) => {
          let nextIndex = lastPosIndex;
          while (nextIndex === lastPosIndex) {
            nextIndex = Math.floor(Math.random() * POSITIONS.length);
          }
          setLastPosIndex(nextIndex);
          setTargetLabel(POSITIONS[nextIndex].label);
          setJumpCount((c) => c + 1);
          return { x: POSITIONS[nextIndex].x, y: POSITIONS[nextIndex].y };
        });
      }, jumpSpeedMs);
    } else {
      if (timerInterval) clearInterval(timerInterval);
      if (jumpInterval) clearInterval(jumpInterval);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (jumpInterval) clearInterval(jumpInterval);
    };
  }, [isPlaying, secondsLeft, jumpSpeedMs, lastPosIndex, onComplete]);

  const togglePlay = () => {
    if (!isPlaying && secondsLeft === 60) {
      setJumpCount(0);
      setTargetPos({ x: 50, y: 50 });
      setLastPosIndex(4);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setTargetPos({ x: 50, y: 50 });
    setTargetLabel("중앙");
    setJumpCount(0);
    setLastPosIndex(4);
  };

  return (
    <div id="step-3-container" className="flex flex-col items-center space-y-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-2" id="step3-header-title">
          <Activity className="w-5 h-5 text-indigo-500" />
          <span>3단계: 정밀 단속 안구 운동 (Saccades)</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-lg">
          눈을 임의의 지점으로 정밀하게 점프하는 단속(Saccades) 훈련입니다. 뇌의 <em>전두안야(Frontal Eye Field)</em>와 눈을 감싸는 외안근을 강화해 시각 피로를 해소합니다.
        </p>
      </div>

      {/* Target speed toggle */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs" id="saccades-speed-selectors">
        <span className="px-3 text-slate-500 font-semibold">점프 속도:</span>
        <button
          onClick={() => setJumpSpeedMs(1000)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            jumpSpeedMs === 1000 ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          초당 1회 (기본)
        </button>
        <button
          onClick={() => setJumpSpeedMs(750)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            jumpSpeedMs === 750 ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          초당 1.3회 (보통)
        </button>
        <button
          onClick={() => setJumpSpeedMs(500)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            jumpSpeedMs === 500 ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          초당 2회 (빠름)
        </button>
      </div>

      {/* Jumping Dot Workspace Canvas */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden cursor-none"
        id="step3-visual-canvas"
      >
        {/* Dynamic score/jump tracking */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          점프 추적 횟수: <span className="text-amber-400 font-bold">{jumpCount}회</span>
        </div>

        <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          위치: <span className="text-white font-bold">{targetLabel}</span>
        </div>

        {/* Outer tracking boundary lines (simulated neuro-optometry guide) */}
        <div className="absolute inset-4 border border-dashed border-slate-800/50 pointer-events-none rounded-lg" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-800/30 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-800/30 pointer-events-none" />

        {/* JUMPING TARGET */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              key={`${targetPos.x}-${targetPos.y}`}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 150 }}
              className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center pointer-events-none"
              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            >
              {/* Outer Ripple */}
              <div className="absolute w-12 h-12 rounded-full border border-orange-500/50 animate-ping" />
              {/* Mid Body */}
              <div className="absolute w-8 h-8 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                {/* Core Pinpoint */}
                <div className="w-3 h-3 rounded-full bg-orange-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start tutorial overlay */}
        {!isPlaying && secondsLeft === 60 && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-400 flex items-center justify-center text-orange-400 animate-bounce">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              점 시작 위치인 중앙에서 시작됩니다. <br />
              <strong>"훈련 시작"</strong>을 클릭하고 머리를 단단히 정면 고정한 채 눈만 움직이세요!
            </p>
          </div>
        )}
      </div>

      {/* Control Actions & Timer */}
      <div className="flex items-center space-x-6 w-full max-w-sm justify-between">
        <div className="text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">남은 시간</div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            id="step3-play-btn"
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
            id="step3-reset-btn"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-sm border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">안내사항</h4>
        <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
          <li><strong>절대 금지:</strong> 턱이나 머리가 점을 따라가지 않도록 몸을 완전히 고정하세요.</li>
          <li>목덜미나 어깨에 너무 힘이 들어가지 않도록 힘을 빼고 가볍게 시선만 튕기듯이 바라봅니다.</li>
          <li>속도가 너무 빨라 시선이 찢어지거나 어지러우면 '초당 1회' 기본 속도로 훈련하십시오.</li>
        </ul>
      </div>
    </div>
  );
}
