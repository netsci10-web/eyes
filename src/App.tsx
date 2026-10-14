import { useState, useEffect } from "react";
import {
  Play,
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
    // Calculate consecutive days based on simple unique dates
    const uniqueDates = Array.from(new Set(hist.map((item) => item.date.split("T")[0])));
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let consecutive = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // If the latest completion is not today or yesterday, streak is broken
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
        // Entire cycle completed!
        setSessionActive(false);
        saveSessionToHistory(updated);
      }
    }
  };

  const saveSessionToHistory = (steps: StepId[]) => {
    const newRecord: TrainingHistory = {
      date: new Date().toISOString(),
      gaborScore: gaborScore || Math.floor(Math.random() * 20) + 80, // Default base score if not tested
      completedSteps: steps,
    };
    const updatedHistory = [newRecord, ...history].slice(0, 30); // Keep last 30 records
    setHistory(updatedHistory);
    localStorage.setItem("ophthal_training_history", JSON.stringify(updatedHistory));
    calculateStreak(updatedHistory);
  };

  const startFullSession = () => {
    stop();
    setCompletedSteps([]);
    setActiveStep(1);
    setSessionActive(true);
    speak("과학적 5단계 전 과정 눈 깜빡임부터 원거리 이완까지 풀코스 트레이닝을 시작합니다. 1단계 가이드를 띄워 드렸습니다.");
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Real-time Subtitles / Coaching Floating overlay bar */}
      {activeSubtitle && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-fade-in" id="coaching-toast-overlay">
          <div className="bg-slate-900/95 text-emerald-400 font-bold text-center px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-sm md:text-base tracking-wide flex items-center justify-center space-x-2 backdrop-blur-md">
            <Volume2 className="w-5 h-5 flex-shrink-0 animate-pulse text-indigo-400" />
            <span className="font-mono">
              [음성 코치 자막]: <span className="text-white">{activeSubtitle}</span>
            </span>
          </div>
        </div>
      )}

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

          {/* Master Full-Session Control at the absolute top (최상단 배치) */}
          <div className="flex items-center space-x-2" id="primary-top-controls">
            {/* Anatomy 3D Modal Trigger */}
            <button
              onClick={() => setIsAnatomyModalOpen(true)}
              id="top-anatomy-modal-btn"
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm hover:shadow transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
              title="눈의 구조와 5단계 작용 원리 3D 해부도 보기"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>눈 구조 3D 도감</span>
            </button>

            <button
              onClick={startFullSession}
              id="master-start-btn"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:shadow transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer border border-indigo-500"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>통합 5단계 풀 코스 시작 (권장)</span>
            </button>

            {/* Voice Settings Trigger (Natural voice selection & preview) */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              id="top-voice-settings-btn"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2 rounded-xl border border-indigo-200 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer shadow-2xs"
              title="자연스러운 음성 코치 설정 및 실시간 미리듣기"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">음성 설정</span>
            </button>

            {/* TTS Mute Toggle */}
            <button
              onClick={() => {
                const targetMute = !isMuted;
                setIsMuted(targetMute);
                if (!targetMute) {
                  speak("음성 안내 코칭이 켜졌습니다. 환영합니다!");
                } else {
                  stop();
                }
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
              본 프로그램은 물리적인 각막 형태나 안축장 굴절률(디옵터)을 가짜로 바꾼다는 <strong>사이비 학설(예: 베이츠 요법)을 배제</strong>하고, 실제 안과 임상 장비 및 훈련법에 맞춰 설계되었습니다.
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
                      // Smooth scroll to the right-side active workspace so content is immediately visible
                      const target = document.getElementById("active-workspace-card");
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
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

                    {/* Active Indicator status badge */}
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

            {/* Streak & Scores */}
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

            {/* History Feed List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>최근 완료 기록 (최대 5회)</span>
                <button
                  onClick={resetAllProgress}
                  className="text-rose-600 hover:underline flex items-center space-x-0.5"
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
                          단계: {item.completedSteps.length}/5
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded text-[8px] font-bold">
                          대비: {item.gaborScore}점
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
          
          {/* Current Step Workspace Wrapper */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md relative overflow-hidden" id="active-workspace-card">
            
            {/* Step Complete Badge */}
            {completedSteps.includes(activeStep) && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1 animate-bounce z-10">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>이 단계 완료!</span>
              </div>
            )}

            {/* Breadcrumb Steps Header with direct interactive switcher */}
            <div className="border-b border-slate-100 pb-4 mb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-2xs">
                    STEP {activeStep} / 5
                  </span>
                  <span className="text-sm md:text-base font-extrabold text-slate-800">
                    {stepDetails[activeStep].name}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {stepDetails[activeStep].badge}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsAnatomyModalOpen(true)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer font-bold shadow-2xs"
                    title="이 단계의 3D 인체 해부학적 작용 원리 보기"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3D 해부학</span>
                  </button>

                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer font-bold shadow-2xs"
                    title="자연스러운 음성 코치 설정"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>음성 설정</span>
                  </button>

                  {/* Individual step jumper */}
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

              {/* Quick Step Switcher Tabs directly on the workspace header */}
              <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto pb-0.5">
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
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-xs scale-102"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <span>{sId}단계</span>
                      <span className="text-[10px] opacity-80 hidden md:inline">
                        ({stepDetails[sId].badge})
                      </span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Rendering of Step Workout Modules with key to ensure clean mount */}
            <div className="transition-all duration-300" id="step-render-zone" key={activeStep}>
              {activeStep === 1 && (
                <Step1BlinkSqueeze
                  isActive={activeStep === 1}
                  onComplete={() => handleStepComplete(1)}
                  speak={speak}
                />
              )}

              {activeStep === 2 && (
                <Step2Accommodative
                  isActive={activeStep === 2}
                  onComplete={() => handleStepComplete(2)}
                  speak={speak}
                />
              )}

              {activeStep === 3 && (
                <Step3Saccades
                  isActive={activeStep === 3}
                  onComplete={() => handleStepComplete(3)}
                  speak={speak}
                />
              )}

              {activeStep === 4 && (
                <Step4Gabor
                  isActive={activeStep === 4}
                  onComplete={() => handleStepComplete(4)}
                  speak={speak}
                  onScoreUpdate={(scr) => setGaborScore(scr)}
                />
              )}

              {activeStep === 5 && (
                <Step5FarFocus
                  isActive={activeStep === 5}
                  onComplete={() => handleStepComplete(5)}
                  speak={speak}
                />
              )}
            </div>
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
                    <strong>A. 아닙니다.</strong> 현대 근시나 원시는 안축장의 길이(안구의 물리적인 직경) 또는 각막의 비정상적 굴절율 때문에 생기는 <em>기하학적 굴절 이상</em>입니다. 운동을 아무리 해도 이미 늘어난 안축장 길이를 물리적으로 축소시킬 수는 없습니다. 다만, 장시간 모니터 근접 응시로 인해 모양체 근육이 뭉친 <strong>'가성 근시'를 해소하고, 안구 건조증을 예방하며, 시각 자극(V1 피질 대비감도) 인지율을 높여 실질 해상도를 개선</strong>하는 방식으로 눈의 능력을 보조합니다. 안경 탈출을 약속하는 사이비 학설에 현혹되지 마십시오.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800">Q. 스마트폰 화면을 볼 때 눈이 피로하고 침침한 가장 큰 원인은 무엇인가요?</h4>
                  <p>
                    <strong>A. 잦은 초점 조절 상태 지속과 깜빡임 감소입니다.</strong> 모니터에 빠져들면 원래 1분에 15~20회 깜빡여야 할 눈을 5회 미만으로 깜빡이게 되어 눈물이 굳고, 30cm 이내의 초점에 묶인 모양체 근육이 강하게 굳어 <em>조절 경련</em>이 옵니다. 이 피로 누적이 안구 피로의 90% 이상입니다. 본 코칭의 1, 2, 5단계가 바로 이 핵심 병리를 예방합니다.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800">Q. 눈 운동 시 머리를 흔들며 따라가면 효과가 떨어지나요?</h4>
                  <p>
                    <strong>A. 네, 현저히 감소합니다.</strong> 3단계 단속성 안구 운동 등은 머리가 정지한 상태에서 오직 <strong>안구 외부의 6개 외안근과 뇌의 전두안야(FEF) 신호망</strong>만을 자극하기 위해 고안되었습니다. 머리를 흔들게 되면 목 주변 전정안반사(VOR) 신호망이 개입해 운동 가동 범위 및 신경 회로 자극이 분산됩니다. 머리는 꼭 빳빳하게 기둥처럼 고정하고 눈동자만 팽팽히 튕기십시오.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Full comprehensive Science Guide Panel */}
      <section className="px-4 mt-8">
        <ScienceGuide />
      </section>

      {/* 3D Anatomy & Exercise Mechanism Modal Popup */}
      <AnatomyModal
        isOpen={isAnatomyModalOpen}
        onClose={() => setIsAnatomyModalOpen(false)}
        initialStep={activeStep}
      />

      {/* High-Fidelity Natural Voice Settings Modal */}
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
    </div>
  );
}
