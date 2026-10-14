import { useState } from "react";
import { X, Volume2, Sparkles, Sliders, Check, Play, UserCheck, RefreshCw, ShieldCheck, Captions } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice | null) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  onTestVoice: () => void;
  isAiVoice: boolean;
  onToggleAiVoice: (val: boolean) => void;
  showSubtitles: boolean;
  onToggleSubtitles: (val: boolean) => void;
}

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onSelectVoice,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  onTestVoice,
  isAiVoice,
  onToggleAiVoice,
  showSubtitles,
  onToggleSubtitles,
}: VoiceSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  자연스러운 음성 코칭 설정
                </h3>
                <p className="text-xs text-slate-500">
                  기계음 배제 · 자연스러운 억양 · 중간 끊김 방지 최적화
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>추천 음성 스타일 프리셋</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onRateChange(0.95);
                    onPitchChange(1.04);
                    // Find a natural female voice if possible
                    const naturalKo = voices.find(
                      (v) =>
                        v.name.includes("SunHi") ||
                        v.name.includes("Yuna") ||
                        v.name.includes("Natural") ||
                        (v.name.includes("Google") && !v.name.includes("Male"))
                    );
                    if (naturalKo) onSelectVoice(naturalKo);
                  }}
                  className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-indigo-900">
                      🌸 자연스러운 여성 코치 (권장)
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-600 leading-tight">
                    차분하고 따뜻한 톤 · 528Hz 마인드풀 차임벨 연동
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRateChange(0.92);
                    onPitchChange(0.94);
                    // Find a male voice if possible
                    const maleKo = voices.find(
                      (v) =>
                        v.name.includes("InJoon") ||
                        v.name.includes("Male") ||
                        v.name.includes("남성")
                    );
                    if (maleKo) onSelectVoice(maleKo);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-800">
                      🌿 차분한 남성 코치
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    묵직하고 안정적인 톤 · 편안한 릴랙스 템포
                  </p>
                </button>
              </div>
            </div>

            {/* Voice Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  내 기기에 설치된 음성 엔진 선택
                </label>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {voices.length}개 발견됨
                </span>
              </div>

              <select
                value={selectedVoice?.name || ""}
                onChange={(e) => {
                  const found = voices.find((v) => v.name === e.target.value);
                  if (found) onSelectVoice(found);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {voices.map((v) => {
                  const isHighQuality =
                    v.name.includes("Natural") ||
                    v.name.includes("Enhanced") ||
                    v.name.includes("Google") ||
                    v.name.includes("Online");
                  return (
                    <option key={v.name} value={v.name}>
                      {isHighQuality ? "⭐ " : ""}{v.name} ({v.lang})
                    </option>
                  );
                })}
              </select>
              <p className="text-[10px] text-slate-400">
                ⭐ 표시가 있는 음성(Natural, Google, Online)이 가장 사람과 흡사하고 기계음이 적습니다.
              </p>
            </div>

            {/* Sliders: Rate & Pitch */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {/* Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">말하기 속도 (Rate)</span>
                  <span className="font-mono font-bold text-indigo-600">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={rate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>느긋하게 (0.8x)</span>
                  <span>권장 (0.95x)</span>
                  <span>빠르게 (1.2x)</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">목소리 음높이 (Pitch)</span>
                  <span className="font-mono font-bold text-indigo-600">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.25"
                  step="0.03"
                  value={pitch}
                  onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>낮고 차분함 (0.8)</span>
                  <span>자연스러움 (1.02)</span>
                  <span>밝고 높음 (1.25)</span>
                </div>
              </div>
            </div>

            {/* Subtitle Display Toggle Section */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
                    <Captions className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                      <span>실시간 음성 코칭 자막 표시</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-semibold border border-indigo-200">
                        선택 옵션
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      음성 안내 멘트를 화면 하단에 텍스트 자막으로 함께 표시합니다
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showSubtitles}
                    onChange={(e) => onToggleSubtitles(e.target.checked)}
                    className="sr-only peer"
                    id="toggle-subtitles-checkbox"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Subtitle Preview box */}
              {showSubtitles ? (
                <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] px-3.5 py-2 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">[자막 미리보기] "눈을 3초간 가볍게 감고 안구를 이완하세요."</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 shrink-0 ml-2">
                    자막 켜짐
                  </span>
                </div>
              ) : (
                <div className="bg-slate-100 text-slate-500 text-[11px] px-3 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span>자막이 꺼져 있습니다. 음성 안내만 소리로 출력됩니다.</span>
                </div>
              )}
            </div>

            {/* Anti-Cutoff & Quality Guarantees */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1 text-xs text-emerald-800">
              <div className="font-extrabold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>음성 끊김 방지(Anti-Cutoff) 보증 시스템 적용됨</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                각 훈련 단계의 호흡·깜빡임 타이밍에 맞춰 음성 문장을 자연스럽게 분할하고, 브라우저 가비지 컬렉션(GC) 보호 및 백그라운드 킵얼라이브(Keep-Alive)를 실행하여 <strong>말이 중간에 잘리거나 뚝 끊기는 현상을 원천 방지</strong>합니다.
              </p>
            </div>
          </div>

          {/* Footer with Preview Button */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onTestVoice}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>실시간 음성 미리듣기</span>
            </button>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              설정 완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
