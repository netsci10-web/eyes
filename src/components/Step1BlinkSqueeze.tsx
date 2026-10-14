import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Eye, Sparkles, Layers, ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step1Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
}

type Phase = "BLINK" | "SQUEEZE" | "OPEN";
type ViewMode = "REALISTIC_FRONT" | "ANATOMY_SECTION";

export default function Step1BlinkSqueeze({ isActive, onComplete, speak }: Step1Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [phase, setPhase] = useState<Phase>("BLINK");
  const [phaseSeconds, setPhaseSeconds] = useState(2);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("REALISTIC_FRONT");
  const [lipidOutput, setLipidOutput] = useState(20); // 0 to 100%

  // Initialize and guide
  useEffect(() => {
    if (isActive && isPlaying) {
      speak("첫 번째 단계인 마이봄샘 자극 운동을 시작합니다. 화면 가이드에 맞춰 눈을 깜빡이세요.");
    }
  }, [isActive]);

  // Voice coaching on phase changes (concise, natural cues that never cut off)
  useEffect(() => {
    if (!isPlaying) return;

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
    if (phase === "BLINK") return "1단계: 가볍게 감기 (Gentle Blink)";
    if (phase === "SQUEEZE") return "2단계: 지긋이 쥐어짜기 (Firm Squeeze)";
    return "3단계: 크게 뜨기 (Open Wide & Spread)";
  };

  const getPhaseDesc = () => {
    if (phase === "BLINK") return "눈의 근육 긴장을 풀고 부드럽게 위아래 눈꺼풀을 맞닿게 합니다.";
    if (phase === "SQUEEZE") return "안륜근을 수축시켜 검판 내 마이봄샘(기름샘) 관을 지긋이 압박·배출합니다.";
    return "눈을 시원하게 크게 떠서 분비된 지질을 각막 위 눈물막 전면에 균일하게 도포합니다.";
  };

  // Generate realistic Meibomian Glands along upper/lower lid
  const glandCount = 20;

  return (
    <div id="step-1-container" className="flex flex-col items-center space-y-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Top Header */}
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
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === "REALISTIC_FRONT"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              실사 안구 뷰
            </button>
            <button
              onClick={() => setViewMode("ANATOMY_SECTION")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
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
      </div>

      {/* Main Realistic Simulation Viewport */}
      <div
        className="relative w-full h-72 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none"
        id="step1-visual-canvas"
      >
        {/* Phase Badge */}
        <div className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-300 ${getPhaseColor()}`}>
          {getPhaseLabel()}
        </div>

        {/* Repetition Indicator */}
        <div className="absolute top-3 right-4 text-xs font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 backdrop-blur-xs flex items-center space-x-2">
          <span className="text-slate-400">루프 완료:</span>
          <span className="font-bold text-amber-400">{repsCompleted}/10회</span>
        </div>

        {/* VIEW A: REALISTIC FRONTAL HUMAN EYE */}
        {viewMode === "REALISTIC_FRONT" && (
          <div className="relative w-72 h-44 flex items-center justify-center">
            {/* SVG Base Eye Rendering */}
            <svg
              className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
              viewBox="0 0 300 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Sclera realistic gradient */}
                <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="75%" stopColor="#F1F5F9" />
                  <stop offset="95%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </radialGradient>

                {/* Sclera shadow edge */}
                <linearGradient id="scleraShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(15, 23, 42, 0.45)" />
                  <stop offset="30%" stopColor="transparent" />
                  <stop offset="70%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(15, 23, 42, 0.35)" />
                </linearGradient>

                {/* Iris realistic gradient */}
                <radialGradient id="irisGrad" cx="50%" cy="48%" r="50%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="25%" stopColor="#0284C7" />
                  <stop offset="55%" stopColor="#0369A1" />
                  <stop offset="85%" stopColor="#0C4A6E" />
                  <stop offset="100%" stopColor="#082F49" />
                </radialGradient>

                {/* Pupil deep shadow */}
                <radialGradient id="pupilGrad" cx="45%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                {/* Realistic eyelid skin tone */}
                <linearGradient id="skinUpper" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4A373" />
                  <stop offset="60%" stopColor="#C58F5D" />
                  <stop offset="100%" stopColor="#A86E42" />
                </linearGradient>
                <linearGradient id="skinLower" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B37748" />
                  <stop offset="40%" stopColor="#C58F5D" />
                  <stop offset="100%" stopColor="#D4A373" />
                </linearGradient>

                {/* Tear film glistening highlight */}
                <linearGradient id="tearFilm" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(254, 240, 138, 0.45)" />
                  <stop offset="50%" stopColor="rgba(56, 189, 248, 0.35)" />
                  <stop offset="100%" stopColor="rgba(167, 139, 250, 0.3)" />
                </linearGradient>

                {/* Eyelid clip path */}
                <clipPath id="eyeballClip">
                  <path d="M 25,90 Q 150,15 275,90 Q 150,165 25,90 Z" />
                </clipPath>
              </defs>

              {/* Eyeball container (clipped to eye fissure) */}
              <g clipPath="url(#eyeballClip)">
                {/* Sclera */}
                <rect x="0" y="0" width="300" height="180" fill="url(#scleraGrad)" />

                {/* Micro vascular capillaries (미세 모세혈관) */}
                <path d="M 35,88 Q 55,80 75,85 T 100,82" stroke="#FDA4AF" strokeWidth="0.8" opacity="0.6" fill="none" />
                <path d="M 40,94 Q 60,98 80,92 T 105,95" stroke="#F43F5E" strokeWidth="0.7" opacity="0.5" fill="none" />
                <path d="M 265,88 Q 240,82 220,86 T 195,83" stroke="#FDA4AF" strokeWidth="0.8" opacity="0.6" fill="none" />
                <path d="M 260,94 Q 235,97 215,93 T 190,96" stroke="#F43F5E" strokeWidth="0.7" opacity="0.5" fill="none" />

                {/* Iris */}
                <circle cx="150" cy="90" r="42" fill="url(#irisGrad)" stroke="#082F49" strokeWidth="1.5" />

                {/* Radial Iris Stroma fibers (홍채 실 구조) */}
                {[...Array(24)].map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x1 = 150 + Math.cos(angle) * 19;
                  const y1 = 90 + Math.sin(angle) * 19;
                  const x2 = 150 + Math.cos(angle) * 39;
                  const y2 = 90 + Math.sin(angle) * 39;
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

                {/* Pupillary border ring */}
                <circle cx="150" cy="90" r="18" fill="none" stroke="#0C4A6E" strokeWidth="2" opacity="0.8" />

                {/* Pupil */}
                <circle cx="150" cy="90" r="16" fill="url(#pupilGrad)" />

                {/* Cornea realistic glistening reflection */}
                <ellipse cx="140" cy="78" rx="8" ry="5" fill="#FFFFFF" opacity="0.9" transform="rotate(-20 140 78)" />
                <circle cx="158" cy="100" r="2.5" fill="#FFFFFF" opacity="0.6" />

                {/* Tear Film Lipid Layer spreading (visible on OPEN phase) */}
                {phase === "OPEN" && (
                  <motion.rect
                    x="0"
                    y="0"
                    width="300"
                    height="180"
                    fill="url(#tearFilm)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.7, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                )}

                {/* Shadow from eyelids on eyeball */}
                <rect x="0" y="0" width="300" height="180" fill="url(#scleraShadow)" />
              </g>

              {/* Eye contour rim / Caruncle (내안각 눈물언덕) */}
              <path d="M 25,90 C 22,86 16,87 18,91 C 20,94 23,93 25,90 Z" fill="#F43F5E" opacity="0.75" />

              {/* DYNAMIC EYELIDS (Blink, Squeeze, Open) */}
              {/* Upper Eyelid */}
              <motion.path
                animate={{
                  d:
                    phase === "OPEN"
                      ? "M 25,90 Q 150,0 275,90 L 275,0 L 25,0 Z"
                      : phase === "BLINK"
                      ? "M 25,90 Q 150,88 275,90 L 275,0 L 25,0 Z"
                      : "M 25,90 Q 150,96 275,90 L 275,0 L 25,0 Z", // SQUEEZE: closes deeper
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                fill="url(#skinUpper)"
                stroke="#6B4226"
                strokeWidth="1.5"
              />

              {/* Lower Eyelid */}
              <motion.path
                animate={{
                  d:
                    phase === "OPEN"
                      ? "M 25,90 Q 150,180 275,90 L 275,180 L 25,180 Z"
                      : phase === "BLINK"
                      ? "M 25,90 Q 150,92 275,90 L 275,180 L 25,180 Z"
                      : "M 25,90 Q 150,86 275,90 L 275,180 L 25,180 Z", // SQUEEZE: raises slightly
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                fill="url(#skinLower)"
                stroke="#6B4226"
                strokeWidth="1.5"
              />

              {/* Meibomian Glands Orifices & Secretions along the lid margins */}
              <g id="meibomian-orifices">
                {[...Array(glandCount)].map((_, i) => {
                  const x = 50 + i * 10.5;
                  // Calculate dynamic Y along lid curve
                  const upperY = phase === "OPEN" ? 35 : phase === "BLINK" ? 88 : 95;
                  const lowerY = phase === "OPEN" ? 145 : phase === "BLINK" ? 92 : 87;

                  return (
                    <g key={i}>
                      {/* Upper Gland Orifice */}
                      <circle cx={x} cy={upperY} r="1.2" fill="#FEF08A" opacity="0.8" />
                      {/* Lower Gland Orifice */}
                      <circle cx={x} cy={lowerY} r="1.2" fill="#FEF08A" opacity="0.8" />

                      {/* Golden Lipid Secretion Droplets appearing on SQUEEZE! */}
                      {phase === "SQUEEZE" && i % 2 === 0 && (
                        <motion.circle
                          cx={x}
                          cy={upperY + 1}
                          r={1.8}
                          fill="#FBBF24"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [1, 1.5, 1.2], opacity: 0.95 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Eyelashes (속눈썹) */}
              {[...Array(16)].map((_, i) => {
                const x = 45 + i * 14;
                const lashY = phase === "OPEN" ? 32 : phase === "BLINK" ? 88 : 96;
                const curveY = lashY - (phase === "OPEN" ? 12 : 6);
                return (
                  <path
                    key={i}
                    d={`M ${x},${lashY} Q ${x + (i < 8 ? -4 : 4)},${curveY} ${x + (i < 8 ? -7 : 7)},${curveY - 4}`}
                    stroke="#1E1B18"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                );
              })}

              {/* Tension Creases when SQUEEZING */}
              {phase === "SQUEEZE" && (
                <g stroke="#78350F" strokeWidth="1.2" opacity="0.7">
                  <path d="M 120,60 Q 150,68 180,60" fill="none" />
                  <path d="M 130,52 Q 150,58 170,52" fill="none" />
                  <path d="M 125,125 Q 150,118 175,125" fill="none" />
                  <path d="M 40,85 L 20,80" />
                  <path d="M 40,95 L 20,100" />
                  <path d="M 260,85 L 280,80" />
                  <path d="M 260,95 L 280,100" />
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
    </div>
  );
}
