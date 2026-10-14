import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Eye, Heart, Info, Wind, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step5Props {
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

type BreathPhase = "INHALE" | "HOLD" | "EXHALE";
type ViewMode = "REALISTIC_VISTA" | "RELAXATION_GAUGE";

export default function Step5FarFocus({
  isActive,
  onComplete,
  speak,
  isFullscreen = false,
  onRunningChange,
  onStateUpdate,
  playTrigger,
  resetTrigger,
}: Step5Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(24);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("INHALE");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [viewMode, setViewMode] = useState<ViewMode>("REALISTIC_VISTA");
  const [parasympatheticTone, setParasympatheticTone] = useState(40); // 0-100%

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
      totalSeconds: 24,
      phaseInfo: `20-20-20 원거리 이완 (${breathPhase === "INHALE" ? "들숨" : breathPhase === "HOLD" ? "숨 멈춤" : "날숨"} ${breathSeconds}초)`,
      extraInfo: `부교감신경 긴장 완화도 ${parasympatheticTone}%`,
    });
  }, [isPlaying, secondsLeft, breathPhase, breathSeconds, parasympatheticTone]);

  // Voice coaching on breath phase changes
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (!isPlaying) {
      isInitialMountRef.current = true;
      return;
    }

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (secondsLeft === 24) {
        speak("5단계: 20-20-20 원거리 이완을 시작합니다. 먼 곳을 바라보며 깊게 들이마시기");
        return;
      }
    }

    if (breathPhase === "INHALE") {
      speak("깊게 들이마시기");
    } else if (breathPhase === "HOLD") {
      speak("숨 멈추고 먼 곳 응시");
    } else if (breathPhase === "EXHALE") {
      speak("편안하게 내쉬기");
    }
  }, [breathPhase, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setParasympatheticTone(95);
            speak("모든 5단계 안과학 기반 눈 운동이 성공적으로 완료되었습니다! 눈이 한결 맑고 시원해진 편안함을 만끽하십시오.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((curr) => {
              if (curr === "INHALE") return "HOLD";
              if (curr === "HOLD") return "EXHALE";
              setParasympatheticTone((p) => Math.min(95, p + 12));
              return "INHALE";
            });
            return 4;
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
    if (!isPlaying && secondsLeft === 24) {
      setBreathPhase("INHALE");
      setBreathSeconds(4);
      setParasympatheticTone(40);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(24);
    setBreathPhase("INHALE");
    setBreathSeconds(4);
    setParasympatheticTone(40);
  };

  const getBreathLabel = () => {
    if (breathPhase === "INHALE") return "들숨 (Inhale) · 4초 깊이 들이마시기";
    if (breathPhase === "HOLD") return "멈춤 (Hold) · 4초 멍하니 먼 곳 응시";
    return "날숨 (Exhale) · 4초 편안하게 끝까지 내쉬기";
  };

  const getBreathColor = () => {
    if (breathPhase === "INHALE") return "bg-indigo-600/90 text-white border-indigo-400";
    if (breathPhase === "HOLD") return "bg-teal-600/90 text-white border-teal-400";
    return "bg-sky-600/90 text-white border-sky-400";
  };

  return (
    <div
      id="step-5-container"
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
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              <h3 className="text-base font-bold text-slate-800" id="step5-header-title">
                5단계: 20-20-20 규칙 원거리 완전 이완 (Spasm Release)
              </h3>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("REALISTIC_VISTA")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "REALISTIC_VISTA"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                대기 원근 풍경
              </button>
              <button
                onClick={() => setViewMode("RELAXATION_GAUGE")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "RELAXATION_GAUGE"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                조절 이완도 모니터
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-left">
            미국 안과학회(AAO) 공식 권장: 20분마다 <strong>20피트(약 6미터)</strong> 떨어진 먼 곳을 20초간 바라보아 모양체 근육을 0D 기본 상태로 이완합니다.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">
              화면에서 시선을 돌려 6m 이상 먼 곳(창밖/벽)을 바라보며 깊게 심호흡하세요
            </span>
          </div>

          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("REALISTIC_VISTA")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "REALISTIC_VISTA" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              원근 풍경
            </button>
            <button
              onClick={() => setViewMode("RELAXATION_GAUGE")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "RELAXATION_GAUGE" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              이완 모니터
            </button>
          </div>
        </div>
      )}

      {/* Main Simulation Viewport */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-180px)] min-h-[460px]" : "h-72"
        } rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none`}
        id="step5-visual-canvas"
      >
        {/* VIEW A: REALISTIC ATMOSPHERIC VISTA WITH OPTICAL DEPTH OF FIELD */}
        {viewMode === "REALISTIC_VISTA" && (
          <div className="relative w-full h-full overflow-hidden">
            {/* SVG Sky & Mountains Landscape */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 400 240"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Atmospheric Sky Gradient */}
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="35%" stopColor="#38BDF8" />
                  <stop offset="70%" stopColor="#BAE6FD" />
                  <stop offset="100%" stopColor="#FEF08A" />
                </linearGradient>

                {/* Sun Glow */}
                <radialGradient id="sunGlow" cx="65%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#FEF08A" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Atmospheric scattering mountain layers */}
                {/* Distant Alps (>10km, heavy Rayleigh blue-violet haze) */}
                <linearGradient id="farMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748B" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.75" />
                </linearGradient>

                {/* Mid Mountain (2-5km) */}
                <linearGradient id="midMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>

                {/* Near Hills & Forest (6m~500m) */}
                <linearGradient id="nearHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#064E3B" />
                  <stop offset="50%" stopColor="#065F46" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>

                {/* Foreground Window Sill / Monitor frame (0.5m blur bokeh) */}
                <linearGradient id="windowSillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Sky Background */}
              <rect x="0" y="0" width="400" height="240" fill="url(#skyGrad)" />

              {/* Sun & Volumetric Crepuscular God Rays */}
              <circle cx="260" cy="115" r="45" fill="url(#sunGlow)" />
              <polygon points="260,115 120,240 180,240" fill="#FFFFFF" opacity="0.12" />
              <polygon points="260,115 220,240 310,240" fill="#FFFFFF" opacity="0.15" />
              <polygon points="260,115 330,240 400,240" fill="#FFFFFF" opacity="0.1" />

              {/* Distant Birds */}
              <path d="M 120,70 Q 125,65 130,70 Q 135,65 140,70" stroke="#475569" strokeWidth="1" fill="none" opacity="0.7" />
              <path d="M 145,78 Q 149,74 153,78 Q 157,74 161,78" stroke="#475569" strokeWidth="0.8" fill="none" opacity="0.6" />

              {/* Layer 1: Extreme Distant Snowy Mountain Ridge (>10km) */}
              <path
                d="M 0,160 L 50,135 L 90,148 L 140,120 L 190,140 L 240,110 L 290,138 L 350,115 L 400,145 L 400,240 L 0,240 Z"
                fill="url(#farMtnGrad)"
              />

              {/* Layer 2: Mid-distance Pine Mountain Ridge (2km~5km) */}
              <path
                d="M 0,175 L 60,150 L 110,165 L 180,142 L 230,162 L 310,138 L 370,160 L 400,152 L 400,240 L 0,240 Z"
                fill="url(#midMtnGrad)"
                opacity="0.85"
              />

              {/* Layer 3: Lush Green Hills (6m ~ 500m) - The 20-20-20 Target Depth Zone! */}
              <path
                d="M 0,195 Q 80,170 170,190 T 340,175 Q 380,185 400,188 L 400,240 L 0,240 Z"
                fill="url(#nearHillsGrad)"
              />

              {/* Target Focus Reticle at Infinite Horizon (6m+) */}
              <g transform="translate(200, 155)">
                <circle cx="0" cy="0" r="14" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" className="animate-spin" style={{ animationDuration: "12s" }} />
                <circle cx="0" cy="0" r="3.5" fill="#EF4444" />
                <line x1="-18" y1="0" x2="-6" y2="0" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="6" y1="0" x2="18" y2="0" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="0" y1="-18" x2="0" y2="-6" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="0" y1="6" x2="0" y2="18" stroke="#F59E0B" strokeWidth="1.5" />
              </g>

              {/* Layer 4: FOREGROUND INDOOR WINDOW SILL / DESK (0.5m) - In realistic optical Bokeh Blur */}
              <g opacity="0.85">
                {/* Left window frame pillar */}
                <rect x="0" y="0" width="22" height="240" fill="url(#windowSillGrad)" />
                {/* Right window frame pillar */}
                <rect x="378" y="0" width="22" height="240" fill="url(#windowSillGrad)" />
                {/* Bottom Sill */}
                <rect x="0" y="222" width="400" height="18" fill="url(#windowSillGrad)" />
              </g>
            </svg>

            {/* Depth Overlay Badge */}
            <div className="absolute top-3 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
              초점 거리: 6m ~ ∞ 무한대 (20ft)
            </div>

            {/* Dynamic Synchronous Breathing Orb */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={breathPhase}
                    initial={{
                      scale: breathPhase === "INHALE" ? 0.5 : breathPhase === "HOLD" ? 1.15 : 1.2,
                      opacity: 0.25,
                    }}
                    animate={{
                      scale: breathPhase === "INHALE" ? 1.2 : breathPhase === "HOLD" ? 1.2 : 0.5,
                      opacity: breathPhase === "HOLD" ? 0.6 : 0.35,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`w-44 h-44 rounded-full border-4 shadow-2xl backdrop-blur-xs flex items-center justify-center ${
                      breathPhase === "INHALE"
                        ? "border-indigo-400 bg-indigo-500/10"
                        : breathPhase === "HOLD"
                        ? "border-teal-400 bg-teal-500/15"
                        : "border-sky-400 bg-sky-500/10"
                    }`}
                  >
                    <Wind className="w-8 h-8 text-white/70 animate-pulse" />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Breathing Toast Overlay */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-4/5 text-center">
              <div className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-xl transition-all ${getBreathColor()}`}>
                {getBreathLabel()} ({breathSeconds}초 남음)
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: PARASYMPATHETIC & CILIARY RELAXATION MONITOR */}
        {viewMode === "RELAXATION_GAUGE" && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white space-y-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>모양체 근육 완전 이완 & 자율신경 안정 지수</span>
            </h4>

            {/* Circular Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#334155" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#14B8A6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="251.2"
                  animate={{ strokeDashoffset: 251.2 * (1 - parasympatheticTone / 100) }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-mono font-extrabold text-teal-400">{parasympatheticTone}%</span>
                <span className="text-[9px] text-slate-400">이완 정상화</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 text-center max-w-xs leading-relaxed">
              먼 곳을 응시하며 횡격막 호흡을 수행하면 부교감 신경이 활성화되어 <strong>안압 상승이 억제되고 조절 마비가 즉시 풀립니다</strong>.
            </p>
          </div>
        )}

        {/* Bottom Real-time Telemetry Bar */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">모양체 조절 긴장도:</span>
            <span className="text-teal-400 font-mono font-bold">
              {isPlaying ? `${Math.max(0, 100 - parasympatheticTone)}%` : "0% (완전 이완)"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">잔여 시간: <strong className="text-amber-400 font-mono">{secondsLeft}초 / 24초</strong></span>
          </div>
        </div>
      </div>

      {/* Controls & Scientific Context (only in standard view) */}
      {!isFullscreen && (
        <>
          {/* Guide text */}
          <div className="w-full text-center px-2">
            <p className="text-xs font-semibold text-slate-700">
              실제 눈앞의 화면이 아닌, <strong>방 건너편 창문 밖 먼 풍경이나 가로수</strong>를 멍하니 20초간 바라보며 가슴을 활짝 펴세요.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-6 w-full max-w-sm justify-between pt-1">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">남은 시간</div>
              <div className="text-2xl font-mono font-bold text-slate-800">
                {secondsLeft}초
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                id="step5-play-btn"
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
                id="step5-reset-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scientific context */}
          <div className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50/70 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>안과학 팩트:</strong> 6미터(20피트) 이상의 거리는 광학적으로 <em>'무한대(Infinity)'</em>로 간주됩니다. 이 거리에서는 수정체가 더 이상 빛을 꺾기 위해 힘을 쓸 필요가 없어 모양체 근육이 0디옵터의 완벽한 휴식 상태로 진입합니다. 20초만 유지해도 컴퓨터 시각 증후군(CVS)의 80%가 예방됩니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
