import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Compass, Sparkles, Eye, Info, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step2Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
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

type AccomState = "NEAR" | "FAR";
type ViewMode = "ANATOMY_OPTICS" | "FIELD_OF_VIEW";

const LETTERS = ["E", "Ш", "M", "W", "C", "O", "A", "8", "5"];

export default function Step2Accommodative({
  isActive,
  onComplete,
  speak,
  isFullscreen = false,
  onRunningChange,
  onStateUpdate,
  playTrigger,
  resetTrigger,
}: Step2Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [focusState, setFocusState] = useState<AccomState>("NEAR");
  const [cycleSeconds, setCycleSeconds] = useState(5);
  const [currentLetter, setCurrentLetter] = useState("E");
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("ANATOMY_OPTICS");

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

  // Notify parent of state changes
  useEffect(() => {
    onRunningChange?.(isPlaying);
    onStateUpdate?.({
      isPlaying,
      secondsLeft,
      totalSeconds: 60,
      phaseInfo: `${cyclesCompleted}/6회 교대 · ${focusState === "NEAR" ? "근거리 모양체 수축" : "원거리 모양체 이완"}`,
      extraInfo: `전환까지 ${cycleSeconds}초`,
    });
  }, [isPlaying, secondsLeft, cyclesCompleted, focusState, cycleSeconds]);

  // Trigger speech on step initiation
  useEffect(() => {
    if (isActive && isPlaying) {
      speak(
        "두 번째 단계인 조절 피로 완화 훈련을 시작합니다. 안구 내부 모양체 근육의 수축과 이완 광학 메커니즘을 확인하며 초점을 교대로 전환하십시오."
      );
    }
  }, [isActive]);

  // Voice coaching on focus shift
  useEffect(() => {
    if (!isPlaying) return;

    if (focusState === "NEAR") {
      speak("가까운 초점 집중");
    } else {
      speak("먼 곳 이완, 힘 빼기");
    }
  }, [focusState, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak("조절 피로 완화 훈련이 성공적으로 끝났습니다. 모양체 근육의 긴장이 해소되었습니다.");
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
                const randIndex = Math.floor(Math.random() * LETTERS.length);
                setCurrentLetter(LETTERS[randIndex]);
                setCyclesCompleted((c) => c + 1);
              }
              return nextState;
            });
            return 5; // 5-second alternating cycles
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
    <div
      id="step-2-container"
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <h3 className="text-base font-bold text-slate-800" id="step2-header-title">
                2단계: 모양체 근육 이완 및 조절 피로 완화
              </h3>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("ANATOMY_OPTICS")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "ANATOMY_OPTICS"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                안구 광학 단면
              </button>
              <button
                onClick={() => setViewMode("FIELD_OF_VIEW")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "FIELD_OF_VIEW"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                실제 시야 체험
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-left">
            근거리 작업 시 안구 내 <em>모양체(Ciliary Muscle)</em>는 쉬지 않고 쥐어짜여 경련이 일어납니다. 원근 교대 주시로 수정체 조절 탄성을 복구합니다.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                focusState === "NEAR" ? "bg-amber-400" : "bg-teal-400"
              } animate-pulse`}
            />
            <span className="text-slate-300 font-semibold">
              {focusState === "NEAR"
                ? "화면 중앙의 글자에 초점을 또렷이 맞추십시오 (근거리 조절 수축)"
                : "화면 너머 먼 곳을 멍하니 바라보며 긴장을 푸십시오 (원거리 조절 이완)"}
            </span>
          </div>

          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("ANATOMY_OPTICS")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "ANATOMY_OPTICS" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              광학 단면
            </button>
            <button
              onClick={() => setViewMode("FIELD_OF_VIEW")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "FIELD_OF_VIEW" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              시야 체험
            </button>
          </div>
        </div>
      )}

      {/* Visual Workspace Container */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-180px)] min-h-[460px]" : "h-72"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none`}
        id="step2-visual-canvas"
      >
        {/* Dynamic Focus State Badge */}
        <div
          className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-300 ${
            focusState === "NEAR"
              ? "bg-amber-600 text-white"
              : "bg-teal-600 text-white"
          }`}
        >
          {focusState === "NEAR"
            ? "근거리 집중 모드 (30cm 응시 · 모양체 수축)"
            : "원거리 이완 모드 (6m+ 응시 · 모양체 이완)"}
        </div>

        {/* Counter */}
        <div className="absolute top-3 right-4 text-xs font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 backdrop-blur-xs flex items-center space-x-2">
          <span className="text-slate-400">교대 완료:</span>
          <span className="font-bold text-white">{cyclesCompleted}/6회</span>
        </div>

        {/* VIEW A: REALISTIC OCULAR OPTICS & RAY TRACING */}
        {viewMode === "ANATOMY_OPTICS" && (
          <div className="relative w-full max-w-sm h-52 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 340 190"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Eyeball glow */}
                <radialGradient id="retinaGrad" cx="90%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#991B1B" stopOpacity="0.4" />
                </radialGradient>

                {/* Vitreous Chamber subtle fill */}
                <radialGradient id="vitreousGrad" cx="60%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.4" />
                </radialGradient>
              </defs>

              {/* Eyeball outer shell (Sclera / Choroid / Retina) */}
              {/* Outer Sclera */}
              <path
                d="M 60,95 C 60,35 150,20 280,20 C 320,20 330,55 330,95 C 330,135 320,170 280,170 C 150,170 60,155 60,95 Z"
                stroke="#64748B"
                strokeWidth="4"
                fill="url(#vitreousGrad)"
              />
              {/* Retina inner layer (red/orange) */}
              <path
                d="M 120,30 C 180,26 270,26 315,50 C 326,65 328,125 315,140 C 270,164 180,164 120,160"
                stroke="#DC2626"
                strokeWidth="2.5"
                fill="none"
                opacity="0.85"
              />
              {/* Fovea centralis (황반 중심와) on retina */}
              <circle cx="328" cy="95" r="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
              <text x="280" y="115" fill="#FACC15" fontSize="8" fontWeight="bold">황반(Fovea)</text>

              {/* Cornea (전면 각막 돔) */}
              <path
                d="M 60,60 C 25,75 25,115 60,130"
                stroke="#38BDF8"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <text x="10" y="98" fill="#38BDF8" fontSize="8" fontWeight="bold">각막</text>

              {/* Iris (홍채 조리개 상/하) */}
              <path d="M 68,60 L 85,75" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 68,130 L 85,115" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />

              {/* CILIARY BODY & MUSCLE (모양체 상/하단) */}
              {/* Upper Ciliary Muscle */}
              <motion.path
                animate={{
                  d:
                    focusState === "NEAR"
                      ? "M 88,52 C 92,58 108,60 112,52 C 105,45 95,45 88,52 Z" // Thicker, contracted
                      : "M 88,48 C 92,52 108,54 112,48 C 105,44 95,44 88,48 Z", // Flatter, relaxed
                }}
                fill={focusState === "NEAR" ? "#F59E0B" : "#0D9488"}
                stroke="#FEF3C7"
                strokeWidth="1"
              />
              {/* Lower Ciliary Muscle */}
              <motion.path
                animate={{
                  d:
                    focusState === "NEAR"
                      ? "M 88,138 C 92,132 108,130 112,138 C 105,145 95,145 88,138 Z"
                      : "M 88,142 C 92,138 108,136 112,142 C 105,146 95,146 88,142 Z",
                }}
                fill={focusState === "NEAR" ? "#F59E0B" : "#0D9488"}
                stroke="#FEF3C7"
                strokeWidth="1"
              />
              <text x="120" y="48" fill={focusState === "NEAR" ? "#F59E0B" : "#2DD4BF"} fontSize="8" fontWeight="bold">
                {focusState === "NEAR" ? "모양체 수축(긴장)" : "모양체 이완(휴식)"}
              </text>

              {/* ZONULAR FIBERS (섬모체대/진대) */}
              {/* Upper fibers */}
              <motion.line
                x1="98"
                y1={focusState === "NEAR" ? "56" : "51"}
                x2="98"
                y2="72"
                stroke="#E2E8F0"
                strokeWidth={focusState === "NEAR" ? "1" : "2"}
                strokeDasharray={focusState === "NEAR" ? "2,2" : "none"}
                opacity="0.8"
              />
              {/* Lower fibers */}
              <motion.line
                x1="98"
                y1={focusState === "NEAR" ? "134" : "139"}
                x2="98"
                y2="118"
                stroke="#E2E8F0"
                strokeWidth={focusState === "NEAR" ? "1" : "2"}
                strokeDasharray={focusState === "NEAR" ? "2,2" : "none"}
                opacity="0.8"
              />

              {/* CRYSTALLINE LENS (수정체) - Bulges thick in NEAR, flattens in FAR */}
              <motion.ellipse
                cx="98"
                cy="95"
                animate={{
                  rx: focusState === "NEAR" ? 14 : 7, // Bulges from 7px to 14px!
                  ry: 24,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                fill="#38BDF8"
                fillOpacity="0.45"
                stroke="#BAE6FD"
                strokeWidth="2"
              />
              <text x="82" y="100" fill="#E0F2FE" fontSize="8" fontWeight="bold">수정체</text>

              {/* DYNAMIC OPTICAL RAY TRACING (빛의 굴절 광선) */}
              {/* Incoming Light Source: Object / Letter near or parallel far */}
              {focusState === "NEAR" ? (
                // Near Object Rays from 30cm target
                <g stroke="#FBBF24" strokeWidth="1.5" opacity="0.85">
                  {/* Point source object */}
                  <circle cx="5" cy="95" r="4" fill="#F59E0B" />
                  {/* Rays diverging from source to cornea */}
                  <line x1="5" y1="95" x2="45" y2="70" />
                  <line x1="5" y1="95" x2="40" y2="95" />
                  <line x1="5" y1="95" x2="45" y2="120" />
                  {/* Rays refracted through lens */}
                  <line x1="45" y1="70" x2="98" y2="74" />
                  <line x1="40" y1="95" x2="98" y2="95" />
                  <line x1="45" y1="120" x2="98" y2="116" />
                  {/* Rays strongly converging through thick lens to fovea */}
                  <line x1="98" y1="74" x2="328" y2="95" strokeWidth="2" />
                  <line x1="98" y1="95" x2="328" y2="95" strokeWidth="2" />
                  <line x1="98" y1="116" x2="328" y2="95" strokeWidth="2" />
                </g>
              ) : (
                // Parallel Rays from distant object (Infinity)
                <g stroke="#38BDF8" strokeWidth="1.5" opacity="0.85">
                  {/* Parallel rays entering cornea */}
                  <line x1="0" y1="75" x2="45" y2="75" />
                  <line x1="0" y1="95" x2="40" y2="95" />
                  <line x1="0" y1="115" x2="45" y2="115" />
                  {/* Refracted into thin lens */}
                  <line x1="45" y1="75" x2="98" y2="78" />
                  <line x1="40" y1="95" x2="98" y2="95" />
                  <line x1="45" y1="115" x2="98" y2="112" />
                  {/* Effortlessly converging onto fovea */}
                  <line x1="98" y1="78" x2="328" y2="95" strokeWidth="2" />
                  <line x1="98" y1="95" x2="328" y2="95" strokeWidth="2" />
                  <line x1="98" y1="112" x2="328" y2="95" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>
        )}

        {/* VIEW B: REALISTIC FIELD OF VIEW (Depth of Field Simulation) */}
        {viewMode === "FIELD_OF_VIEW" && (
          <div className="relative w-full max-w-sm h-52 flex items-center justify-center">
            {/* Background Landscape / Room */}
            <div
              className={`absolute inset-4 rounded-xl transition-all duration-700 bg-cover bg-center flex flex-col justify-end p-3 ${
                focusState === "NEAR"
                  ? "filter blur-md opacity-40 scale-105"
                  : "filter blur-none opacity-100 scale-100 border border-teal-500/50 shadow-lg"
              }`}
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #064e3b 100%)",
              }}
            >
              {/* Distant window / outdoor silhouette */}
              <div className="flex items-center justify-between text-teal-300">
                <span className="text-xs font-bold tracking-wider">원거리 (방 너머 / 창문 밖 6m+)</span>
                <span className="text-[10px] bg-teal-900/80 px-2 py-0.5 rounded border border-teal-700">
                  {focusState === "FAR" ? "초점 또렷함 (Sharp)" : "보케 흐림 (Bokeh)"}
                </span>
              </div>
              <p className="text-[10px] text-teal-200/80 mt-1">
                원거리 이완 시 눈동자에 힘을 빼고 멍하니 멀리 응시하십시오.
              </p>
            </div>

            {/* Foreground Mobile Screen / Macro Target */}
            <motion.div
              animate={{
                scale: focusState === "NEAR" ? 1 : 0.85,
                filter: focusState === "NEAR" ? "blur(0px)" : "blur(8px)",
                opacity: focusState === "NEAR" ? 1 : 0.35,
              }}
              transition={{ duration: 0.6 }}
              className="relative z-10 w-44 h-36 bg-slate-900/90 rounded-2xl border-2 border-amber-500/80 shadow-2xl flex flex-col items-center justify-center p-3 backdrop-blur-md"
            >
              <div className="text-[10px] font-bold text-amber-400 mb-1">
                근거리 타겟 (30cm)
              </div>
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-amber-400/50 flex items-center justify-center text-3xl font-mono font-extrabold text-white shadow-inner">
                {currentLetter}
              </div>
              <p className="text-[10px] text-slate-300 mt-2 font-medium">
                {focusState === "NEAR" ? "글씨의 윤곽을 응시하세요!" : "초점이 흐려집니다"}
              </p>
            </motion.div>
          </div>
        )}

        {/* Real-time Physiological Telemetry Bar */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">모양체 근육 긴장도:</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-700 ${
                  focusState === "NEAR" ? "bg-amber-500 w-[90%]" : "bg-teal-400 w-[8%]"
                }`}
              />
            </div>
            <span className={`font-mono font-bold ${focusState === "NEAR" ? "text-amber-400" : "text-teal-400"}`}>
              {focusState === "NEAR" ? "90% (수축)" : "8% (이완)"}
            </span>
          </div>

          <div className="text-slate-400 font-medium hidden sm:flex items-center space-x-1">
            <span>수정체 굴절력:</span>
            <span className="text-white font-bold font-mono">
              {focusState === "NEAR" ? "+14.0 D (두꺼움)" : "+0.5 D (얇음)"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Medical context (only in standard view) */}
      {!isFullscreen && (
        <>
          {/* Guide text */}
          <div className="w-full text-center px-2">
            <p className="text-xs font-semibold text-slate-700">
              {focusState === "NEAR"
                ? "화면 중앙의 글자에 초점을 또렷이 맞추며 모양체 근육의 유연한 조절력을 자극합니다."
                : "화면 너머 먼 벽면이나 창밖 풍경을 멍하니 바라보며 모양체 수축 긴장을 완전히 풀어줍니다."}
            </p>
          </div>

          {/* Action Controls */}
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
                id="step2-play-btn"
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
                id="step2-reset-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Medical Context */}
          <div className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50/70 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>안과학 팩트:</strong> 흔히 말하는 '가성 근시(Pseudomyopia)'나 컴퓨터 눈 피로는 안구 자체가 나빠진 것이 아니라, <strong>수정체를 당기는 모양체 근육이 장시간 수축된 채 쥐가 난 것(조절 경련)</strong>입니다. 이 훈련은 쥐가 난 근육을 스트레칭하여 조절 유연성을 되살립니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
