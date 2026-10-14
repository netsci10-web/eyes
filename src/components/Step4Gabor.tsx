import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Brain, Check, ShieldAlert, Zap } from "lucide-react";

interface Step4Props {
  isActive: boolean;
  onComplete: () => void;
  speak: (text: string) => void;
  onScoreUpdate?: (score: number) => void;
}

// Orientations: 0 = Vertical, 45 = Diagonal Right (/), 90 = Horizontal (-), 135 = Diagonal Left (\)
const ORIENTATIONS = [
  { angle: 0, label: "수직 (|)", icon: "│" },
  { angle: 45, label: "대각선 우 (/)", icon: "╱" },
  { angle: 90, label: "수평 (—)", icon: "─" },
  { angle: 135, label: "대각선 좌 (\\)", icon: "╲" },
];

export default function Step4Gabor({ isActive, onComplete, speak, onScoreUpdate }: Step4Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [contrast, setContrast] = useState(0.8); // 80% initial contrast
  const [frequency, setFrequency] = useState(0.06); // typical spatial frequency
  const [sigma, setSigma] = useState(25); // Gaussian size
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestContrast, setBestContrast] = useState(1.0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger speech
  useEffect(() => {
    if (isActive && isPlaying) {
      speak(
        "네 번째 단계인 대조 감도 극대화 훈련을 시작합니다. 화면 중앙의 흐릿한 줄무늬 패치 방향을 판별하여 아래 네 가지 버튼 중 올바른 무늬를 선택해 보세요."
      );
    }
  }, [isActive]);

  // Handle drawing when variables change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const angle = ORIENTATIONS[currentAngleIndex].angle;
    drawGaborPatch(canvas, angle, frequency, contrast, sigma);
  }, [currentAngleIndex, contrast, frequency, sigma, isPlaying]);

  // Main countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            speak(`훈련 완료! 최소 인지 대조 장벽은 ${Math.round(bestContrast * 100)}%였습니다. 대뇌 시각령 인지 감도를 확장했습니다.`);
            if (onScoreUpdate) {
              onScoreUpdate(Math.round((1 - bestContrast) * 100)); // Higher score for lower contrast detected
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

  // Mathematical Gabor Patch rendering
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
        // Center-relative coordinates
        const dx = x - cx;
        const dy = y - cy;

        // Rotate coordinate system by theta
        const xPrime = dx * Math.cos(theta) + dy * Math.sin(theta);
        const yPrime = -dx * Math.sin(theta) + dy * Math.cos(theta);

        // Circular Gaussian envelope
        const gaussian = Math.exp(-(xPrime * xPrime + yPrime * yPrime) / (2 * sig * sig));

        // Sinusoidal grating
        const grating = Math.cos(2 * Math.PI * freq * xPrime);

        // Gray background (128) + amplitude modulations
        // Contrast scales from 0.0 to 1.0
        const val = 128 + 127 * contr * grating * gaussian;

        // Clamp to 0-255 range
        const clampedVal = Math.max(0, Math.min(255, val));

        const index = (y * width + x) * 4;
        data[index] = clampedVal; // R
        data[index + 1] = clampedVal; // G
        data[index + 2] = clampedVal; // B
        data[index + 3] = 255; // Alpha opaque
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw visual focus ring around the canvas for eyes to settle
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  };

  const generateNewPatch = () => {
    const nextIndex = Math.floor(Math.random() * ORIENTATIONS.length);
    setCurrentAngleIndex(nextIndex);
  };

  const handleSelection = (angleIndex: number) => {
    if (!isPlaying) return;

    if (angleIndex === currentAngleIndex) {
      // Success! Correct orientation.
      setScore((s) => s + 10);
      setStreak((s) => s + 1);

      // Decreasing contrast makes it harder (perceptual learning)
      const nextContrast = Math.max(0.01, contrast * 0.75); // Decrease contrast by 25% each time
      setContrast(nextContrast);
      if (nextContrast < bestContrast) {
        setBestContrast(nextContrast);
      }

      setFeedback({ type: "success", text: "정답! 대비 감도가 강해지고 있습니다." });
      speak("정답입니다");

      setTimeout(() => {
        setFeedback({ type: null, text: "" });
        generateNewPatch();
      }, 800);
    } else {
      // Mistake. Let's make it slightly easier to guide visual alignment
      setStreak(0);
      const nextContrast = Math.min(1.0, contrast * 1.3); // Increase contrast by 30% on mistake
      setContrast(nextContrast);

      setFeedback({
        type: "error",
        text: `오답. 원래 방향은 [${ORIENTATIONS[currentAngleIndex].label}]였습니다.`,
      });
      speak("방향이 다릅니다");

      setTimeout(() => {
        setFeedback({ type: null, text: "" });
        generateNewPatch();
      }, 1500);
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

  return (
    <div id="step-4-container" className="flex flex-col items-center space-y-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-2" id="step4-header-title">
          <Brain className="w-5 h-5 text-indigo-500" />
          <span>4단계: 대조 감도 극대화 훈련 (Gabor Contrast)</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-lg">
          뇌의 <em>일차 시각 피질(V1, Visual Cortex)</em>의 대비 감도(Contrast Sensitivity) 가소성을 자극합니다. 줄무늬가 연해질수록 해상도가 높아집니다.
        </p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm" id="gabor-metrics">
        <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
          <div className="text-[10px] text-slate-400 font-semibold">현재 대비 장벽</div>
          <div className="text-sm font-mono font-bold text-slate-700">
            {Math.round(contrast * 100)}%
          </div>
        </div>
        <div className="bg-indigo-50/50 p-2 rounded-xl text-center border border-indigo-100/50">
          <div className="text-[10px] text-indigo-600 font-semibold">최소 인지 대비</div>
          <div className="text-sm font-mono font-bold text-indigo-700">
            {bestContrast === 1.0 ? "-" : `${Math.round(bestContrast * 100)}%`}
          </div>
        </div>
        <div className="bg-emerald-50/50 p-2 rounded-xl text-center border border-emerald-100/50">
          <div className="text-[10px] text-emerald-600 font-semibold">시각 피질 점수</div>
          <div className="text-sm font-mono font-bold text-emerald-700">
            {score}점
          </div>
        </div>
      </div>

      {/* Canvas workspace for Gabor Pattern */}
      <div className="relative flex flex-col items-center" id="gabor-canvas-container">
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="bg-[rgb(128,128,128)] rounded-2xl shadow-inner border border-slate-300 select-none cursor-default transition-all"
        />

        {/* Real-time Feedback Toast Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 text-center pointer-events-none">
          {feedback.type === "success" && (
            <div className="bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center justify-center space-x-1 border border-emerald-400 animate-bounce">
              <Check className="w-3.5 h-3.5" />
              <span>{feedback.text}</span>
            </div>
          )}
          {feedback.type === "error" && (
            <div className="bg-rose-500 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-lg flex items-center justify-center space-x-1 border border-rose-400">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        {/* Tutorial Overlay */}
        {!isPlaying && secondsLeft === 60 && (
          <div className="absolute inset-0 bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center text-center p-4 space-y-2">
            <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
            <p className="text-xs text-white font-semibold">인지신경학적 지능형 시력 강화</p>
            <p className="text-[10px] text-slate-300 max-w-[160px] leading-relaxed">
              화면에 나타나는 <strong>줄무늬 패턴의 방향</strong>을 관찰하고 하단 버튼을 클릭하여 시각 피질 대비 민감성을 늘리십시오!
            </p>
          </div>
        )}
      </div>

      {/* Selection Control Buttons */}
      <div className="w-full max-w-sm space-y-2">
        <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          {isPlaying ? "관찰되는 무늬의 방향을 클릭하세요" : "준비 후 아래 시작을 누르세요"}
        </div>
        <div className="grid grid-cols-4 gap-2" id="gabor-button-grid">
          {ORIENTATIONS.map((orient, idx) => (
            <button
              key={idx}
              disabled={!isPlaying}
              onClick={() => handleSelection(idx)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all ${
                isPlaying
                  ? "bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700 active:scale-95 cursor-pointer shadow-xs"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span className="text-2xl font-bold font-sans h-8 flex items-center">{orient.icon}</span>
              <span className="text-[10px] mt-1 text-slate-500 font-medium whitespace-nowrap">{orient.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Play actions & total countdown */}
      <div className="flex items-center space-x-6 w-full max-w-sm justify-between">
        <div className="text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">훈련 종료 시간</div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            id="step4-play-btn"
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
            id="step4-reset-btn"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide details */}
      <div className="w-full max-w-sm border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-1">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">가이드</h4>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          연속으로 정답을 맞출수록 줄무늬의 진함(대비율)이 **극단적으로 약해지며** 시각 피질의 인지 한계치(Contrast Threshold)를 극대화합니다. 틀리면 패치가 잘 보이기 위해 진해집니다.
        </p>
      </div>
    </div>
  );
}
