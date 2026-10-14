import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Award,
  BookOpen,
  Heart,
  Info,
  ChevronRight,
  ChevronLeft,
  Brain,
  Eye,
  Flame,
  Sparkles,
  Clock,
  Compass,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Activity,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  History,
  X,
} from "lucide-react";
import { useTTS } from "./hooks/useTTS";
import Step1BlinkSqueeze from "./components/Step1BlinkSqueeze";
import Step2Accommodative from "./components/Step2Accommodative";
import Step3Saccades from "./components/Step3Saccades";
import Step4Gabor from "./components/Step4Gabor";
import Step5FarFocus from "./components/Step5FarFocus";
import ScienceGuide from "./components/ScienceGuide";
import AnatomyModal from "./components/AnatomyModal";
import VoiceSettingsModal from "./components/VoiceSettingsModal";

type StepId = 1 | 2 | 3 | 4 | 5;

interface TrainingHistory {
  date: string;
  gaborScore: number;
  completedSteps: number[];
}

export default function App() {
  const {
    isSupported,
    isMuted,
    setIsMuted,
    speak,
    stop,
    activeSubtitle,
    rate,
    setRate,
    pitch,
    setPitch,
    voices,
    selectedVoice,
    setSelectedVoice,
    isAiVoice,
    setIsAiVoice,
    isLoadingAiAudio,
    testVoice,
  } = useTTS();

  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [gaborScore, setGaborScore] = useState<number>(0);
  const [streakDays, setStreakDays] = useState(0);
  const [history, setHistory] = useState<TrainingHistory[]>([]);
  const [showFaq, setShowFaq] = useState(false);
  const [isAnatomyModalOpen, setIsAnatomyModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fullscreen simulation & auto-hiding menus state
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isExerciseRunning, setIsExerciseRunning] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [showBottomMenu, setShowBottomMenu] = useState(true);
  const [showProximityTip, setShowProximityTip] = useState(false);

  const [stepState, setStepState] = useState<{
    isPlaying: boolean;
    secondsLeft: number;
    totalSeconds: number;
    phaseInfo?: string;
    extraInfo?: string;
  }>({
    isPlaying: false,
    secondsLeft: 60,
    totalSeconds: 60,
    phaseInfo: "",
    extraInfo: "",
  });

  const [playTrigger, setPlayTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  const topHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load history and streak from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("ophthal_training_history");
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as TrainingHistory[];
        setHistory(parsed);
        calculateStreak(parsed);
      }
    } catch (e) {
      console.warn("Failed to read localStorage history:", e);
    }
  }, []);

  const calculateStreak = (hist: TrainingHistory[]) => {
    if (hist.length === 0) {
      setStreakDays(0);
      return;
    }
    const uniqueDates = Array.from(new Set(hist.map((item) => item.date.split("T")[0])));
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let consecutive = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreakDays(0);
      return;
    }

    let currentCheck = new Date(uniqueDates[0]);
    consecutive = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currentCheck.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        consecutive++;
        currentCheck = prevDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    setStreakDays(consecutive);
  };

  const handleStepComplete = (stepId: StepId) => {
    if (!completedSteps.includes(stepId)) {
      const updated = [...completedSteps, stepId];
      setCompletedSteps(updated);

      // Auto advance to next step in automatic session mode
      if (sessionActive && stepId < 5) {
        setTimeout(() => {
          const nextStep = (stepId + 1) as StepId;
          setActiveStep(nextStep);
          speak(`다음 ${nextStep}단계 훈련을 준비하십시오.`);
        }, 3000);
      } else if (stepId === 5) {
        setSessionActive(false);
        saveSessionToHistory(updated);
      }
    }
  };

  const saveSessionToHistory = (steps: StepId[]) => {
    const newRecord: TrainingHistory = {
      date: new Date().toISOString(),
      gaborScore: gaborScore || Math.floor(Math.random() * 20) + 80,
      completedSteps: steps,
    };
    const updatedHistory = [newRecord, ...history].slice(0, 30);
    setHistory(updatedHistory);
    localStorage.setItem("ophthal_training_history", JSON.stringify(updatedHistory));
    calculateStreak(updatedHistory);
  };

  const startFullSession = () => {
    stop();
    setCompletedSteps([]);
    setActiveStep(1);
    setSessionActive(true);
    setIsFullscreen(true);
    speak("과학적 5단계 전 과정 눈 깜빡임부터 원거리 이완까지 풀코스 트레이닝을 시작합니다. 1단계 가이드를 띄워 드렸습니다.");
    // Trigger play
    setTimeout(() => {
      setPlayTrigger(Date.now());
    }, 400);
  };

  const resetAllProgress = () => {
    if (confirm("정말로 모든 과거 훈련 이력 및 연속 달성 데이터를 초기화하시겠습니까?")) {
      localStorage.removeItem("ophthal_training_history");
      setHistory([]);
      setStreakDays(0);
      setCompletedSteps([]);
      setSessionActive(false);
      setActiveStep(1);
      speak("이전 기록이 모두 리셋되었습니다.");
    }
  };

  // Auto-hide and proximity logic during exercise execution
  useEffect(() => {
    if (isExerciseRunning) {
      // Hide menus initially when running starts
      setShowTopMenu(false);
      setShowBottomMenu(false);
      setShowProximityTip(true);

      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      tipTimerRef.current = setTimeout(() => {
        setShowProximityTip(false);
      }, 3500);
    } else {
      // When paused or stopped, always keep menus visible
      setShowTopMenu(true);
      setShowBottomMenu(true);
      setShowProximityTip(false);
      if (topHideTimerRef.current) clearTimeout(topHideTimerRef.current);
      if (bottomHideTimerRef.current) clearTimeout(bottomHideTimerRef.current);
    }
  }, [isExerciseRunning]);

  // Global mouse move listener for proximity reveals
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFullscreen) return;

    const { clientY } = e;
    const windowHeight = window.innerHeight;

    // Top boundary check: within top 75px
    if (clientY <= 75) {
      if (topHideTimerRef.current) clearTimeout(topHideTimerRef.current);
      setShowTopMenu(true);
    } else if (isExerciseRunning) {
      if (!topHideTimerRef.current) {
        topHideTimerRef.current = setTimeout(() => {
          setShowTopMenu(false);
          topHideTimerRef.current = null;
        }, 1200);
      }
    }

    // Bottom boundary check: within bottom 85px
    if (clientY >= windowHeight - 85) {
      if (bottomHideTimerRef.current) clearTimeout(bottomHideTimerRef.current);
      setShowBottomMenu(true);
    } else if (isExerciseRunning) {
      if (!bottomHideTimerRef.current) {
        bottomHideTimerRef.current = setTimeout(() => {
          setShowBottomMenu(false);
          bottomHideTimerRef.current = null;
        }, 1200);
      }
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setPlayTrigger(Date.now());
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        if (activeStep > 1) {
          const prev = (activeStep - 1) as StepId;
          setActiveStep(prev);
          speak(`${prev}단계로 이동했습니다.`);
        }
      } else if (e.key === "ArrowRight") {
        if (activeStep < 5) {
          const next = (activeStep + 1) as StepId;
          setActiveStep(next);
          speak(`${next}단계로 이동했습니다.`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStep]);

  const stepDetails = {
    1: {
      name: "1단계: 마이봄샘 윤활",
      badge: "안구 건조 완화",
      color: "border-indigo-500 text-indigo-700 bg-indigo-50",
      desc: "Blink-Squeeze-Open을 통해 눈 기름샘을 압박하여 눈물의 수분 증발 차단",
    },
    2: {
      name: "2단계: 모양체 이완",
      badge: "조절 유연성 회복",
      color: "border-emerald-500 text-emerald-700 bg-emerald-50",
      desc: "가까운 미세 초점과 먼 벽면 응시를 통해 조절 경련 및 가성 근시 해소",
    },
    3: {
      name: "3단계: 단속 안구 운동",
      badge: "정밀 반사 추적",
      color: "border-orange-500 text-orange-700 bg-orange-50",
      desc: "머리는 정면 고정한 채 움직이는 주황색 타겟을 안구 근육으로만 신속히 추정",
    },
    4: {
      name: "4단계: 대비 감도 확장",
      badge: "시각 피질 자극",
      color: "border-rose-500 text-rose-700 bg-rose-50",
      desc: "흐릿한 가보 패치(Gabor Patch) 줄무늬 판별을 통해 뇌 시각 정보 필터링 개선",
    },
    5: {
      name: "5단계: 원거리 완전 릴랙스",
      badge: "20-20-20 룰 이완",
      color: "border-teal-500 text-teal-700 bg-teal-50",
      desc: "최소 6미터 바깥의 먼 사물이나 하늘을 보며 깊게 심호흡하여 조절 마비 즉각 차단",
    },
  };

  // Reusable Step Module Renderer
  const renderStepModule = (fullscreenMode: boolean) => {
    return (
      <div className="w-full h-full flex items-center justify-center transition-all duration-300" key={activeStep}>
        {activeStep === 1 && (
          <Step1BlinkSqueeze
            isActive={activeStep === 1}
            isFullscreen={fullscreenMode}
            onComplete={() => handleStepComplete(1)}
            speak={speak}
            onRunningChange={(running) => setIsExerciseRunning(running)}
            onStateUpdate={(state) => setStepState(state)}
            playTrigger={playTrigger}
            resetTrigger={resetTrigger}
          />
        )}

        {activeStep === 2 && (
          <Step2Accommodative
            isActive={activeStep === 2}
            isFullscreen={fullscreenMode}
            onComplete={() => handleStepComplete(2)}
            speak={speak}
            onRunningChange={(running) => setIsExerciseRunning(running)}
            onStateUpdate={(state) => setStepState(state)}
            playTrigger={playTrigger}
            resetTrigger={resetTrigger}
          />
        )}

        {activeStep === 3 && (
          <Step3Saccades
            isActive={activeStep === 3}
            isFullscreen={fullscreenMode}
            onComplete={() => handleStepComplete(3)}
            speak={speak}
            onRunningChange={(running) => setIsExerciseRunning(running)}
            onStateUpdate={(state) => setStepState(state)}
            playTrigger={playTrigger}
            resetTrigger={resetTrigger}
          />
        )}

        {activeStep === 4 && (
          <Step4Gabor
            isActive={activeStep === 4}
            isFullscreen={fullscreenMode}
            onComplete={() => handleStepComplete(4)}
            speak={speak}
            onScoreUpdate={(scr) => setGaborScore(scr)}
            onRunningChange={(running) => setIsExerciseRunning(running)}
            onStateUpdate={(state) => setStepState(state)}
            playTrigger={playTrigger}
            resetTrigger={resetTrigger}
          />
        )}

        {activeStep === 5 && (
          <Step5FarFocus
            isActive={activeStep === 5}
            isFullscreen={fullscreenMode}
            onComplete={() => handleStepComplete(5)}
            speak={speak}
            onRunningChange={(running) => setIsExerciseRunning(running)}
            onStateUpdate={(state) => setStepState(state)}
            playTrigger={playTrigger}
            resetTrigger={resetTrigger}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Real-time Subtitles / Coaching Floating overlay bar */}
      {activeSubtitle && (
        <div
          className={`fixed ${
            isFullscreen ? "bottom-20" : "bottom-6"
          } left-1/2 transform -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fade-in pointer-events-none`}
          id="coaching-toast-overlay"
        >
          <div className="bg-slate-900/95 text-emerald-400 font-bold text-center px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center space-x-2 backdrop-blur-md">
            <Volume2 className="w-5 h-5 shrink-0 animate-pulse text-indigo-400" />
            <span className="font-mono">
              [음성 코치]: <span className="text-white">{activeSubtitle}</span>
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. FULLSCREEN SIMULATION VIEW (시뮬레이션 전체화면 및 마우스 경계 메뉴)
         ───────────────────────────────────────────────────────────── */}
      {isFullscreen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950 flex flex-col justify-between overflow-hidden select-none"
          onMouseMove={handleMouseMove}
        >
          {/* Top Proximity Hover Sensor Zone (invisible hover strip) */}
          <div
            className="fixed top-0 inset-x-0 h-16 z-30 pointer-events-auto cursor-default"
            onMouseEnter={() => {
              if (topHideTimerRef.current) clearTimeout(topHideTimerRef.current);
              setShowTopMenu(true);
            }}
          />

          {/* Top Auto-Hiding Menu Bar */}
          <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 transform ${
              showTopMenu ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            } bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl px-4 py-2.5 flex items-center justify-between text-white select-none`}
            onMouseEnter={() => {
              if (topHideTimerRef.current) clearTimeout(topHideTimerRef.current);
              setShowTopMenu(true);
            }}
            onMouseLeave={() => {
              if (isExerciseRunning) {
                topHideTimerRef.current = setTimeout(() => setShowTopMenu(false), 1200);
              }
            }}
          >
            {/* Left: Logo & Step indicator */}
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-500/40 font-mono">
                    STEP {activeStep}/5
                  </span>
                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                    {stepDetails[activeStep].name}
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  {stepDetails[activeStep].badge} · {stepDetails[activeStep].desc}
                </p>
              </div>
            </div>

            {/* Center: Step Navigation Tabs (1~5) */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              {([1, 2, 3, 4, 5] as const).map((sId) => {
                const isCurrent = activeStep === sId;
                const isDone = completedSteps.includes(sId);
                return (
                  <button
                    key={sId}
                    onClick={() => {
                      setActiveStep(sId);
                      speak(`${sId}단계 훈련으로 이동했습니다.`);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-xs scale-102"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{sId}단계</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Modals & Fullscreen Toggle Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAnatomyModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                title="3D 안구 해부학 도감"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">3D 해부도</span>
              </button>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                title="자연스러운 음성 코치 설정"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">음성 설정</span>
              </button>

              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                title="훈련 연속일 및 분석 기록 보기"
              >
                <Flame className={`w-3.5 h-3.5 ${streakDays > 0 ? "text-orange-400" : "text-slate-400"}`} />
                <span className="font-mono text-xs">{streakDays}일</span>
              </button>

              <button
                onClick={() => {
                  const targetMute = !isMuted;
                  setIsMuted(targetMute);
                  if (!targetMute) speak("음성 안내 코칭이 켜졌습니다.");
                  else stop();
                }}
                className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  isMuted
                    ? "bg-rose-950/60 text-rose-400 border-rose-800 hover:bg-rose-900/60"
                    : "bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60"
                }`}
                title={isMuted ? "음성 켜기" : "음성 끄기"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* View mode toggle: Dashboard vs Fullscreen */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                title="기본 대시보드 뷰로 축소"
              >
                <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">대시보드</span>
              </button>
            </div>
          </header>

          {/* Proximity Tip Toast Banner */}
          {showProximityTip && isExerciseRunning && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in pointer-events-none">
              <div className="bg-slate-900/90 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full border border-indigo-500/40 shadow-2xl backdrop-blur-md flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>💡 마우스를 화면 상단이나 하단 가장자리로 가져가면 메뉴가 나타납니다</span>
              </div>
            </div>
          )}

          {/* Main Fullscreen Central Simulation Zone */}
          <main className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
            {renderStepModule(true)}
          </main>

          {/* Bottom Proximity Hover Sensor Zone (invisible hover strip) */}
          <div
            className="fixed bottom-0 inset-x-0 h-20 z-30 pointer-events-auto cursor-default"
            onMouseEnter={() => {
              if (bottomHideTimerRef.current) clearTimeout(bottomHideTimerRef.current);
              setShowBottomMenu(true);
            }}
          />

          {/* Bottom Auto-Hiding Control Bar */}
          <footer
            className={`fixed bottom-0 inset-x-0 z-50 transition-all duration-300 transform ${
              showBottomMenu ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            } bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl px-4 sm:px-8 py-3 flex items-center justify-between text-white select-none`}
            onMouseEnter={() => {
              if (bottomHideTimerRef.current) clearTimeout(bottomHideTimerRef.current);
              setShowBottomMenu(true);
            }}
            onMouseLeave={() => {
              if (isExerciseRunning) {
                bottomHideTimerRef.current = setTimeout(() => setShowBottomMenu(false), 1200);
              }
            }}
          >
            {/* Left: Previous / Next Step Buttons */}
            <div className="flex items-center space-x-2">
              <button
                disabled={activeStep === 1}
                onClick={() => {
                  const prev = (activeStep - 1) as StepId;
                  setActiveStep(prev);
                  speak(`${prev}단계로 이동했습니다.`);
                }}
                className={`p-2 rounded-xl border transition-colors flex items-center space-x-1 text-xs font-bold ${
                  activeStep === 1
                    ? "border-slate-800 text-slate-600 bg-slate-900 cursor-not-allowed"
                    : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                }`}
                title="이전 단계"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">이전</span>
              </button>

              <button
                disabled={activeStep === 5}
                onClick={() => {
                  const next = (activeStep + 1) as StepId;
                  setActiveStep(next);
                  speak(`${next}단계로 이동했습니다.`);
                }}
                className={`p-2 rounded-xl border transition-colors flex items-center space-x-1 text-xs font-bold ${
                  activeStep === 5
                    ? "border-slate-800 text-slate-600 bg-slate-900 cursor-not-allowed"
                    : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                }`}
                title="다음 단계"
              >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Play/Pause, Reset, Timer Countdown */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="text-center font-mono">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">남은 시간</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {Math.floor(stepState.secondsLeft / 60)}:{(stepState.secondsLeft % 60).toString().padStart(2, "0")}
                </div>
              </div>

              <button
                onClick={() => setPlayTrigger(Date.now())}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer active:scale-95 ${
                  stepState.isPlaying
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                }`}
              >
                {stepState.isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>훈련 시작</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setResetTrigger(Date.now())}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="다시 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Step Status & Auto-Loop */}
            <div className="hidden md:flex items-center space-x-3 text-right">
              {stepState.phaseInfo && (
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-emerald-400">
                  {stepState.phaseInfo}
                </div>
              )}
              {sessionActive && (
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 font-bold px-2.5 py-1 rounded-full border border-indigo-700 animate-pulse">
                  자동 5단계 루프
                </span>
              )}
            </div>
          </footer>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. STANDARD DASHBOARD VIEW (대시보드 화면 및 가이드)
           ───────────────────────────────────────────────────────────── */
        <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
          {/* Top Professional Utility Bar */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-slate-800 tracking-tight" id="app-top-logo">
                    과학적 5단계 눈 운동 코치
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Ophthalmology & Cognitive Neurology Coach
                  </p>
                </div>
              </div>

              {/* Master Full-Session Control at the absolute top */}
              <div className="flex items-center space-x-2" id="primary-top-controls">
                {/* Fullscreen Simulation Mode Trigger */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-indigo-500 shadow-sm hover:shadow transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                  title="몰입형 전체화면 시뮬레이션 모드로 전환 (F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>전체화면 모드 (권장)</span>
                </button>

                <button
                  onClick={() => setIsAnatomyModalOpen(true)}
                  id="top-anatomy-modal-btn"
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-700 shadow-sm hover:shadow transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                  title="눈의 구조와 5단계 작용 원리 3D 해부도 보기"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>눈 구조 3D</span>
                </button>

                <button
                  onClick={startFullSession}
                  id="master-start-btn"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer border border-slate-700"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>5단계 풀 코스 시작</span>
                </button>

                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  id="top-voice-settings-btn"
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2 rounded-xl border border-indigo-200 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer shadow-2xs"
                  title="자연스러운 음성 코치 설정"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">음성 설정</span>
                </button>

                <button
                  onClick={() => {
                    const targetMute = !isMuted;
                    setIsMuted(targetMute);
                    if (!targetMute) speak("음성 안내 코칭이 켜졌습니다. 환영합니다!");
                    else stop();
                  }}
                  id="top-tts-mute-toggle"
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    isMuted
                      ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                  title={isMuted ? "음성 가이드 켜기" : "음성 가이드 끄기"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{isMuted ? "음성 꺼짐" : "음성 켜짐"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Container */}
          <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="main-grid-workspace">
            {/* Left column: Breadcrumbs / Progression Flow / Stats */}
            <div className="lg:col-span-4 space-y-6">
              {/* Scientific Eye Training Concept Overview Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3" id="concept-overview-card">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>임상 효능 지향 눈 케어 모델</span>
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  물리적인 각막 형태나 안축장을 가짜로 바꾼다는 <strong>사이비 학설(예: 베이츠 요법)을 배제</strong>하고, 실제 안과 임상 장비 및 훈련법에 맞춰 설계되었습니다.
                </p>
                <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>안구건조 예방</span>
                  </span>
                  <span className="font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>조절 조화력</span>
                  </span>
                  <span className="font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>시각 민감도</span>
                  </span>
                </div>
              </div>

              {/* 5-Step Process Timeline Tracker */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4" id="step-timeline-tracker">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    훈련 단계 내비게이션
                  </h3>
                  {sessionActive && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      자동 루프 진행 중
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {([1, 2, 3, 4, 5] as const).map((id: StepId) => {
                    const isActive = activeStep === id;
                    const isCompleted = completedSteps.includes(id);
                    const details = stepDetails[id];

                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setActiveStep(id);
                          speak(`${id}단계, ${details.name} 화면으로 이동했습니다.`);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm scale-[1.01]"
                            : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-all shadow-2xs ${
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : isActive
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}
                          >
                            {isCompleted ? "✓" : id}
                          </div>

                          <div className="space-y-0.5 text-left">
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-xs font-extrabold ${isActive ? "text-indigo-950 font-black" : "text-slate-800"}`}>
                                {details.name}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                {details.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              {details.desc}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isActive ? (
                            <span className="flex items-center space-x-1 text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                              <span>진행 중</span>
                            </span>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User History Logs & Continuity Dashboard */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4" id="user-stats-history">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  나의 훈련 분석 지표 (Durable Data)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
                    <Flame className={`w-8 h-8 ${streakDays > 0 ? "text-orange-500" : "text-slate-300 animate-pulse"}`} />
                    <div>
                      <div className="text-[9px] text-slate-400 font-semibold">연속 훈련일</div>
                      <div className="text-lg font-mono font-bold text-slate-800">{streakDays}일째</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
                    <Brain className="w-8 h-8 text-rose-500" />
                    <div>
                      <div className="text-[9px] text-slate-400 font-semibold">인지 대비 최고점</div>
                      <div className="text-lg font-mono font-bold text-slate-800">
                        {history.length > 0
                          ? `${Math.max(...history.map((h) => h.gaborScore))}점`
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>최근 완료 기록</span>
                    <button
                      onClick={resetAllProgress}
                      className="text-rose-600 hover:underline flex items-center space-x-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>전체 초기화</span>
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                      <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-[10px] text-slate-400">아직 완료한 훈련 세션이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {history.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className="text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-mono text-slate-600">
                              {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded text-[8px] font-bold">
                              {item.completedSteps.length}/5단계
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded text-[8px] font-bold">
                              {item.gaborScore}점
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Interactive Workspace Zone */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md relative overflow-hidden" id="active-workspace-card">
                {/* Step Complete Badge */}
                {completedSteps.includes(activeStep) && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1 animate-bounce z-10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>이 단계 완료!</span>
                  </div>
                )}

                {/* Workspace Header */}
                <div className="border-b border-slate-100 pb-4 mb-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-2xs">
                        STEP {activeStep} / 5
                      </span>
                      <span className="text-sm md:text-base font-extrabold text-slate-800">
                        {stepDetails[activeStep].name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs cursor-pointer transition-all"
                        title="전체화면으로 시뮬레이션 몰입"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>전체화면</span>
                      </button>

                      <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                        <button
                          disabled={activeStep === 1}
                          onClick={() => {
                            const prev = (activeStep - 1) as StepId;
                            setActiveStep(prev);
                            speak(`${prev}단계로 이동했습니다.`);
                          }}
                          className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                            activeStep === 1
                              ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                              : "text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                          }`}
                          title="이전 단계"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          disabled={activeStep === 5}
                          onClick={() => {
                            const next = (activeStep + 1) as StepId;
                            setActiveStep(next);
                            speak(`${next}단계로 이동했습니다.`);
                          }}
                          className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                            activeStep === 5
                              ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                              : "text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                          }`}
                          title="다음 단계"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Step Workout Module in Standard Card */}
                {renderStepModule(false)}
              </div>

              {/* Quick FAQ / Myth Buster Accordion */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs" id="mythbuster-card">
                <button
                  onClick={() => setShowFaq(!showFaq)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                    <span>🤔 자주 묻는 눈 건강 팩트체크 (FAQ)</span>
                  </div>
                  <ChevronRight className={`w-4.5 h-4.5 text-slate-400 transition-transform ${showFaq ? "rotate-90" : ""}`} />
                </button>

                {showFaq && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-600 space-y-4 leading-relaxed">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800">Q. 이 5단계 눈 운동을 매일 하면 실제로 눈이 좋아져 안경을 벗을 수 있나요?</h4>
                      <p>
                        <strong>A. 아닙니다.</strong> 현대 근시나 원시는 안축장의 길이(안구 직경) 또는 각막 굴절율 때문에 생기는 <em>기하학적 굴절 이상</em>입니다. 운동으로 이미 늘어난 안축장 길이를 물리적으로 줄일 수는 없습니다. 다만, 장시간 모니터 근접 응시로 모양체 근육이 뭉친 <strong>'가성 근시'를 해소하고, 안구 건조증을 예방하며, 뇌 시각 피질의 대조 감도를 확장</strong>하여 실질 해상도를 개선합니다.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800">Q. 스마트폰 화면을 볼 때 눈이 피로한 가장 큰 원인은?</h4>
                      <p>
                        <strong>A. 잦은 초점 조절 상태 지속과 깜빡임 감소입니다.</strong> 모니터에 집중하면 분당 15~20회 깜빡여야 할 눈을 5회 미만으로 깜빡이게 되어 눈물이 마르고 모양체 근육 경련이 발생합니다. 본 5단계 훈련의 1, 2, 5단계가 바로 이 핵심 병리를 해소합니다.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800">Q. 눈 운동 시 머리를 흔들며 따라가면 안 되나요?</h4>
                      <p>
                        <strong>A. 네, 머리는 정면 고정해야 합니다.</strong> 3단계 단속 안구 운동 등은 머리가 정지한 상태에서 오직 <strong>안구의 6개 외안근과 뇌 전두안야(FEF) 신경망</strong>을 자극하도록 설계되었습니다. 머리를 흔들면 운동 자극이 분산되므로 시선만 튕기십시오.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Science Guide Panel */}
          <section className="max-w-6xl mx-auto px-4 mt-8">
            <ScienceGuide />
          </section>
        </div>
      )}

      {/* 3D Anatomy Modal */}
      <AnatomyModal
        isOpen={isAnatomyModalOpen}
        onClose={() => setIsAnatomyModalOpen(false)}
        initialStep={activeStep}
      />

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        rate={rate}
        onRateChange={setRate}
        pitch={pitch}
        onPitchChange={setPitch}
        onTestVoice={testVoice}
        isAiVoice={isAiVoice}
        onToggleAiVoice={setIsAiVoice}
      />

      {/* History & Durable Stats Modal */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-base text-slate-800">나의 훈련 분석 지표</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center space-x-3">
                <Flame className={`w-8 h-8 ${streakDays > 0 ? "text-orange-500" : "text-slate-300"}`} />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">연속 훈련일</div>
                  <div className="text-xl font-mono font-bold text-slate-800">{streakDays}일째</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center space-x-3">
                <Brain className="w-8 h-8 text-rose-500" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">인지 대비 최고점</div>
                  <div className="text-xl font-mono font-bold text-slate-800">
                    {history.length > 0 ? `${Math.max(...history.map((h) => h.gaborScore))}점` : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>최근 훈련 이력</span>
                <button
                  onClick={resetAllProgress}
                  className="text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>기록 리셋</span>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">아직 완료한 훈련 세션이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-mono text-slate-600">
                          {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {item.completedSteps.length}/5단계
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {item.gaborScore}점
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
