import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Eye, Sparkles, Layers, ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step1Props {
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

type Phase = "BLINK" | "SQUEEZE" | "OPEN";
type ViewMode = "REALISTIC_FRONT" | "ANATOMY_SECTION";

export default function Step1BlinkSqueeze({
  isActive,
  onComplete,
  speak,
  isFullscreen = false,
  onRunningChange,
  onStateUpdate,
  playTrigger,
  resetTrigger,
}: Step1Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [phase, setPhase] = useState<Phase>("BLINK");
  const [phaseSeconds, setPhaseSeconds] = useState(2);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("REALISTIC_FRONT");
  const [lipidOutput, setLipidOutput] = useState(20); // 0 to 100%

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
      phaseInfo: `${repsCompleted}/10회 · ${getPhaseLabel()}`,
      extraInfo: `지질 분비 활성도 ${lipidOutput}%`,
    });
  }, [isPlaying, secondsLeft, repsCompleted, phase, lipidOutput]);

  // Voice coaching on phase changes (concise, natural cues that never cut off)
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (!isPlaying) {
      isInitialMountRef.current = true;
      return;
    }

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (secondsLeft === 60) {
        speak("1단계: 마이봄샘 윤활 운동을 시작합니다. 가볍게 감기");
        return;
      }
    }

    if (phase === "BLINK") {
      speak("가볍게 감기");
    } else if (phase === "SQUEEZE") {
      speak("지그시 압박");
    } else if (phase === "OPEN") {
      speak("크게 뜨기");
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
            speak("마이봄샘 자극 운동이 완료되었습니다. 눈물막 지질층이 안정화되었습니다.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            setPhase((curr) => {
              if (curr === "BLINK") {
                return "SQUEEZE";
              }
              if (curr === "SQUEEZE") {
                setLipidOutput((l) => Math.min(100, l + 8));
                return "OPEN";
              }
              setRepsCompleted((r) => Math.min(10, r + 1));
              return "BLINK";
            });
            return 2; // 2 seconds each
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
      setLipidOutput(25);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setPhase("BLINK");
    setPhaseSeconds(2);
    setRepsCompleted(0);
    setLipidOutput(25);
  };

  const getPhaseColor = () => {
    if (phase === "BLINK") return "bg-sky-700 text-white";
    if (phase === "SQUEEZE") return "bg-amber-600 text-white";
    return "bg-emerald-600 text-white";
  };

  const getPhaseLabel = () => {
    if (phase === "BLINK") return "1/3 동작: 가볍게 감기 (Gentle Blink)";
    if (phase === "SQUEEZE") return "2/3 동작: 지그시 압박 (Firm Squeeze)";
    return "3/3 동작: 크게 뜨기 (Open Wide & Spread)";
  };

  const getPhaseDesc = () => {
    if (phase === "BLINK") return "① 가볍게 감기: 눈의 긴장을 풀고 부드럽게 위아래 눈꺼풀을 맞닿게 합니다. (2초)";
    if (phase === "SQUEEZE") return "② 지그시 압박: 눈을 감은 채 안륜근을 수축시켜 검판 속 마이봄샘(기름샘)을 짜냅니다. (2초)";
    return "③ 크게 뜨기: 눈을 활짝 떠서 짜낸 신선한 지질막을 각막 눈물층 전체에 코팅합니다. (2초)";
  };

  // Parametric eyelid curve point: t in [0, 1] from inner canthus (35, 100) to outer canthus (285, 100)
  const getLidPoint = (t: number, yCtrl: number) => {
    const x = 35 + 250 * t;
    const y = 100 + 2 * (yCtrl - 100) * t * (1 - t);
    return { x, y };
  };

  // Eyelid control points based on phase
  const yUpperCtrl = phase === "OPEN" ? 12 : phase === "BLINK" ? 104 : 102;
  const yLowerCtrl = phase === "OPEN" ? 176 : phase === "BLINK" ? 104 : 102;

  // 16 Meibomian gland orifice ratios along lid margin
  const glandRatios = [0.12, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42, 0.47, 0.53, 0.58, 0.63, 0.68, 0.73, 0.78, 0.83, 0.88];
  // Eyelash ratios
  const upperLashRatios = [0.14, 0.2, 0.26, 0.32, 0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8, 0.86];
  const lowerLashRatios = [0.18, 0.25, 0.32, 0.39, 0.46, 0.54, 0.61, 0.68, 0.75, 0.82];

  return (
    <div
      id="step-1-container"
      className={
        isFullscreen
          ? "w-full h-full flex flex-col items-center justify-center bg-transparent border-0 rounded-none shadow-none p-2 sm:p-4 text-white"
          : "flex flex-col items-center space-y-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      }
    >
      {/* Top Header */}
      {!isFullscreen ? (
        <div className="text-center space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              <h3 className="text-base font-bold text-slate-800" id="step1-header-title">
                1단계: 마이봄샘 자극 및 눈물막 안정화
              </h3>
            </div>

            {/* Realistic View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("REALISTIC_FRONT")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === "REALISTIC_FRONT"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                실사 안구 뷰
              </button>
              <button
                onClick={() => setViewMode("ANATOMY_SECTION")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === "ANATOMY_SECTION"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                마이봄샘 단면도
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-left">
            스마트폰 화면을 볼 때 눈 깜빡임이 1/3로 줄어 마이봄샘이 막힙니다. 10회 루프로 고착된 기름샘을 뚫어 수분 증발을 막습니다.
          </p>

          {/* 3-Step Sequence Flow Indicator: ① 가볍게 감기 ➔ ② 지그시 압박 ➔ ③ 크게 뜨기 */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs mt-1">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
                  phase === "BLINK"
                    ? "bg-sky-600 text-white font-bold shadow-xs scale-102"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[10px] flex items-center justify-center">1</span>
                <span>가볍게 감기 (2초)</span>
              </div>

              <span className="text-slate-400 font-bold text-[11px]">➔</span>

              <div
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
                  phase === "SQUEEZE"
                    ? "bg-amber-600 text-white font-bold shadow-xs scale-102"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[10px] flex items-center justify-center">2</span>
                <span>지그시 압박 (2초)</span>
              </div>

              <span className="text-slate-400 font-bold text-[11px]">➔</span>

              <div
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
                  phase === "OPEN"
                    ? "bg-emerald-600 text-white font-bold shadow-xs scale-102"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[10px] flex items-center justify-center">3</span>
                <span>크게 뜨기 (2초)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 hidden md:block">
              * 눈을 감은 상태에서만 기름샘 압박이 가능합니다
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">{getPhaseDesc()}</span>
          </div>

          {/* Fullscreen 3-Step Sequence Flow HUD */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
            <span className={phase === "BLINK" ? "text-sky-400 font-bold" : "text-slate-500"}>① 감기</span>
            <span className="text-slate-600 font-bold">➔</span>
            <span className={phase === "SQUEEZE" ? "text-amber-400 font-bold" : "text-slate-500"}>② 지그시 압박</span>
            <span className="text-slate-600 font-bold">➔</span>
            <span className={phase === "OPEN" ? "text-emerald-400 font-bold" : "text-slate-500"}>③ 크게 뜨기</span>
          </div>

          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("REALISTIC_FRONT")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "REALISTIC_FRONT" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              실사 안구 뷰
            </button>
            <button
              onClick={() => setViewMode("ANATOMY_SECTION")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "ANATOMY_SECTION" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              마이봄샘 단면도
            </button>
          </div>
        </div>
      )}

      {/* Main Realistic Simulation Viewport */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-180px)] min-h-[460px]" : "h-72"
        } bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none`}
        id="step1-visual-canvas"
      >
        {/* Phase Badge */}
        <div className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-300 z-30 ${getPhaseColor()}`}>
          {getPhaseLabel()}
        </div>

        {/* Repetition Indicator */}
        <div className="absolute top-3 right-4 text-xs font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 backdrop-blur-xs flex items-center space-x-2 z-30">
          <span className="text-slate-400">루프 완료:</span>
          <span className="font-bold text-amber-400">{repsCompleted}/10회</span>
        </div>

        {/* VIEW A: REALISTIC FRONTAL HUMAN EYE */}
        {viewMode === "REALISTIC_FRONT" && (
          <div className={`relative ${isFullscreen ? "w-[560px] h-[350px] max-w-full" : "w-80 h-52"} flex items-center justify-center transition-all duration-300`}>
            {/* SVG Base Eye Rendering */}
            <svg
              className="w-full h-full drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)] rounded-2xl overflow-hidden"
              viewBox="0 0 320 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Face skin base background */}
                <linearGradient id="faceSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D99B75" />
                  <stop offset="25%" stopColor="#EAB390" />
                  <stop offset="50%" stopColor="#F5C6A7" />
                  <stop offset="75%" stopColor="#EAB390" />
                  <stop offset="100%" stopColor="#D08E66" />
                </linearGradient>

                {/* Sclera realistic gradient */}
                <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#F8FAFC" />
                  <stop offset="90%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </radialGradient>

                {/* Sclera 3D sphere depth shadow */}
                <radialGradient id="scleraShadow" cx="50%" cy="50%" r="52%">
                  <stop offset="65%" stopColor="transparent" />
                  <stop offset="90%" stopColor="rgba(100, 116, 139, 0.28)" />
                  <stop offset="100%" stopColor="rgba(15, 23, 42, 0.5)" />
                </radialGradient>

                {/* Iris realistic multi-depth gradient */}
                <radialGradient id="irisGrad" cx="50%" cy="48%" r="50%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="20%" stopColor="#0284C7" />
                  <stop offset="50%" stopColor="#0369A1" />
                  <stop offset="80%" stopColor="#075985" />
                  <stop offset="96%" stopColor="#082F49" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                {/* Pupil deep shadow */}
                <radialGradient id="pupilGrad" cx="45%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#000000" />
                </radialGradient>

                {/* Upper eyelid skin tone */}
                <linearGradient id="skinUpper" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CF926B" />
                  <stop offset="60%" stopColor="#DFAB85" />
                  <stop offset="92%" stopColor="#C68960" />
                  <stop offset="100%" stopColor="#A86E45" />
                </linearGradient>

                {/* Lower eyelid skin tone */}
                <linearGradient id="skinLower" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A86E45" />
                  <stop offset="10%" stopColor="#C68960" />
                  <stop offset="45%" stopColor="#DFAB85" />
                  <stop offset="100%" stopColor="#CF926B" />
                </linearGradient>

                {/* Tear film glistening highlight */}
                <linearGradient id="tearFilm" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(254, 240, 138, 0.55)" />
                  <stop offset="45%" stopColor="rgba(56, 189, 248, 0.38)" />
                  <stop offset="100%" stopColor="rgba(192, 132, 252, 0.35)" />
                </linearGradient>

                {/* Meibomian lipid drop glow filter */}
                <filter id="dropGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Eye socket boundary clip */}
                <clipPath id="orbitClip">
                  <ellipse cx="160" cy="100" rx="126" ry="60" />
                </clipPath>
              </defs>

              {/* 1. LAYER 1: Face Skin Base (Eliminates all dark borders and jagged edges) */}
              <rect x="0" y="0" width="320" height="200" fill="url(#faceSkin)" />

              {/* Orbital hollow shadow */}
              <ellipse cx="160" cy="98" rx="132" ry="64" fill="rgba(139, 92, 60, 0.22)" />

              {/* 2. LAYER 2: Eyeball (Sclera + Iris + Pupil + Reflections inside Eye Socket) */}
              <g clipPath="url(#orbitClip)">
                {/* Sclera White of Eye */}
                <rect x="30" y="38" width="260" height="124" fill="url(#scleraGrad)" />

                {/* 3D Spherical Volume Shading */}
                <rect x="30" y="38" width="260" height="124" fill="url(#scleraShadow)" />

                {/* Conjunctival Fine Micro-capillaries (미세 결막 모세혈관) */}
                <path d="M 45,98 Q 65,92 88,96 T 115,93" stroke="#F43F5E" strokeWidth="0.8" opacity="0.45" fill="none" />
                <path d="M 52,104 Q 72,108 95,102 T 120,105" stroke="#FDA4AF" strokeWidth="0.7" opacity="0.55" fill="none" />
                <path d="M 275,98 Q 252,92 230,95 T 205,92" stroke="#F43F5E" strokeWidth="0.8" opacity="0.45" fill="none" />
                <path d="M 268,104 Q 248,107 225,103 T 200,106" stroke="#FDA4AF" strokeWidth="0.7" opacity="0.55" fill="none" />

                {/* Iris (홍채) */}
                <circle cx="160" cy="97" r="41" fill="url(#irisGrad)" stroke="#082F49" strokeWidth="2" />

                {/* Radial Iris Stroma Fibers (정교한 홍채 실 구조) */}
                {[...Array(24)].map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x1 = 160 + Math.cos(angle) * 18;
                  const y1 = 97 + Math.sin(angle) * 18;
                  const x2 = 160 + Math.cos(angle) * 38;
                  const y2 = 97 + Math.sin(angle) * 38;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i % 2 === 0 ? "#7DD3FC" : "#38BDF8"}
                      strokeWidth={i % 3 === 0 ? "1.2" : "0.7"}
                      opacity="0.65"
                    />
                  );
                })}

                {/* Pupillary Border Collarette */}
                <circle cx="160" cy="97" r="17" fill="none" stroke="#0C4A6E" strokeWidth="1.8" opacity="0.75" />

                {/* Pupil (동공) */}
                <circle cx="160" cy="97" r="15" fill="url(#pupilGrad)" />

                {/* Specular Corneal Highlights (각막 반사광) */}
                <ellipse cx="148" cy="85" rx="8" ry="5" fill="#FFFFFF" opacity="0.95" transform="rotate(-22 148 85)" />
                <circle cx="168" cy="108" r="2.8" fill="#FFFFFF" opacity="0.65" />

                {/* Tear Film Lipid Layer spreading sheen on OPEN */}
                {phase === "OPEN" && (
                  <motion.ellipse
                    cx="160"
                    cy="97"
                    rx="120"
                    ry="55"
                    fill="url(#tearFilm)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.75, 0.45] }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
                  />
                )}
              </g>

              {/* 3. LAYER 3: DYNAMIC UPPER EYELID */}
              <motion.path
                animate={{
                  d:
                    phase === "OPEN"
                      ? "M 0,0 L 320,0 L 320,100 L 285,100 Q 160,12 35,100 L 0,100 Z"
                      : phase === "BLINK"
                      ? "M 0,0 L 320,0 L 320,100 L 285,100 Q 160,104 35,100 L 0,100 Z"
                      : "M 0,0 L 320,0 L 320,100 L 285,100 Q 160,102 35,100 L 0,100 Z",
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                fill="url(#skinUpper)"
                stroke="#6B4226"
                strokeWidth="1.2"
              />

              {/* 4. LAYER 4: DYNAMIC LOWER EYELID */}
              <motion.path
                animate={{
                  d:
                    phase === "OPEN"
                      ? "M 0,200 L 320,200 L 320,100 L 285,100 Q 160,176 35,100 L 0,100 Z"
                      : phase === "BLINK"
                      ? "M 0,200 L 320,200 L 320,100 L 285,100 Q 160,104 35,100 L 0,100 Z"
                      : "M 0,200 L 320,200 L 320,100 L 285,100 Q 160,102 35,100 L 0,100 Z",
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                fill="url(#skinLower)"
                stroke="#6B4226"
                strokeWidth="1.2"
              />

              {/* Supratarsal Crease / Eyelid Fold (자연스러운 쌍꺼풀 주름) */}
              <motion.path
                animate={{
                  d:
                    phase === "OPEN"
                      ? "M 48,88 Q 160,36 272,88"
                      : phase === "BLINK"
                      ? "M 48,92 Q 160,78 272,92"
                      : "M 48,94 Q 160,74 272,94",
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                stroke="#8A512C"
                strokeWidth="1.5"
                opacity="0.65"
                fill="none"
              />

              {/* Medial Canthus / Caruncle (내안각 눈물언덕 / Tear duct) */}
              <path d="M 35,100 C 31,95 24,96 26,101 C 28,105 32,104 35,100 Z" fill="#F43F5E" opacity="0.85" />
              <circle cx="29" cy="100.5" r="2.2" fill="#FDA4AF" opacity="0.9" />

              {/* 5. LAYER 5: MEIBOMIAN GLAND ORIFICES & SECRETIONS */}
              <g id="meibomian-glands-layer">
                {glandRatios.map((t, idx) => {
                  const upperPt = getLidPoint(t, yUpperCtrl);
                  const lowerPt = getLidPoint(t, yLowerCtrl);

                  return (
                    <g key={`gland-${idx}`}>
                      {/* Upper orifice along upper lid margin */}
                      <circle
                        cx={upperPt.x}
                        cy={upperPt.y + (phase === "OPEN" ? 1.2 : -0.5)}
                        r="1.2"
                        fill="#FEF08A"
                        opacity="0.9"
                      />

                      {/* Lower orifice along lower lid margin */}
                      <circle
                        cx={lowerPt.x}
                        cy={lowerPt.y + (phase === "OPEN" ? -1.2 : 0.5)}
                        r="1.2"
                        fill="#FEF08A"
                        opacity="0.9"
                      />

                      {/* SQUEEZE: Golden Lipid Droplets (마이봄샘 기름 분비물) beading up */}
                      {phase === "SQUEEZE" && idx % 2 === 0 && (
                        <motion.circle
                          cx={upperPt.x}
                          cy={upperPt.y}
                          r={2.4}
                          fill="#FBBF24"
                          filter="url(#dropGlow)"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [1, 1.45, 1.2], opacity: [0.85, 1, 0.9] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: (idx % 4) * 0.15 }}
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 6. LAYER 6: EYELASHES (속눈썹 - Lid Curve Normal Vector Alignment) */}
              <g id="eyelashes-layer">
                {/* Upper Lashes */}
                {upperLashRatios.map((t, idx) => {
                  const root = getLidPoint(t, yUpperCtrl);
                  const dx = (t - 0.5) * 16;
                  const dy = phase === "OPEN" ? 14 : 7;
                  return (
                    <path
                      key={`upper-lash-${idx}`}
                      d={`M ${root.x},${root.y} Q ${root.x + dx * 0.45},${root.y - dy * 0.7} ${root.x + dx},${root.y - dy}`}
                      stroke="#1A1816"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />
                  );
                })}

                {/* Lower Lashes */}
                {lowerLashRatios.map((t, idx) => {
                  const root = getLidPoint(t, yLowerCtrl);
                  const dx = (t - 0.5) * 10;
                  const dy = phase === "OPEN" ? 8 : 4;
                  return (
                    <path
                      key={`lower-lash-${idx}`}
                      d={`M ${root.x},${root.y} Q ${root.x + dx * 0.45},${root.y + dy * 0.7} ${root.x + dx},${root.y + dy}`}
                      stroke="#1A1816"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  );
                })}
              </g>

              {/* 7. LAYER 7: SQUEEZE TENSION WRINKLES & CROW'S FEET */}
              {phase === "SQUEEZE" && (
                <g stroke="#8A4A24" strokeWidth="1.2" opacity="0.65" strokeLinecap="round">
                  {/* Lateral crow's feet (눈가 주름) */}
                  <path d="M 285,100 L 305,94" />
                  <path d="M 285,100 L 310,101" />
                  <path d="M 285,100 L 304,108" />

                  {/* Medial tension lines */}
                  <path d="M 35,100 L 16,95" />
                  <path d="M 35,100 L 14,103" />

                  {/* Eyelid contraction creases */}
                  <path d="M 120,78 Q 160,84 200,78" fill="none" />
                  <path d="M 125,124 Q 160,118 195,124" fill="none" />
                </g>
              )}

              {/* 8. LAYER 8: SCIENTIFIC LIPID LAYER SPREAD NOTICE ON OPEN */}
              {phase === "OPEN" && (
                <g>
                  <rect
                    x="45"
                    y="172"
                    width="230"
                    height="20"
                    rx="10"
                    fill="rgba(15, 23, 42, 0.75)"
                    stroke="rgba(251, 191, 36, 0.6)"
                    strokeWidth="1"
                  />
                  <text
                    x="160"
                    y="186"
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontWeight="bold"
                    letterSpacing="0.3"
                  >
                    ✨ 마이봄샘 지질층 코팅 완료 (눈물 수분 증발 차단)
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* VIEW B: ANATOMICAL SAGITTAL CROSS-SECTION */}
        {viewMode === "ANATOMY_SECTION" && (
          <div className="relative w-full max-w-xs h-56 flex flex-col items-center justify-center text-xs">
            <svg className="w-full h-full" viewBox="0 0 280 180" fill="none">
              {/* Cornea surface arc */}
              <path d="M 50,10 C 130,50 130,130 50,170" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" opacity="0.7" fill="none" />
              <text x="30" y="95" fill="#38BDF8" fontSize="10" fontWeight="bold">각막(Cornea)</text>

              {/* Tear film 3 layers */}
              {/* 1. Mucin Layer (Closest to epithelium) */}
              <path d="M 54,20 C 134,56 134,124 54,160" stroke="#A78BFA" strokeWidth="2.5" fill="none" opacity="0.8" />
              {/* 2. Aqueous Layer (Middle, thickest) */}
              <path d="M 57,20 C 137,56 137,124 57,160" stroke="#60A5FA" strokeWidth="4" fill="none" opacity="0.9" />
              {/* 3. Lipid Layer (Outermost, prevents evaporation) */}
              <motion.path
                d="M 61,20 C 141,56 141,124 61,160"
                stroke="#FBBF24"
                strokeWidth={phase === "SQUEEZE" || phase === "OPEN" ? "4.5" : "2"}
                fill="none"
                animate={{ opacity: phase === "OPEN" ? [0.6, 1, 0.7] : 0.8 }}
                transition={{ duration: 1, repeat: Infinity }}
              />

              {/* Upper Eyelid & Meibomian Glands Cross section */}
              <path d="M 120,15 L 250,15 L 250,75 L 140,75 Z" fill="#D4A373" stroke="#854D0E" strokeWidth="1.5" />
              {/* Tarsus (검판) */}
              <rect x="150" y="25" width="80" height="40" rx="6" fill="#FDE68A" opacity="0.7" />
              <text x="165" y="48" fill="#854D0E" fontSize="9" fontWeight="bold">검판(Tarsus)</text>

              {/* Meibomian Acini & Ducts (기름샘 관상 구조) */}
              <g id="meibomian-tubes">
                <line x1="180" y1="28" x2="145" y2="72" stroke="#B45309" strokeWidth="2.5" />
                <circle cx="178" cy="35" r="4" fill="#F59E0B" />
                <circle cx="170" cy="46" r="4.5" fill="#F59E0B" />
                <circle cx="160" cy="58" r="4" fill="#F59E0B" />
                <circle cx="146" cy="72" r="3" fill="#FBBF24" /> {/* Orifice at lid margin */}
              </g>

              {/* Muscle compression arrow on SQUEEZE */}
              {phase === "SQUEEZE" ? (
                <g>
                  <motion.path
                    d="M 210,12 L 210,24"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.path
                    d="M 210,80 L 210,68"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <text x="140" y="110" fill="#FBBF24" fontSize="10" fontWeight="bold">
                    안륜근 수축 ➔ 지질(기름) 분비 촉진!
                  </text>
                </g>
              ) : (
                <text x="145" y="115" fill="#94A3B8" fontSize="9">
                  마이봄샘 (Meibomian Gland)
                </text>
              )}

              {/* Tear film label legend */}
              <g transform="translate(140, 130)">
                <circle cx="5" cy="5" r="3" fill="#FBBF24" />
                <text x="12" y="8" fill="#FBBF24" fontSize="8" fontWeight="bold">지질층 (기름/증발억제)</text>

                <circle cx="5" cy="18" r="3" fill="#60A5FA" />
                <text x="12" y="21" fill="#60A5FA" fontSize="8">수성층 (눈물 수분/산소)</text>

                <circle cx="5" cy="30" r="3" fill="#A78BFA" />
                <text x="12" y="33" fill="#A78BFA" fontSize="8">점액층 (각막 흡착)</text>
              </g>
            </svg>
          </div>
        )}

        {/* Real-time Physiological Gauges */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">지질 분비 활성도:</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${lipidOutput}%` }}
              />
            </div>
            <span className="text-amber-400 font-mono font-bold">{lipidOutput}%</span>
          </div>

          <div className="text-slate-400 font-medium hidden sm:flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>수분 증발 지연율:</span>
            <span className="text-emerald-400 font-bold font-mono">
              +{Math.min(95, Math.round(lipidOutput * 0.95))}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Footnote (only in standard view) */}
      {!isFullscreen && (
        <>
          {/* Description of current phase */}
          <div className="w-full text-center px-2">
            <p className="text-xs font-semibold text-slate-700">
              {getPhaseDesc()}
            </p>
          </div>

          {/* Control Actions & Timer */}
          <div className="flex items-center space-x-6 w-full max-w-sm justify-between pt-1">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">남은 시간</div>
              <div className="text-2xl font-mono font-bold text-slate-800">
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                id="step1-play-btn"
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
                id="step1-reset-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scientific footnote */}
          <div className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50/70 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>안과학 팩트:</strong> 눈물은 단순히 물이 아니라 <em>지질층-수성층-점액층</em>의 복합체입니다. 위 실사 시뮬레이션처럼 눈꺼풀 가장자리의 20~30개 마이봄샘 구멍에서 맑은 기름이 나와 덮어주지 않으면, 눈물은 2~3초 만에 증발해 각막 상피에 미세 스크래치와 뻑뻑함을 유발합니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
