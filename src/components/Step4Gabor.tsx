import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Brain, Check, ShieldAlert, Zap, Info, Activity } from "lucide-react";
import { motion } from "motion/react";

interface Step4Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
  onScoreUpdate?: (score: number) => void;
  isFullscreen?: boolean;
  onRunningChange?: (running: boolean) => void;
  onStateUpdate?: (state: {
    isPlaying: boolean;
    secondsLeft: number;
    totalSeconds: number;
    phaseInfo?: string;
    extraInfo?: string;
  }) => void;
  playTrigger?: number;
  resetTrigger?: number;
}

// 4 Orientations
const ORIENTATIONS = [
  { angle: 0, label: "수직 (|)", icon: "│", key: "ArrowUp" },
  { angle: 45, label: "대각선 우 (/)", icon: "╱", key: "ArrowRight" },
  { angle: 90, label: "수평 (—)", icon: "─", key: "ArrowDown" },
  { angle: 135, label: "대각선 좌 (\\)", icon: "╲", key: "ArrowLeft" },
];

type ViewMode = "GABOR_TEST" | "CORTEX_RECEPTIVE_FIELD";

export default function Step4Gabor({
  isActive,
  onComplete,
  speak,
  onScoreUpdate,
  isFullscreen = false,
  onRunningChange,
  onStateUpdate,
  playTrigger,
  resetTrigger,
}: Step4Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [contrast, setContrast] = useState(0.8);
  const [frequency, setFrequency] = useState(0.055);
  const [sigma, setSigma] = useState(28);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestContrast, setBestContrast] = useState(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>("GABOR_TEST");
  const [actionPotentialHz, setActionPotentialHz] = useState(95);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPlayTriggerRef = useRef(playTrigger);
  const prevResetTriggerRef = useRef(resetTrigger);

  // Sync external triggers
  useEffect(() => {
    if (playTrigger !== undefined && playTrigger !== prevPlayTriggerRef.current) {
      prevPlayTriggerRef.current = playTrigger;
      togglePlay();
    }
  }, [playTrigger]);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger !== prevResetTriggerRef.current) {
      prevResetTriggerRef.current = resetTrigger;
      resetExercise();
    }
  }, [resetTrigger]);

  // Keyboard shortcut listener for Gabor orientations
  useEffect(() => {
    if (!isPlaying) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "1") handleSelection(0);
      else if (e.key === "ArrowRight" || e.key === "2") handleSelection(1);
      else if (e.key === "ArrowDown" || e.key === "3") handleSelection(2);
      else if (e.key === "ArrowLeft" || e.key === "4") handleSelection(3);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, currentAngleIndex, contrast, bestContrast]);

  // Notify parent of state changes
  useEffect(() => {
    onRunningChange?.(isPlaying);
    onStateUpdate?.({
      isPlaying,
      secondsLeft,
      totalSeconds: 60,
      phaseInfo: `시각 인지 점수: ${score}점 (대비 한계 ${Math.round(contrast * 100)}%)`,
      extraInfo: streak > 1 ? `${streak}연속 정답!` : "",
    });
  }, [isPlaying, secondsLeft, score, contrast, streak]);

  // Trigger speech
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (!isPlaying) {
      isInitialMountRef.current = true;
      return;
    }
    if (isInitialMountRef.current && secondsLeft === 60) {
      isInitialMountRef.current = false;
      speak("4단계: 대비 감도 확장 훈련을 시작합니다. 중앙 줄무늬의 기울기 각도를 선택하세요.");
    }
  }, [isPlaying, secondsLeft]);

  // Handle mathematical drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const angle = ORIENTATIONS[currentAngleIndex].angle;
    drawGaborPatch(canvas, angle, frequency, contrast, sigma);
  }, [currentAngleIndex, contrast, frequency, sigma, isPlaying, viewMode]);

  // Main countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak(`훈련 완료! 최소 인지 대조 한계치는 ${Math.round(bestContrast * 100)}%였습니다. 대뇌 일차 시각 피질의 해상도를 확장했습니다.`);
            if (onScoreUpdate) {
              onScoreUpdate(Math.round((1 - bestContrast) * 100));
            }
            onComplete();
            return 0;
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
  }, [isPlaying, secondsLeft, bestContrast, onComplete]);

  // True Psychophysics Gabor Grating Formula
  const drawGaborPatch = (
    canvas: HTMLCanvasElement,
    orientationAngle: number,
    freq: number,
    contr: number,
    sig: number
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const cx = width / 2;
    const cy = height / 2;

    const theta = (orientationAngle * Math.PI) / 180;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;

        const xPrime = dx * Math.cos(theta) + dy * Math.sin(theta);
        const yPrime = -dx * Math.sin(theta) + dy * Math.cos(theta);

        // Circular Gaussian envelope
        const gaussian = Math.exp(-(xPrime * xPrime + yPrime * yPrime) / (2 * sig * sig));

        // Sinusoidal grating
        const grating = Math.cos(2 * Math.PI * freq * xPrime);

        // Contrast scaled
        const val = 128 + 127 * contr * grating * gaussian;
        const clampedVal = Math.max(0, Math.min(255, val));

        const index = (y * width + x) * 4;
        data[index] = clampedVal;
        data[index + 1] = clampedVal;
        data[index + 2] = clampedVal;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Subtle calibration reticle around border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  };

  const generateNewPatch = () => {
    setCurrentAngleIndex((prev) => {
      let nextIndex = Math.floor(Math.random() * ORIENTATIONS.length);
      while (nextIndex === prev) {
        nextIndex = Math.floor(Math.random() * ORIENTATIONS.length);
      }
      return nextIndex;
    });
    setActionPotentialHz(Math.floor(85 + Math.random() * 40));
  };

  const handleSelection = (angleIndex: number) => {
    if (!isPlaying) return;

    if (angleIndex === currentAngleIndex) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);

      const nextContrast = Math.max(0.02, contrast * 0.72);
      setContrast(nextContrast);
      if (nextContrast < bestContrast) {
        setBestContrast(nextContrast);
      }

      setFeedback({ type: "success", text: "정답! 대뇌 시각 피질의 대조 감도가 확장되었습니다." });
      speak("정답입니다");

      setTimeout(() => {
        setFeedback({ type: null, text: "" });
        generateNewPatch();
      }, 700);
    } else {
      setStreak(0);
      const nextContrast = Math.min(1.0, contrast * 1.35);
      setContrast(nextContrast);

      setFeedback({
        type: "error",
        text: `오답. 원래 방향은 [${ORIENTATIONS[currentAngleIndex].label}]였습니다.`,
      });
      speak("방향이 다릅니다");

      setTimeout(() => {
        setFeedback({ type: null, text: "" });
        generateNewPatch();
      }, 1400);
    }
  };

  const togglePlay = () => {
    if (!isPlaying && secondsLeft === 60) {
      setScore(0);
      setStreak(0);
      setContrast(0.8);
      setBestContrast(0.8);
      setFeedback({ type: null, text: "" });
      generateNewPatch();
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setContrast(0.8);
    setBestContrast(1.0);
    setScore(0);
    setStreak(0);
    setFeedback({ type: null, text: "" });
    setCurrentAngleIndex(0);
  };

  const activeOrientation = ORIENTATIONS[currentAngleIndex];

  return (
    <div
      id="step-4-container"
      className={
        isFullscreen
          ? "w-full h-full flex flex-col items-center justify-center bg-transparent border-0 rounded-none shadow-none p-2 sm:p-4 text-white"
          : "flex flex-col items-center space-y-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      }
    >
      {/* Header */}
      {!isFullscreen ? (
        <div className="text-center space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <h3 className="text-base font-bold text-slate-800" id="step4-header-title">
                4단계: 대조 감도 극대화 훈련 (Gabor Contrast)
              </h3>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("GABOR_TEST")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "GABOR_TEST"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                가보 패치 판별
              </button>
              <button
                onClick={() => setViewMode("CORTEX_RECEPTIVE_FIELD")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "CORTEX_RECEPTIVE_FIELD"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                대뇌 V1 수용장 모델
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-left">
            눈의 안축장을 바꾸지 않고도, 뇌의 <em>일차 시각 피질(V1)</em>의 대비 감도(Contrast Sensitivity) 가소성을 자극하여 실질 해상도를 높입니다.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Brain className="w-4 h-4 text-rose-400" />
            <span className="text-slate-300 font-semibold">
              대뇌 V1 대비 판별 — 줄무늬 방향을 클릭하거나 키보드 방향키(↑, →, ↓, ←)를 누르세요
            </span>
          </div>

          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("GABOR_TEST")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "GABOR_TEST" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              가보 패치
            </button>
            <button
              onClick={() => setViewMode("CORTEX_RECEPTIVE_FIELD")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "CORTEX_RECEPTIVE_FIELD" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              수용장 모델
            </button>
          </div>
        </div>
      )}

      {/* Main Simulation Viewport */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-230px)] min-h-[400px]" : "h-72"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none`}
        id="step4-visual-canvas"
      >
        {/* VIEW A: GABOR PSYCHOPHYSICS TEST */}
        {viewMode === "GABOR_TEST" && (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            {/* Ambient circular aperture glow */}
            <div className="absolute w-48 h-48 rounded-full bg-slate-800/50 border border-slate-700/80 shadow-2xl flex items-center justify-center pointer-events-none" />

            <canvas
              ref={canvasRef}
              width={170}
              height={170}
              className="rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-slate-600 select-none cursor-default"
            />

            {/* Central micro-fixation dot */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 pointer-events-none opacity-60" />

            {/* Real-time Feedback Toast Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 text-center pointer-events-none z-20">
              {feedback.type === "success" && (
                <div className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center justify-center space-x-1.5 border border-emerald-400 animate-bounce">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}
              {feedback.type === "error" && (
                <div className="bg-rose-600 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center justify-center space-x-1.5 border border-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}
            </div>

            {/* Tutorial Overlay */}
            {!isPlaying && secondsLeft === 60 && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-5 space-y-2 z-10">
                <Zap className="w-8 h-8 text-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white">인지신경학적 지능형 시력 강화</h4>
                <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                  중앙 패치 속 <strong>흐릿한 줄무늬의 기울기(각도)</strong>를 판별하여 하단 버튼을 클릭하세요. 맞출수록 패턴이 점점 옅어집니다!
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW B: HUBEL & WIESEL V1 CORTEX RECEPTIVE FIELD SIMULATION */}
        {viewMode === "CORTEX_RECEPTIVE_FIELD" && (
          <div className="relative w-full h-full flex items-center justify-center px-4">
            <div className="grid grid-cols-12 gap-3 w-full items-center">
              {/* Left: Receptive Field 2D Map */}
              <div className="col-span-6 flex flex-col items-center">
                <div className="text-[9px] font-mono text-slate-400 mb-1">
                  V1 단순세포(Simple Cell) 수용장
                </div>

                <div className="relative w-32 h-32 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {/* Rotating Receptive Field Bar matching current Gabor angle */}
                  <motion.div
                    animate={{ rotate: activeOrientation.angle }}
                    transition={{ duration: 0.4 }}
                    className="relative w-28 h-28 flex items-center justify-center"
                  >
                    {/* Inhibitory surround (-) */}
                    <div className="absolute inset-0 bg-blue-950/60 rounded-xl" />
                    
                    {/* Left flank (-) */}
                    <div className="absolute left-3 inset-y-2 w-5 bg-blue-600/40 border-r border-blue-400/50 flex items-center justify-center text-[10px] text-blue-200 font-bold">
                      -
                    </div>

                    {/* Excitatory center (+) */}
                    <div className="absolute inset-y-2 w-8 bg-amber-500/80 border-x border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center text-[11px] text-white font-extrabold">
                      +
                    </div>

                    {/* Right flank (-) */}
                    <div className="absolute right-3 inset-y-2 w-5 bg-blue-600/40 border-l border-blue-400/50 flex items-center justify-center text-[10px] text-blue-200 font-bold">
                      -
                    </div>
                  </motion.div>
                </div>

                <div className="text-[9px] text-amber-400 font-semibold mt-1">
                  선택 각도: {activeOrientation.angle}° ({activeOrientation.label})
                </div>
              </div>

              {/* Right: Action Potential Oscilloscope Spike Train */}
              <div className="col-span-6 space-y-2 text-[10px]">
                <div className="text-slate-300 font-bold flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>대뇌 시각 신경 발화율(Spikes)</span>
                </div>

                {/* Oscilloscope canvas representation */}
                <div className="h-16 bg-slate-950 rounded-xl border border-slate-800 p-2 relative flex items-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 140 40" fill="none">
                    {/* Baseline */}
                    <line x1="0" y1="20" x2="140" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                    {/* Action Potential Spikes */}
                    <motion.path
                      d="M 5,20 L 15,20 L 18,3 L 21,35 L 24,20 L 40,20 L 43,5 L 46,33 L 49,20 L 65,20 L 68,2 L 71,36 L 74,20 L 90,20 L 93,4 L 96,34 L 99,20 L 115,20 L 118,3 L 121,35 L 124,20 L 135,20"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      animate={{ x: [-10, 0] }}
                      transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[9px]">
                    <span>방향 선택성(Tuning SNR):</span>
                    <span className="font-mono text-emerald-400 font-bold">{actionPotentialHz} Hz</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[9px]">
                    <span>노벨생리의학상:</span>
                    <span className="text-slate-300">휴블-비셀(Hubel & Wiesel)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Telemetry Dashboard Bar */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">현재 대비 장벽:</span>
            <span className="text-amber-400 font-mono font-bold">{Math.round(contrast * 100)}%</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">최소 인지 한계: <strong className="text-white font-mono">{bestContrast === 1.0 ? "-" : `${Math.round(bestContrast * 100)}%`}</strong></span>
            <span className="text-slate-400">시각 점수: <strong className="text-emerald-400 font-mono">{score}점</strong></span>
          </div>
        </div>
      </div>

      {/* Orientation Selection Buttons */}
      <div className={`w-full max-w-md ${isFullscreen ? "mt-2" : "space-y-1.5"}`}>
        <div className={`text-center text-[11px] font-bold ${isFullscreen ? "text-slate-400" : "text-slate-500"} uppercase tracking-wider mb-1.5`}>
          {isPlaying
            ? isFullscreen
              ? "관찰되는 줄무늬 방향을 클릭하거나 단축키(↑, →, ↓, ←)를 누르세요"
              : "관찰되는 줄무늬의 방향을 클릭하세요"
            : "준비 후 아래 훈련 시작을 누르세요"}
        </div>
        <div className="grid grid-cols-4 gap-2.5" id="gabor-button-grid">
          {ORIENTATIONS.map((orient, idx) => (
            <button
              key={idx}
              disabled={!isPlaying}
              onClick={() => handleSelection(idx)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                isPlaying
                  ? isFullscreen
                    ? "bg-slate-900/90 hover:bg-rose-950/80 hover:border-rose-500 border-slate-700 text-white shadow-lg active:scale-95 cursor-pointer"
                    : "bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border-slate-200 text-slate-800 active:scale-95 cursor-pointer shadow-xs"
                  : isFullscreen
                  ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span className="text-2xl font-bold font-sans h-7 flex items-center">{orient.icon}</span>
              <span className="text-[10px] mt-0.5 text-slate-400 font-medium whitespace-nowrap">{orient.label}</span>
              {isFullscreen && <span className="text-[9px] font-mono text-rose-400 font-bold opacity-80">[{orient.key.replace("Arrow", "")}]</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls & Scientific Context (only in standard view) */}
      {!isFullscreen && (
        <>
          <div className="flex items-center space-x-6 w-full max-w-sm justify-between pt-1">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">남은 훈련 시간</div>
              <div className="text-2xl font-mono font-bold text-slate-800">
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                id="step4-play-btn"
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all cursor-pointer ${
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
                id="step4-reset-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50/70 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>뇌과학 팩트:</strong> 가보 패치(Gabor Patch)는 대뇌 시각 피질의 단순세포 수용장과 수학적으로 완벽히 일치하는 자극원입니다. UC 버클리 및 이스라엘 인지 연구에 따르면, 미세 대비 판별 훈련을 거치면 뇌가 흐릿한 시각 입력 신호 속에서 잡음(Noise)을 걸러내는 뇌 가소성(Neuroplasticity)이 촉진되어 실제 시각 선명도가 눈에 띄게 개선됩니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
