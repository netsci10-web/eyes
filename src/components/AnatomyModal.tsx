import { useState, useEffect } from "react";
import { X, Eye, Sparkles, Layers, Activity, Brain, Compass, ShieldCheck, ChevronRight, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnatomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export default function AnatomyModal({ isOpen, onClose, initialStep = 1 }: AnatomyModalProps) {
  const [activeTab, setActiveTab] = useState<number>(initialStep);
  const [isSimulatingAction, setIsSimulatingAction] = useState<boolean>(true);

  // Sync initial step when modal opens
  useEffect(() => {
    if (isOpen && initialStep >= 1 && initialStep <= 5) {
      setActiveTab(initialStep);
    }
  }, [isOpen, initialStep]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      id="anatomy-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        id="anatomy-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  눈의 인체 해부학 구조 & 5단계 작용 원리 3D 도감
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/40">
                  Ophthalmic Biomechanics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                눈 근육의 수축·이완과 마이봄샘의 기름 분비 과정을 3D 입체 해부도로 시각화했습니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="닫기 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto flex items-center space-x-1.5 shrink-0 scrollbar-none">
          {[
            { id: 1, label: "1단계: 마이봄샘 지질 분비", short: "기름샘 분비" },
            { id: 2, label: "2단계: 모양체-수정체 조절계", short: "수정체 굴절" },
            { id: 3, label: "3단계: 6대 외안근 3D 운동", short: "외안근 역학" },
            { id: 4, label: "4단계: 망막-V1 시각피질 필터", short: "시각피질 V1" },
            { id: 5, label: "5단계: 20-20-20 광학 무한대", short: "광학 무한대" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.id}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Main Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* TAB 1: MEIBOMIAN GLAND & 3-LAYER TEAR FILM 3D ANATOMY */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 3D SVG Illustration */}
                <div className="md:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-amber-400 font-mono">
                    3D 입체 해부도: 눈꺼풀 검판 속 마이봄샘
                  </div>

                  {/* Interactive Toggle for Squeeze / Secrete */}
                  <button
                    onClick={() => setIsSimulatingAction(!isSimulatingAction)}
                    className="absolute top-3 right-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>{isSimulatingAction ? "압박 중 (Squeezing)" : "이완 상태"}</span>
                  </button>

                  <svg className="w-full max-w-sm h-64" viewBox="0 0 320 200" fill="none">
                    <defs>
                      {/* Cornea 3D Curve Shader */}
                      <radialGradient id="cornea3D" cx="30%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="#0284C7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity="0.1" />
                      </radialGradient>

                      {/* Tarsus Plate 3D Gradient */}
                      <linearGradient id="tarsus3D" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                      </linearGradient>

                      {/* Muscle Layer Orbicularis Oculi */}
                      <linearGradient id="muscleOrbicularis" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F87171" />
                        <stop offset="50%" stopColor="#DC2626" />
                        <stop offset="100%" stopColor="#991B1B" />
                      </linearGradient>

                      {/* Lipid Droplet Shader */}
                      <radialGradient id="lipidDrop" cx="35%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#FEF08A" />
                        <stop offset="60%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                      </radialGradient>
                    </defs>

                    {/* Cornea Surface Arc */}
                    <path
                      d="M 50,20 C 130,50 130,150 50,180"
                      stroke="url(#cornea3D)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <text x="18" y="105" fill="#38BDF8" fontSize="10" fontWeight="bold">각막(Cornea)</text>

                    {/* Tear Film 3 Layers on Cornea */}
                    {/* Layer 1: 점액층 (Mucin Layer - 0.2µm) */}
                    <path d="M 56,30 C 132,60 132,140 56,170" stroke="#A78BFA" strokeWidth="2.5" fill="none" opacity="0.8" />
                    {/* Layer 2: 수성층 (Aqueous Layer - 7µm) */}
                    <path d="M 60,30 C 136,60 136,140 60,170" stroke="#60A5FA" strokeWidth="4.5" fill="none" opacity="0.9" />
                    {/* Layer 3: 지질층 (Lipid Layer - 0.1µm) */}
                    <motion.path
                      d="M 64,30 C 140,60 140,140 64,170"
                      stroke="#FACC15"
                      strokeWidth={isSimulatingAction ? "5" : "2"}
                      fill="none"
                      animate={{ opacity: isSimulatingAction ? [0.6, 1, 0.7] : 0.8 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />

                    {/* Upper Eyelid Tarsal Plate Cutaway (검판 입체 블록) */}
                    <path
                      d="M 120,20 L 260,20 C 275,20 285,30 285,45 L 285,85 L 145,85 Z"
                      fill="url(#tarsus3D)"
                      stroke="#78350F"
                      strokeWidth="2"
                    />
                    <text x="195" y="38" fill="#78350F" fontSize="9" fontWeight="bold">검판(Tarsal Plate)</text>

                    {/* Orbicularis Oculi Muscle (안륜근 - 눈을 쥐어짜는 근육) */}
                    <motion.path
                      d="M 120,5 L 290,5 L 290,20 L 120,20 Z"
                      fill="url(#muscleOrbicularis)"
                      animate={{
                        scaleY: isSimulatingAction ? 1.25 : 1,
                      }}
                      stroke="#7F1D1D"
                      strokeWidth="1.5"
                    />
                    <text x="175" y="15" fill="#FFFFFF" fontSize="8" fontWeight="bold">안륜근 (수축 시 압박)</text>

                    {/* Meibomian Gland Vertical Tube & Acini (포도송이 모양 기름샘 소엽) */}
                    <g id="meibomian-gland-3d">
                      {/* Main central collecting duct */}
                      <line x1="200" y1="35" x2="152" y2="83" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />

                      {/* Glandular Acini Clusters */}
                      {[
                        { cx: 215, cy: 42, r: 5.5 },
                        { cx: 188, cy: 38, r: 6 },
                        { cx: 205, cy: 54, r: 6.5 },
                        { cx: 178, cy: 50, r: 6 },
                        { cx: 190, cy: 67, r: 7 },
                        { cx: 168, cy: 64, r: 6.5 },
                        { cx: 175, cy: 78, r: 6 },
                      ].map((acinus, i) => (
                        <circle
                          key={i}
                          cx={acinus.cx}
                          cy={acinus.cy}
                          r={acinus.r}
                          fill="url(#lipidDrop)"
                          stroke="#78350F"
                          strokeWidth="1.2"
                        />
                      ))}

                      {/* Gland Orifice opening at lid margin */}
                      <ellipse cx="152" cy="84" rx="4" ry="2.5" fill="#451A03" />

                      {/* Lipid Secretion Droplets oozing out on SQUEEZE! */}
                      {isSimulatingAction && (
                        <motion.g
                          animate={{
                            y: [0, 8, 14],
                            opacity: [1, 0.9, 0],
                            scale: [0.8, 1.2, 0.9],
                          }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeIn" }}
                        >
                          <circle cx="150" cy="88" r="3.5" fill="url(#lipidDrop)" stroke="#FEF08A" strokeWidth="1" />
                          <circle cx="147" cy="98" r="3" fill="url(#lipidDrop)" />
                          <circle cx="144" cy="110" r="2.5" fill="url(#lipidDrop)" />
                        </motion.g>
                      )}
                    </g>

                    {/* Callout lines & annotations */}
                    <g transform="translate(150, 140)">
                      <rect x="0" y="0" width="150" height="48" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                      <text x="10" y="16" fill="#FACC15" fontSize="9" fontWeight="bold">1. 지질층: 기름막 (증발 90% 방지)</text>
                      <text x="10" y="28" fill="#60A5FA" fontSize="8">2. 수성층: 눈물 수분 (각막 산소 공급)</text>
                      <text x="10" y="40" fill="#A78BFA" fontSize="8">3. 점액층: 각막 상피 친수 코팅</text>
                    </g>
                  </svg>
                </div>

                {/* Right Explanation */}
                <div className="md:col-span-5 space-y-3 text-slate-700">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>생체역학적 분비 메커니즘</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    눈 깜빡임 ➔ 안륜근 수축 ➔ 마이봄샘 지질 압출 ➔ 눈물 증발 차단
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    위아래 눈꺼풀의 검판(Tarsus) 안에는 약 <strong>20~30개의 마이봄샘(Meibomian Glands)</strong>이 세로로 빗살처럼 박혀 있습니다.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>안구건조증의 86%는 마이봄샘 기능부전(MGD):</strong> 눈물 분비량이 부족한 것보다, 지질막이 형성되지 않아 눈물이 2~3초 만에 공기 중으로 날아가 버리는 것이 본질적 원인입니다.
                    </li>
                    <li>
                      <strong>Blink-Squeeze-Open의 해부학적 효과:</strong> 단순한 반사 깜빡임과 달리, <em>2초간 눈꺼풀을 지긋이 짜주는 동작(Squeeze)</em>은 안륜근을 수축시켜 굳어있던 왁스 형태의 기름샘을 짜내어 맑은 오일로 배출시킵니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CILIARY MUSCLE & CRYSTALLINE LENS OPTICS 3D */}
          {activeTab === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 3D SVG Illustration */}
                <div className="md:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-emerald-400 font-mono">
                    3D 광학 단면: 모양체 수축 vs 이완 비교
                  </div>

                  {/* Toggle Near / Far */}
                  <button
                    onClick={() => setIsSimulatingAction(!isSimulatingAction)}
                    className="absolute top-3 right-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>{isSimulatingAction ? "근거리 수축 (+14D)" : "원거리 이완 (+0D)"}</span>
                  </button>

                  <svg className="w-full max-w-sm h-64" viewBox="0 0 320 200" fill="none">
                    {/* Eyeball Shell */}
                    <path
                      d="M 50,100 C 50,40 140,25 270,25 C 305,25 315,55 315,100 C 315,145 305,175 270,175 C 140,175 50,160 50,100 Z"
                      stroke="#475569"
                      strokeWidth="3.5"
                      fill="#0B1329"
                    />

                    {/* Retina (망막 황반) */}
                    <path
                      d="M 120,32 C 180,30 260,30 300,55 C 310,70 312,130 300,145 C 260,170 180,170 120,168"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.8"
                    />
                    <circle cx="312" cy="100" r="4" fill="#FACC15" />
                    <text x="270" y="118" fill="#FACC15" fontSize="8" fontWeight="bold">황반(Fovea)</text>

                    {/* Cornea Dome */}
                    <path d="M 50,65 C 20,80 20,120 50,135" stroke="#38BDF8" strokeWidth="5" fill="none" />

                    {/* Ciliary Muscle (모양체근) Upper & Lower */}
                    <motion.path
                      animate={{
                        d: isSimulatingAction
                          ? "M 75,56 C 80,64 100,66 105,56 C 98,48 85,48 75,56 Z" // Swollen thick
                          : "M 75,50 C 80,54 100,56 105,50 C 98,46 85,46 75,50 Z", // Flat relaxed
                      }}
                      fill={isSimulatingAction ? "#F59E0B" : "#14B8A6"}
                      stroke="#FEF3C7"
                      strokeWidth="1.2"
                    />
                    <motion.path
                      animate={{
                        d: isSimulatingAction
                          ? "M 75,144 C 80,136 100,134 105,144 C 98,152 85,152 75,144 Z"
                          : "M 75,150 C 80,146 100,144 105,150 C 98,154 85,154 75,150 Z",
                      }}
                      fill={isSimulatingAction ? "#F59E0B" : "#14B8A6"}
                      stroke="#FEF3C7"
                      strokeWidth="1.2"
                    />
                    <text x="110" y="52" fill={isSimulatingAction ? "#F59E0B" : "#2DD4BF"} fontSize="8" fontWeight="bold">
                      {isSimulatingAction ? "모양체 수축(긴장)" : "모양체 이완(휴식)"}
                    </text>

                    {/* Zonular Fibers (섬모체대) */}
                    <line
                      x1="90"
                      y1={isSimulatingAction ? "62" : "54"}
                      x2="90"
                      y2="76"
                      stroke="#E2E8F0"
                      strokeWidth={isSimulatingAction ? "1" : "2"}
                      strokeDasharray={isSimulatingAction ? "2,2" : "none"}
                    />
                    <line
                      x1="90"
                      y1={isSimulatingAction ? "138" : "146"}
                      x2="90"
                      y2="124"
                      stroke="#E2E8F0"
                      strokeWidth={isSimulatingAction ? "1" : "2"}
                      strokeDasharray={isSimulatingAction ? "2,2" : "none"}
                    />

                    {/* Crystalline Lens (수정체) 3D Dynamic Bulge */}
                    <motion.ellipse
                      cx="90"
                      cy="100"
                      animate={{
                        rx: isSimulatingAction ? 15 : 7,
                        ry: 26,
                      }}
                      transition={{ duration: 0.6 }}
                      fill="#38BDF8"
                      fillOpacity="0.45"
                      stroke="#BAE6FD"
                      strokeWidth="2"
                    />
                    <text x="75" y="104" fill="#E0F2FE" fontSize="8" fontWeight="bold">수정체</text>

                    {/* Ray Tracing Light Focus Path */}
                    {isSimulatingAction ? (
                      // Near Focus Ray Path
                      <g stroke="#FBBF24" strokeWidth="1.5" opacity="0.9">
                        <circle cx="10" cy="100" r="3.5" fill="#F59E0B" />
                        <line x1="10" y1="100" x2="40" y2="75" />
                        <line x1="10" y1="100" x2="40" y2="100" />
                        <line x1="10" y1="100" x2="40" y2="125" />
                        <line x1="40" y1="75" x2="90" y2="80" />
                        <line x1="40" y1="100" x2="90" y2="100" />
                        <line x1="40" y1="125" x2="90" y2="120" />
                        <line x1="90" y1="80" x2="312" y2="100" strokeWidth="2" />
                        <line x1="90" y1="100" x2="312" y2="100" strokeWidth="2" />
                        <line x1="90" y1="120" x2="312" y2="100" strokeWidth="2" />
                      </g>
                    ) : (
                      // Far Focus Parallel Ray Path
                      <g stroke="#38BDF8" strokeWidth="1.5" opacity="0.9">
                        <line x1="0" y1="80" x2="40" y2="80" />
                        <line x1="0" y1="100" x2="40" y2="100" />
                        <line x1="0" y1="120" x2="40" y2="120" />
                        <line x1="40" y1="80" x2="90" y2="83" />
                        <line x1="40" y1="100" x2="90" y2="100" />
                        <line x1="40" y1="120" x2="90" y2="117" />
                        <line x1="90" y1="83" x2="312" y2="100" strokeWidth="2" />
                        <line x1="90" y1="100" x2="312" y2="100" strokeWidth="2" />
                        <line x1="90" y1="117" x2="312" y2="100" strokeWidth="2" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Right Explanation */}
                <div className="md:col-span-5 space-y-3 text-slate-700">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    <span>조절 조화력(Accommodative Facility)</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    가까이 볼 때 모양체는 쥐가 나고, 멀리 볼 때만 비로소 풀립니다
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    스마트폰이나 모니터(30~50cm)를 장시간 볼 때, 안구 내부의 <strong>모양체(Ciliary Muscle)</strong>는 수정체를 두껍게 만들기 위해 쉴 새 없이 수축 상태를 유지합니다.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>조절 경련(Accommodative Spasm)과 가성 근시:</strong> 지속된 수축으로 인해 근육에 쥐가 나면, 멀리 있는 간판이나 칠판을 보아도 모양체가 풀리지 않아 시야가 일시적으로 침침하고 흐려집니다.
                    </li>
                    <li>
                      <strong>원근 교대 훈련의 원리:</strong> 가까운 미세 타겟 응시와 먼 곳 응시를 5초 주기로 번갈아 수행하면, 굳어있던 섬모체대와 모양체 근육이 스트레칭되어 본래의 빠른 초점 조절 탄성을 되찾습니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 6 EXTRAOCULAR MUSCLES 3D KINEMATICS */}
          {activeTab === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 3D SVG Illustration */}
                <div className="md:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-orange-400 font-mono">
                    3D 입체 해부도: 6대 외안근(Extraocular Muscles)
                  </div>

                  <svg className="w-full max-w-sm h-64" viewBox="0 0 320 220" fill="none">
                    <defs>
                      {/* Eyeball 3D Sphere Shader */}
                      <radialGradient id="eyeballSphere" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="70%" stopColor="#E2E8F0" />
                        <stop offset="95%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#64748B" />
                      </radialGradient>

                      {/* Muscle Fiber Shader */}
                      <linearGradient id="muscleFiber" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="50%" stopColor="#DC2626" />
                        <stop offset="100%" stopColor="#991B1B" />
                      </linearGradient>

                      {/* Tendon White Insertions */}
                      <linearGradient id="tendon" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F1F5F9" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                    </defs>

                    {/* Optic Nerve Canal at Back (시신경관 뒤통수) */}
                    <ellipse cx="60" cy="110" rx="16" ry="22" fill="#334155" stroke="#475569" strokeWidth="2" />
                    <text x="30" y="114" fill="#94A3B8" fontSize="8" fontWeight="bold">시신경관</text>

                    {/* 3D Eyeball Sphere */}
                    <circle cx="160" cy="110" r="60" fill="url(#eyeballSphere)" stroke="#475569" strokeWidth="2" />

                    {/* Cornea / Iris on Front (Right side) */}
                    <ellipse cx="215" cy="110" rx="12" ry="34" fill="#38BDF8" opacity="0.3" stroke="#38BDF8" strokeWidth="1.5" />
                    <ellipse cx="218" cy="110" rx="7" ry="24" fill="#0284C7" />
                    <ellipse cx="220" cy="110" rx="3.5" ry="12" fill="#0F172A" />

                    {/* 1. Superior Rectus (상직근 - 안구 상향) */}
                    <path d="M 65,95 C 100,70 140,55 185,62 L 188,72 C 145,67 110,80 70,102 Z" fill="url(#muscleFiber)" />
                    <path d="M 185,62 L 195,65 L 194,75 L 188,72 Z" fill="url(#tendon)" />
                    <text x="110" y="52" fill="#F87171" fontSize="9" fontWeight="bold">1. 상직근 (SR - 상향)</text>

                    {/* 2. Inferior Rectus (하직근 - 안구 하향) */}
                    <path d="M 65,125 C 100,150 140,165 185,158 L 188,148 C 145,153 110,140 70,118 Z" fill="url(#muscleFiber)" />
                    <path d="M 185,158 L 195,155 L 194,145 L 188,148 Z" fill="url(#tendon)" />
                    <text x="110" y="178" fill="#F87171" fontSize="9" fontWeight="bold">2. 하직근 (IR - 하향)</text>

                    {/* 3. Lateral Rectus (외직근 - 안구 외측 회전) */}
                    <path d="M 60,110 L 160,110 L 175,110" stroke="url(#muscleFiber)" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
                    <rect x="165" y="104" width="10" height="12" fill="url(#tendon)" />
                    <text x="110" y="105" fill="#FB923C" fontSize="9" fontWeight="bold">3. 외직근 (LR - 외전)</text>

                    {/* 4. Superior Oblique (상사근 - 트로클레아 도르래 통과 구조) */}
                    <path d="M 60,90 L 160,35" stroke="#F59E0B" strokeWidth="4" />
                    {/* Trochlea Pulley (도르래) */}
                    <circle cx="160" cy="35" r="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
                    <text x="170" y="38" fill="#FEF08A" fontSize="8" fontWeight="bold">도르래(Trochlea)</text>
                    {/* Tendon passing through pulley to eye */}
                    <path d="M 160,35 Q 185,45 175,80" stroke="#FBBF24" strokeWidth="3" strokeDasharray="2,2" />
                  </svg>
                </div>

                {/* Right Explanation */}
                <div className="md:col-span-5 space-y-3 text-slate-700">
                  <div className="flex items-center space-x-1.5 text-xs text-orange-700 font-bold uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span>도약 안구 운동(Saccades) 신경망</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    뇌 전두안야(FEF)와 6개 외안근의 정밀 협응
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    안구는 4개의 직근(상·하·내·외직근)과 2개의 사근(상·하사근)이 줄다리기하듯 3차원으로 매달려 있어 전 방향 회전을 구현합니다.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>초당 500° 초고속 도약 운동:</strong> 우리가 책을 읽거나 주변을 둘러볼 때 시선은 미끄러지는 것이 아니라, <em>단속(Saccade)</em>이라 불리는 점프를 초당 수백 회 수행합니다.
                    </li>
                    <li>
                      <strong>머리를 고정해야 하는 이유:</strong> 머리를 함께 돌리면 전정안반사(VOR)가 개입해 외안근 자체의 가동 범위가 좁아집니다. 머리를 벽처럼 고정한 채 눈동자만 튕겨야 뇌 전두안야와 외안근 신경망이 100% 활성화됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RETINA TO V1 CORTICAL FILTERING */}
          {activeTab === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 3D SVG Illustration */}
                <div className="md:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-rose-400 font-mono">
                    뇌신경망: 망막 ➔ 외측슬상체(LGN) ➔ V1 시각피질
                  </div>

                  <svg className="w-full max-w-sm h-64" viewBox="0 0 320 200" fill="none">
                    {/* Visual Pathway Silhouette */}
                    {/* 1. Left/Right Eyes */}
                    <circle cx="60" cy="65" r="24" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                    <circle cx="60" cy="135" r="24" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                    <text x="50" y="68" fill="#38BDF8" fontSize="8" fontWeight="bold">좌안</text>
                    <text x="50" y="138" fill="#38BDF8" fontSize="8" fontWeight="bold">우안</text>

                    {/* Optic Chiasm (시신경 교차) */}
                    <path d="M 84,65 Q 120,80 140,100 Q 120,120 84,135" stroke="#F59E0B" strokeWidth="3" fill="none" />
                    <path d="M 84,65 L 140,100 L 180,75" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.8" />
                    <path d="M 84,135 L 140,100 L 180,125" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.8" />
                    <circle cx="140" cy="100" r="6" fill="#F59E0B" />
                    <text x="115" y="118" fill="#F59E0B" fontSize="8" fontWeight="bold">시신경 교차(Chiasm)</text>

                    {/* LGN (외측슬상체 핵) */}
                    <circle cx="180" cy="75" r="7" fill="#6366F1" />
                    <circle cx="180" cy="125" r="7" fill="#6366F1" />
                    <text x="190" y="80" fill="#A5B4FC" fontSize="8">외측슬상체</text>

                    {/* Optic Radiation to Occipital Lobe (후두엽 방사 경로) */}
                    <path d="M 187,75 Q 230,60 265,75" stroke="#F43F5E" strokeWidth="3" strokeDasharray="3,3" fill="none" />
                    <path d="M 187,125 Q 230,140 265,125" stroke="#F43F5E" strokeWidth="3" strokeDasharray="3,3" fill="none" />

                    {/* Primary Visual Cortex V1 (대뇌 1차 시각 피질) */}
                    <path
                      d="M 265,60 C 290,65 305,80 305,100 C 305,120 290,135 265,140 Z"
                      fill="#881337"
                      stroke="#FB7185"
                      strokeWidth="2"
                    />
                    <text x="270" y="98" fill="#FFFFFF" fontSize="9" fontWeight="bold">V1 피질</text>
                    <text x="268" y="110" fill="#FECDD3" fontSize="7">(Area 17)</text>

                    {/* Gabor Grating Receptive Field Callout */}
                    <g transform="translate(245, 15)">
                      <circle cx="20" cy="20" r="18" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
                      <line x1="12" y1="8" x2="12" y2="32" stroke="#FFFFFF" strokeWidth="2.5" />
                      <line x1="20" y1="8" x2="20" y2="32" stroke="#000000" strokeWidth="2.5" />
                      <line x1="28" y1="8" x2="28" y2="32" stroke="#FFFFFF" strokeWidth="2.5" />
                      <text x="42" y="24" fill="#FBBF24" fontSize="8" fontWeight="bold">가보 패치 단순세포 필터</text>
                    </g>
                  </svg>
                </div>

                {/* Right Explanation */}
                <div className="md:col-span-5 space-y-3 text-slate-700">
                  <div className="flex items-center space-x-1.5 text-xs text-rose-700 font-bold uppercase tracking-wider">
                    <Brain className="w-4 h-4 text-rose-500" />
                    <span>대뇌 시각 가소성 (Perceptual Learning)</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    눈은 렌즈일 뿐, 실제로 사물을 해석하고 보는 주체는 뇌(V1)입니다
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    안경을 벗고 눈 운동만으로 안축장을 바꾼다는 것은 과학적 거짓이지만, <strong>뇌의 대비 감도(Contrast Sensitivity) 해상도를 높이는 훈련</strong>은 노벨상으로 증명된 과학입니다.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>휴블-비셀(Hubel & Wiesel)의 단순세포:</strong> V1 시각령의 뉴런들은 특정 각도의 줄무늬(가보 패치 패턴)에만 격렬하게 스파이크를 발생시킵니다.
                    </li>
                    <li>
                      <strong>신호대 잡음비(SNR) 향상:</strong> 흐릿한 패턴의 방향을 인지하는 훈련을 반복하면, 뇌는 광학적 수차가 발생한 망막 신호 속에서도 노이즈를 걸러내고 또렷한 윤곽선을 재합성해냅니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 20-20-20 OPTICAL INFINITY */}
          {activeTab === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 3D SVG Illustration */}
                <div className="md:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-teal-400 font-mono">
                    광학적 원리: 6m(20ft) 평행광선 무부하 수렴
                  </div>

                  <svg className="w-full max-w-sm h-64" viewBox="0 0 320 200" fill="none">
                    {/* Distance Ruler Line */}
                    <line x1="20" y1="170" x2="300" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="3,3" />
                    <circle cx="40" cy="170" r="4" fill="#EF4444" />
                    <text x="25" y="185" fill="#EF4444" fontSize="8" fontWeight="bold">0.5m (모니터)</text>

                    <circle cx="160" cy="170" r="4" fill="#F59E0B" />
                    <text x="145" y="185" fill="#F59E0B" fontSize="8" fontWeight="bold">2.0m (실내)</text>

                    <circle cx="280" cy="170" r="5" fill="#14B8A6" />
                    <text x="255" y="185" fill="#14B8A6" fontSize="8" fontWeight="bold">6.0m (광학적 무한대)</text>

                    {/* Eye at Near 0.5m (Top) */}
                    <g transform="translate(20, 20)">
                      <circle cx="25" cy="40" r="20" fill="#1E293B" stroke="#EF4444" strokeWidth="2" />
                      <ellipse cx="25" cy="40" rx="9" ry="14" fill="#F59E0B" opacity="0.8" />
                      <text x="55" y="35" fill="#EF4444" fontSize="9" fontWeight="bold">근거리 응시 (0.5m)</text>
                      <text x="55" y="48" fill="#94A3B8" fontSize="8">모양체 +12.0D 최대 수축 (경련 위험)</text>
                    </g>

                    {/* Eye at Infinity 6m (Bottom) */}
                    <g transform="translate(20, 95)">
                      <circle cx="25" cy="40" r="20" fill="#1E293B" stroke="#14B8A6" strokeWidth="2" />
                      <ellipse cx="25" cy="40" rx="4" ry="15" fill="#38BDF8" opacity="0.8" />
                      <text x="55" y="35" fill="#14B8A6" fontSize="9" fontWeight="bold">원거리 이완 (6.0m 이상)</text>
                      <text x="55" y="48" fill="#94A3B8" fontSize="8">모양체 0.0D 완전 휴식 (무부하 릴랙스)</text>
                    </g>
                  </svg>
                </div>

                {/* Right Explanation */}
                <div className="md:col-span-5 space-y-3 text-slate-700">
                  <div className="flex items-center space-x-1.5 text-xs text-teal-700 font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>미국안과학회(AAO) 골든 룰</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    광학적으로 6m(20ft)를 넘어가면 빛은 평행 광선이 됩니다
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    물리학적으로 사물과의 거리가 6미터 이상 확보되면, 눈에 들어오는 빛의 각도가 0도에 가까워져 수정체가 굴절력을 발휘할 필요가 전혀 없어집니다.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>20-20-20의 과학적 의미:</strong> 20분마다, 20피트(6m) 먼 곳을, 20초간 바라보라는 것은 모양체 근육에게 <em>"이제 수축을 멈추고 0D로 완전히 쉬어라"</em>는 생리학적 리셋 신호입니다.
                    </li>
                    <li>
                      <strong>심호흡과의 결합:</strong> 4초 주기 횡격막 심호흡을 병행하면 교감 신경 항진(긴장/안압 상승)이 가라앉고 부교감 신경이 우세해져 안구 주변 혈류 공급이 원활해집니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            * 각 단계 운동 시작 전 해부학적 원리를 인지하고 수행하면 시각 피질 훈련 효과가 더욱 높아집니다.
          </div>

          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            확인 후 운동으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
