import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step5Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
}

type BreathPhase = "INHALE" | "HOLD" | "EXHALE";

export default function Step5FarFocus({ isActive, onComplete, speak }: Step5Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20); // 20-20-20 rule uses exactly 20 seconds
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("INHALE");
  const [breathSeconds, setBreathSeconds] = useState(4); // 4 seconds cycles

  // Speech initialization
  useEffect(() => {
    if (isActive && isPlaying) {
      speak(
        "마지막 단계인 20 20 20 원거리 이완 훈련입니다. 화면에서 시선을 돌려, 방 건너편 창문 밖 가로수나 벽지 등 최소 6미터 이상 먼 물체를 편안하게 20초간 바라보십시오. 어깨 힘을 빼고 심호흡 가이드를 따라 호흡하세요."
      );
    }
  }, [isActive]);

  // Voice coaching on breath phase changes
  useEffect(() => {
    if (!isPlaying) return;

    if (breathPhase === "INHALE") {
      speak("천천히 숨을 깊이 들이마시세요");
    } else if (breathPhase === "HOLD") {
      speak("가볍게 숨을 멈추고 먼 곳에 초점을 푸세요");
    } else if (breathPhase === "EXHALE") {
      speak("몸에 남아있는 모든 피로와 이산화탄소를 내뱉으세요");
    }
  }, [breathPhase, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        // Countdown of the 20-second release
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak("모든 5단계 안과학 기반 눈 운동 훈련이 종료되었습니다. 눈 주변이 훨씬 시원하고 맑아진 느낌을 만끽해 보십시오. 정말 훌륭합니다!");
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        // Breathing cycle: Inhale(4s) -> Hold(4s) -> Exhale(4s)
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((curr) => {
              if (curr === "INHALE") return "HOLD";
              if (curr === "HOLD") return "EXHALE";
              return "INHALE";
            });
            return 4; // Reset to 4s
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
    if (!isPlaying && secondsLeft === 20) {
      setBreathPhase("INHALE");
      setBreathSeconds(4);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSecondsLeft(20);
    setBreathPhase("INHALE");
    setBreathSeconds(4);
  };

  const getBreathLabel = () => {
    if (breathPhase === "INHALE") return "들숨: 깊이 들이마시기 (4초)";
    if (breathPhase === "HOLD") return "멈춤: 가만히 먼 곳 응시 (4초)";
    return "날숨: 편안하게 내쉬기 (4초)";
  };

  const getBreathColor = () => {
    if (breathPhase === "INHALE") return "text-indigo-600 bg-indigo-50 border-indigo-200";
    if (breathPhase === "HOLD") return "text-teal-600 bg-teal-50 border-teal-200";
    return "text-pink-600 bg-pink-50 border-pink-200";
  };

  return (
    <div id="step-5-container" className="flex flex-col items-center space-y-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-2" id="step5-header-title">
          <Eye className="w-5 h-5 text-indigo-500" />
          <span>5단계: 20-20-20 규칙 원거리 이완 (Spasm Release)</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-lg">
          미국안과학회(AAO) 공식 지침입니다. 화면 높이에서 고개를 가볍게 돌려 **최소 20피트(약 6미터)** 이상 멀리 떨어진 실제 물체를 20초 이상 무기장 상태로 주시합니다.
        </p>
      </div>

      {/* Horizon Serene Landscape Simulation Visual */}
      <div className="relative w-full max-w-sm h-64 bg-gradient-to-b from-sky-400 via-emerald-100 to-amber-50 rounded-2xl border border-sky-200 overflow-hidden" id="step5-visual-canvas">
        {/* Layered landscape hills with CSS */}
        <div className="absolute bottom-0 w-full h-24 bg-emerald-700/30 rounded-t-[100px] blur-sm transform translate-y-6" />
        <div className="absolute bottom-0 w-full h-16 bg-emerald-800/40 rounded-t-[120px] blur-xs transform translate-y-3" />
        <div className="absolute bottom-0 w-full h-10 bg-emerald-900/40 rounded-t-[140px]" />

        {/* Floating clouds */}
        <div className="absolute top-12 left-8 w-16 h-4 bg-white/60 rounded-full blur-xs animate-pulse" />
        <div className="absolute top-16 right-12 w-24 h-6 bg-white/50 rounded-full blur-xs" />

        {/* Infinite Focal Horizon Dot */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-amber-400/80 border-2 border-white animate-ping" style={{ animationDuration: "4s" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute border border-white" />
          <p className="text-[10px] text-emerald-950 font-bold mt-3 bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
            여기가 아닌, 현실의 먼 창 밖을 주시하세요!
          </p>
        </div>

        {/* Interactive Breath Expansion Circle overlay */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={breathPhase}
                initial={{ scale: breathPhase === "INHALE" ? 0.4 : breathPhase === "HOLD" ? 1.0 : 1.2, opacity: 0.2 }}
                animate={{
                  scale: breathPhase === "INHALE" ? 1.2 : breathPhase === "HOLD" ? 1.2 : 0.4,
                  opacity: breathPhase === "HOLD" ? 0.6 : 0.4,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className={`w-40 h-40 rounded-full border-4 ${
                  breathPhase === "INHALE"
                    ? "border-indigo-400/30 bg-indigo-400/5"
                    : breathPhase === "HOLD"
                    ? "border-teal-400/30 bg-teal-400/5"
                    : "border-pink-400/30 bg-pink-400/5"
                }`}
              />
            </AnimatePresence>
          </div>
        )}

        {/* Breathing Phase Toast overlay */}
        {isPlaying && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 text-center">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-md transition-all ${getBreathColor()}`}>
              {getBreathLabel()}
            </div>
          </div>
        )}
      </div>

      {/* Control Actions & Timer */}
      <div className="flex items-center space-x-6 w-full max-w-sm justify-between">
        <div className="text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">남은 릴랙스 시간</div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {secondsLeft}초 / 20초
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            id="step5-play-btn"
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
            id="step5-reset-btn"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide details */}
      <div className="w-full max-w-sm border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">호흡 가이드</h4>
        <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
          <li><strong>들숨 (4초):</strong> 코로 깊고 조용하게 횡격막을 부풀리며 들이쉬세요.</li>
          <li><strong>숨참기 (4초):</strong> 가볍게 숨을 잡은 상태에서, 주시하는 먼 물체 주변의 시야를 넓게 포착하세요.</li>
          <li><strong>날숨 (4초):</strong> 입으로 끝까지 따뜻하게 호흡을 뿜어내며 심신의 조절 긴장을 가라앉히세요.</li>
        </ul>
      </div>
    </div>
  );
}
