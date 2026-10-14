import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Activity, Award, Info, Crosshair, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step3Props {
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

// 9 Positions with accurate ophthalmic yoked muscle activation profiles (Left Eye Model & Conjugate Binocular Gaze)
const POSITIONS = [
  { x: 18, y: 18, label: "좌측 상단 (상직근 SR + 하사근 IO / 외직근 LR)", mr: 20, lr: 80, sr: 90, ir: 10, so: 15, io: 75 },
  { x: 82, y: 18, label: "우측 상단 (내직근 MR + 하사근 IO / 상직근 SR)", mr: 85, lr: 20, sr: 70, ir: 10, so: 20, io: 85 },
  { x: 18, y: 82, label: "좌측 하단 (하직근 IR + 상사근 SO / 외직근 LR)", mr: 20, lr: 85, sr: 10, ir: 90, so: 80, io: 15 },
  { x: 82, y: 82, label: "우측 하단 (내직근 MR + 상사근 SO / 하직근 IR)", mr: 85, lr: 20, sr: 10, ir: 85, so: 85, io: 15 },
  { x: 50, y: 50, label: "정중앙 (6대 외안근 기저 평형 상태)", mr: 45, lr: 45, sr: 45, ir: 45, so: 45, io: 45 },
  { x: 18, y: 50, label: "좌측 수평 (외직근 LR 외전 활성 · CN VI)", mr: 15, lr: 95, sr: 40, ir: 40, so: 30, io: 30 },
  { x: 82, y: 50, label: "우측 수평 (내직근 MR 내전 활성 · CN III)", mr: 95, lr: 15, sr: 40, ir: 40, so: 30, io: 30 },
  { x: 50, y: 18, label: "수직 상단 (상직근 SR 거상 + 하사근 IO 협조)", mr: 45, lr: 45, sr: 95, ir: 10, so: 20, io: 85 },
  { x: 50, y: 82, label: "수직 하단 (하직근 IR 하강 + 상사근 SO 협조)", mr: 45, lr: 45, sr: 10, ir: 95, so: 85, io: 15 },
];

type ViewMode = "RADAR_TRACKER" | "MUSCLE_ANATOMY";

export default function Step3Saccades({
  isActive,
  onComplete,
  speak,
  isFullscreen = false,
  onRunningChange,
  onStateUpdate,
  playTrigger,
  resetTrigger,
}: Step3Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentPosIdx, setCurrentPosIdx] = useState(4); // Start center
  const [jumpSpeedMs, setJumpSpeedMs] = useState(1000);
  const [jumpCount, setJumpCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("RADAR_TRACKER");
  const [saccadeVelocity, setSaccadeVelocity] = useState(420); // deg/sec

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

  // Notify parent on state change
  useEffect(() => {
    onRunningChange?.(isPlaying);
    onStateUpdate?.({
      isPlaying,
      secondsLeft,
      totalSeconds: 60,
      phaseInfo: `타겟 도약: ${jumpCount}회 완료 (${POSITIONS[currentPosIdx].label})`,
      extraInfo: `${saccadeVelocity} deg/sec`,
    });
  }, [isPlaying, secondsLeft, jumpCount, currentPosIdx, saccadeVelocity]);

  const activePos = POSITIONS[currentPosIdx];

  // Speech triggers
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (!isPlaying) {
      isInitialMountRef.current = true;
      return;
    }
    if (isInitialMountRef.current && secondsLeft === 60) {
      isInitialMountRef.current = false;
      speak("3단계: 단속 안구 운동을 시작합니다. 머리를 고정하고 눈동자만 빠르게 표적을 추적하세요.");
    }
  }, [isPlaying, secondsLeft]);

  useEffect(() => {
    if (!isPlaying) return;
    if (jumpCount > 0 && jumpCount % 12 === 0) {
      speak("머리는 정면 고정! 시선만 빠르게 튕기듯 추적하세요.");
    }
  }, [jumpCount, isPlaying]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    let jumpInterval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      timerInterval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak("단속 안구 운동이 완료되었습니다. 외안근과 뇌 전두안야 신경망이 활성화되었습니다.");
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      jumpInterval = setInterval(() => {
        setCurrentPosIdx((prev) => {
          let next = prev;
          while (next === prev) {
            next = Math.floor(Math.random() * POSITIONS.length);
          }
          setJumpCount((c) => c + 1);
          setSaccadeVelocity(Math.floor(380 + Math.random() * 140)); // Realistic saccadic peak velocity
          return next;
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
  }, [isPlaying, secondsLeft, jumpSpeedMs, onComplete]);

  const togglePlay = () => {
    if (!isPlaying && secondsLeft === 60) {
      setJumpCount(0);
      setCurrentPosIdx(4);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(60);
    setCurrentPosIdx(4);
    setJumpCount(0);
  };

  // Convert (x, y) percent to normalized eye rotation (-15 to +15 deg)
  const eyeRotX = ((activePos.x - 50) / 32) * 16;
  const eyeRotY = ((activePos.y - 50) / 32) * 16;

  return (
    <div
      id="step-3-container"
      className={
        isFullscreen
          ? "w-full h-full flex flex-col items-center justify-center bg-transparent border-0 rounded-none shadow-none p-2 sm:p-4 text-white"
          : "flex flex-col items-center space-y-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      }
    >
      {/* Header (condensed when in fullscreen) */}
      {!isFullscreen ? (
        <div className="text-center space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <h3 className="text-base font-bold text-slate-800" id="step3-header-title">
                3단계: 정밀 단속 안구 운동 (Saccades)
              </h3>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("RADAR_TRACKER")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "RADAR_TRACKER"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                단속 추적 레이다
              </button>
              <button
                onClick={() => setViewMode("MUSCLE_ANATOMY")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "MUSCLE_ANATOMY"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                6대 외안근 근전도
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-left">
            시선을 도약시키는 단속 운동(Saccade)은 뇌의 <em>전두안야(FEF)</em>와 6개 <em>외안근</em>을 동기화하여 독서 및 주시 피로를 극적으로 줄입니다.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold">도약 속도:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setJumpSpeedMs(1000)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  jumpSpeedMs === 1000 ? "bg-orange-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                1.0초
              </button>
              <button
                onClick={() => setJumpSpeedMs(750)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  jumpSpeedMs === 750 ? "bg-orange-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                0.75초
              </button>
              <button
                onClick={() => setJumpSpeedMs(500)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  jumpSpeedMs === 500 ? "bg-orange-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                0.5초 (빠름)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("RADAR_TRACKER")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "RADAR_TRACKER" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              단속 레이다
            </button>
            <button
              onClick={() => setViewMode("MUSCLE_ANATOMY")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "MUSCLE_ANATOMY" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              외안근 해부
            </button>
          </div>
        </div>
      )}

      {/* Speed Selector Tabs (only in standard view) */}
      {!isFullscreen && (
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs w-full max-w-sm justify-between">
          <span className="text-slate-500 font-semibold pl-2">도약 속도:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setJumpSpeedMs(1000)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                jumpSpeedMs === 1000 ? "bg-white text-orange-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              초당 1회
            </button>
            <button
              onClick={() => setJumpSpeedMs(750)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                jumpSpeedMs === 750 ? "bg-white text-orange-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              초당 1.3회
            </button>
            <button
              onClick={() => setJumpSpeedMs(500)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                jumpSpeedMs === 500 ? "bg-white text-orange-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              초당 2회 (도전)
            </button>
          </div>
        </div>
      )}

      {/* Main Simulation Viewport */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-180px)] min-h-[460px]" : "h-72"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner select-none`}
        id="step3-visual-canvas"
      >
        {/* VIEW A: PRECISION NEURO-SACCADIC RADAR */}
        {viewMode === "RADAR_TRACKER" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Visual degrees grid rings */}
            <div className="absolute w-60 h-60 rounded-full border border-dashed border-slate-800 pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-slate-800/80 pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-slate-800/60 pointer-events-none" />
            
            {/* Horizontal & Vertical Crosshair Lines */}
            <div className="absolute inset-x-8 top-1/2 border-t border-slate-800 pointer-events-none" />
            <div className="absolute inset-y-8 left-1/2 border-l border-slate-800 pointer-events-none" />

            {/* Visual Angle degree labels */}
            <span className="absolute top-8 text-[9px] font-mono text-slate-500 font-bold">+20° 수직</span>
            <span className="absolute bottom-8 text-[9px] font-mono text-slate-500 font-bold">-20° 수직</span>
            <span className="absolute left-8 text-[9px] font-mono text-slate-500 font-bold">-20° 외전</span>
            <span className="absolute right-8 text-[9px] font-mono text-slate-500 font-bold">+20° 내전</span>

            {/* Real-time Jumping Target */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activePos.x}-${activePos.y}`}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center pointer-events-none"
                style={{ left: `${activePos.x}%`, top: `${activePos.y}%` }}
              >
                {/* Laser Ping Ripple */}
                <div className="absolute w-12 h-12 rounded-full border border-orange-500/60 animate-ping" />
                {/* Crosshair Bracket */}
                <div className="absolute w-8 h-8 border border-orange-400/50 rounded-sm" />
                {/* High-visibility Target Core */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 border-2 border-white shadow-[0_0_20px_rgba(249,115,22,0.9)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Simulated Live Gaze Tracking Pip (Showing where the eye is pointing) */}
            <motion.div
              animate={{ left: `${activePos.x}%`, top: `${activePos.y}%` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute w-12 h-12 -ml-6 -mt-6 border border-cyan-400/40 rounded-full pointer-events-none flex items-center justify-center"
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span className="absolute -top-3 text-[8px] font-mono text-cyan-400 font-bold">시선 중심와</span>
            </motion.div>

            {/* Start Tutorial Overlay */}
            {!isPlaying && secondsLeft === 60 && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2 z-10">
                <Crosshair className="w-8 h-8 text-orange-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white">단속성 안구 추적 레이다</h4>
                <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                  머리는 고정한 채, 화면에 출현하는 <strong>주황색 표적</strong>을 시선만으로 빠르게 튕기듯 추적하세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW B: 6 EXTRAOCULAR MUSCLES BIOMECHANICS & EMG */}
        {viewMode === "MUSCLE_ANATOMY" && (
          <div className="relative w-full h-full flex items-center justify-center px-4">
            <div className="grid grid-cols-12 gap-3 w-full items-center">
              {/* Left: 3D-shaded Eye Globe with All 6 Extraocular Muscles */}
              <div className="col-span-6 flex flex-col items-center">
                <svg className="w-36 h-36" viewBox="0 0 160 160" fill="none">
                  {/* Superior Oblique Trochlea loop & tendon (상사근 & 활차 - CN IV) */}
                  <path
                    d="M 125,25 Q 115,10 88,14"
                    stroke={activePos.so > 60 ? "#818CF8" : "#64748B"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity={activePos.so / 100}
                  />
                  <circle cx="125" cy="25" r="3" fill="#A5B4FC" stroke="#4F46E5" strokeWidth="1" />
                  <text x="110" y="8" fill="#818CF8" fontSize="7" fontWeight="bold">활차·상사근(SO)</text>

                  {/* Inferior Oblique muscle under globe (하사근 - CN III) */}
                  <path
                    d="M 120,135 Q 90,148 40,125"
                    stroke={activePos.io > 60 ? "#F43F5E" : "#64748B"}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity={activePos.io / 100}
                  />
                  <text x="5" y="145" fill="#F43F5E" fontSize="7" fontWeight="bold">하사근(IO)</text>

                  {/* Superior Rectus (상직근 - CN III) */}
                  <rect
                    x="70"
                    y="10"
                    width="20"
                    height="32"
                    rx="4"
                    fill={activePos.sr > 70 ? "#EF4444" : "#94A3B8"}
                    stroke="#FCA5A5"
                    strokeWidth="1"
                    opacity={activePos.sr / 100}
                  />
                  <text x="52" y="24" fill="#F87171" fontSize="8" fontWeight="bold">상직근 (SR)</text>

                  {/* Inferior Rectus (하직근 - CN III) */}
                  <rect
                    x="70"
                    y="118"
                    width="20"
                    height="32"
                    rx="4"
                    fill={activePos.ir > 70 ? "#EF4444" : "#94A3B8"}
                    stroke="#FCA5A5"
                    strokeWidth="1"
                    opacity={activePos.ir / 100}
                  />
                  <text x="52" y="148" fill="#F87171" fontSize="8" fontWeight="bold">하직근 (IR)</text>

                  {/* Lateral Rectus (외직근 - CN VI) - 좌측 (좌안 귀쪽) */}
                  <rect
                    x="5"
                    y="70"
                    width="35"
                    height="20"
                    rx="4"
                    fill={activePos.lr > 70 ? "#F97316" : "#94A3B8"}
                    stroke="#FDBA74"
                    strokeWidth="1"
                    opacity={activePos.lr / 100}
                  />
                  <text x="5" y="65" fill="#FB923C" fontSize="8" fontWeight="bold">외직근(LR)</text>

                  {/* Medial Rectus (내직근 - CN III) - 우측 (좌안 코쪽) */}
                  <rect
                    x="120"
                    y="70"
                    width="35"
                    height="20"
                    rx="4"
                    fill={activePos.mr > 70 ? "#F97316" : "#94A3B8"}
                    stroke="#FDBA74"
                    strokeWidth="1"
                    opacity={activePos.mr / 100}
                  />
                  <text x="118" y="65" fill="#FB923C" fontSize="8" fontWeight="bold">내직근(MR)</text>

                  {/* Sclera Globe (안구 구체 - 좌안 기준) */}
                  <circle cx="80" cy="80" r="43" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
                  
                  {/* Dynamic Pupil / Iris rotating based on target angle */}
                  <motion.g
                    animate={{
                      x: eyeRotX,
                      y: eyeRotY,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <circle cx="80" cy="80" r="22" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
                    <circle cx="80" cy="80" r="10" fill="#0F172A" />
                    <circle cx="76" cy="76" r="3" fill="#FFFFFF" opacity="0.8" />
                  </motion.g>
                </svg>
                <span className="text-[9px] text-slate-400 font-mono mt-1">좌안(Left Eye) 기준 6대 외안근 역학</span>
              </div>

              {/* Right: Live EMG 6 Muscle Activation Gauges */}
              <div className="col-span-6 space-y-1 text-[9px]">
                <div className="text-slate-300 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-orange-400" />
                  <span>6대 외안근 근전도(EMG) 활성치</span>
                </div>

                {/* SR */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-300">
                    <span>상직근 (SR · CN III 동안신경)</span>
                    <span className="font-mono text-orange-400 font-bold">{activePos.sr}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${activePos.sr}%` }} />
                  </div>
                </div>

                {/* IR */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-300">
                    <span>하직근 (IR · CN III 동안신경)</span>
                    <span className="font-mono text-orange-400 font-bold">{activePos.ir}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${activePos.ir}%` }} />
                  </div>
                </div>

                {/* LR */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-300">
                    <span>외직근 (LR · CN VI 외전신경)</span>
                    <span className="font-mono text-amber-400 font-bold">{activePos.lr}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${activePos.lr}%` }} />
                  </div>
                </div>

                {/* MR */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-300">
                    <span>내직근 (MR · CN III 동안신경)</span>
                    <span className="font-mono text-amber-400 font-bold">{activePos.mr}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${activePos.mr}%` }} />
                  </div>
                </div>

                {/* SO */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-indigo-300">
                    <span>상사근 (SO · CN IV 활차신경/하강)</span>
                    <span className="font-mono text-indigo-400 font-bold">{activePos.so}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${activePos.so}%` }} />
                  </div>
                </div>

                {/* IO */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-rose-300">
                    <span>하사근 (IO · CN III 동안신경/거상)</span>
                    <span className="font-mono text-rose-400 font-bold">{activePos.io}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${activePos.io}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Telemetry Dashboard Bar */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">현재 목표점:</span>
            <span className="text-amber-400 font-bold">{activePos.label}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">단속 추적: <strong className="text-white font-mono">{jumpCount}회</strong></span>
            <span className="text-slate-400 hidden sm:inline">도약 속도: <strong className="text-cyan-400 font-mono">~{saccadeVelocity}°/s</strong></span>
          </div>
        </div>
      </div>

      {/* Control Actions & Timer (only when in standard view, since fullscreen bottom bar handles it) */}
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
                id="step3-play-btn"
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
                id="step3-reset-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guide details */}
          <div className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50/70 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>안과학 팩트:</strong> 단속 운동(Saccade)은 인간 신체에서 가장 빠른 운동 중 하나로, 최대 초당 500도 이상으로 눈을 이동시킵니다. 스마트폰의 정적인 화면에 장시간 노출되면 외안근의 협응 능력이 감퇴하여 독서 집중력이 저하됩니다. 머리는 반드시 고정하고 시선만 튕기십시오!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
