import { useState } from "react";
import { BookOpen, AlertTriangle, CheckCircle2, Shield, Eye, Brain, Layers, Activity, Sparkles } from "lucide-react";

export default function ScienceGuide() {
  const [selectedAnatomy, setSelectedAnatomy] = useState<number>(1);

  const anatomyDetails = [
    {
      id: 1,
      title: "마이봄샘 & 3중 눈물막 구조",
      subtitle: "안구건조증 86%의 근본 원인 해결",
      desc: "눈꺼풀 검판(Tarsus)에 수직으로 배열된 20~30개의 마이봄샘(Meibomian Glands)은 눈을 지긋이 감을 때마다 맑은 지질(Lipid)을 분비합니다. 이 기름막은 눈물 수분층을 코팅하여 공기 중 증발을 90% 이상 억제합니다.",
      tag: "1단계 운동 연계",
    },
    {
      id: 2,
      title: "모양체근 & 수정체 조절계",
      subtitle: "스마트폰 조절 경련 및 가성 근시 차단",
      desc: "수정체(Lens)의 두께는 모양체(Ciliary Body) 근육의 수축과 섬모체대(Zonules)의 장력으로 조절됩니다. 근거리 작업 시 모양체근은 계속 수축 상태(쥐가 난 상태)로 굳어지며, 원근 교대 훈련을 통해서만 이 경련이 이완됩니다.",
      tag: "2단계 운동 연계",
    },
    {
      id: 3,
      title: "6대 외안근 & 전두안야(FEF)",
      subtitle: "도약 단속 안구 운동(Saccade) 정밀화",
      desc: "안구는 4개의 직근(상·하·내·외직근)과 2개의 사근(상·하사근)이 둘러싸고 있습니다. 뇌 전두엽의 전두안야(FEF)에서 내려오는 신호를 통해 눈동자가 한 번에 최대 500°/s 속도로 정확한 목표점에 안착합니다.",
      tag: "3단계 운동 연계",
    },
    {
      id: 4,
      title: "대뇌 1차 시각 피질(V1) 가보 패치 필터",
      subtitle: "노벨상 수상 '단순세포(Simple Cell)' 인지 가소성",
      desc: "안구의 광학적 초점뿐 아니라, 뇌 후두엽의 V1 시각령에서 미세한 명암 대비 신호를 노이즈와 분리하는 능력이 실질적 시력 선명도를 결정합니다. 가보 패치 훈련은 뇌 가소성을 자극하여 뇌의 대비 인지 해상도를 높입니다.",
      tag: "4단계 운동 연계",
    },
    {
      id: 5,
      title: "20-20-20 광학적 무한대 이완 원리",
      subtitle: "미국안과학회(AAO) 공인 컴퓨터 시각 증후군 해소",
      desc: "빛은 6미터(20피트) 이상의 거리를 통과할 때 사실상 평행 광선(Parallel Rays)으로 안구에 도달합니다. 이 순간 수정체는 빛을 꺾을 필요가 전혀 없어져 조절력이 0 디옵터(완전 휴식) 상태로 리셋됩니다.",
      tag: "5단계 운동 연계",
    },
  ];

  return (
    <div id="science-guide-panel" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm mt-8 space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <BookOpen className="w-6 h-6 text-indigo-600" id="science-guide-icon" />
        <div>
          <h2 className="text-xl font-bold text-slate-800" id="science-guide-title">
            안과학 및 인지신경학적 과학적 근거 가이드
          </h2>
          <p className="text-xs text-slate-500">
            임상 안과 생리학 및 뇌 시각 피질 연구에 기반한 실증적 5단계 메커니즘
          </p>
        </div>
      </div>

      {/* Bates Method vs Real Science Comparison Warning */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 space-y-3" id="bates-comparison">
        <div className="flex items-center space-x-2 text-amber-800 font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-base">가짜 의학 정보 경고: 베이츠법(Bates Method) 등의 허구성</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          인터넷 상에는 <strong>"눈 운동만으로 안경을 벗고 근시를 완전히 치료한다"</strong>거나 <strong>"안축장(안구 앞뒤 길이)을 물리적으로 압박하여 줄인다"</strong>는 등의 허위 광고가 많습니다. 특히 대표적인 <em>베이츠법(Bates Method)</em>은 19세기 말 안구 생리학이 발달하기 전 제시된 이론으로, 의학적 근거가 전혀 없으며 심지어 눈을 강하게 누르는 등의 행위는 <strong>망막 박리, 녹내장 유발, 각막 손상</strong> 등 영구적인 시력 상실을 초래할 수 있어 현대 안과학회(AAO)에서 강력히 경고하고 있습니다.
        </p>
        <div className="text-xs text-amber-900 font-medium">
          * 본 프로그램은 물리적인 안구 굴절률(디옵터) 자체를 영구적으로 바꾸는 마술이 아닙니다. 대신, 과학적으로 검증된 안구 윤활막 개선, 조절 기능 유연화, 시각 피질 대비감도 향상 및 조절 긴장 이완에 초점을 맞춥니다.
        </div>
      </div>

      {/* Interactive Eye Anatomy System Explorer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4" id="anatomy-explorer">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">
              안구 기능 해부도 및 5단계 과학적 상관관계
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            클릭하여 부위별 메커니즘 확인
          </span>
        </div>

        {/* Anatomical Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {anatomyDetails.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAnatomy(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedAnatomy === item.id
                  ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="text-[10px] text-indigo-600 font-mono mb-0.5">{item.id}단계</div>
              <div className="truncate font-semibold">{item.title.split("&")[0]}</div>
            </button>
          ))}
        </div>

        {/* Detail Visual Showcase */}
        {(() => {
          const curr = anatomyDetails.find((a) => a.id === selectedAnatomy)!;
          return (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-center gap-5">
              {/* Left: Graphic Diagram */}
              <div className="w-44 h-40 shrink-0 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-2">
                {curr.id === 1 && (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="35" stroke="#38BDF8" strokeWidth="3" />
                    {/* Eyelids */}
                    <path d="M 15,50 Q 50,20 85,50" stroke="#F59E0B" strokeWidth="4" />
                    <path d="M 15,50 Q 50,80 85,50" stroke="#F59E0B" strokeWidth="4" />
                    {/* Meibomian Glands */}
                    {[25, 35, 45, 55, 65, 75].map((x, i) => (
                      <circle key={i} cx={x} cy={35} r="2" fill="#FBBF24" />
                    ))}
                    <text x="25" y="95" fill="#FBBF24" fontSize="8" fontWeight="bold">마이봄샘 지질 분비</text>
                  </svg>
                )}
                {curr.id === 2 && (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    {/* Ciliary body and lens */}
                    <circle cx="50" cy="50" r="35" stroke="#64748B" strokeWidth="2" />
                    {/* Ciliary muscle */}
                    <circle cx="50" cy="22" r="5" fill="#F59E0B" />
                    <circle cx="50" cy="78" r="5" fill="#F59E0B" />
                    {/* Lens */}
                    <ellipse cx="50" cy="50" rx="12" ry="20" fill="#38BDF8" opacity="0.6" stroke="#BAE6FD" strokeWidth="2" />
                    <text x="22" y="95" fill="#38BDF8" fontSize="8" fontWeight="bold">모양체근 & 수정체</text>
                  </svg>
                )}
                {curr.id === 3 && (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="30" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
                    {/* 4 rectus muscles */}
                    <rect x="42" y="2" width="16" height="18" rx="2" fill="#EF4444" />
                    <rect x="42" y="80" width="16" height="18" rx="2" fill="#EF4444" />
                    <rect x="2" y="42" width="18" height="16" rx="2" fill="#F97316" />
                    <rect x="80" y="42" width="18" height="16" rx="2" fill="#F97316" />
                    {/* Pupil */}
                    <circle cx="50" cy="50" r="12" fill="#0284C7" />
                    <circle cx="50" cy="50" r="6" fill="#0F172A" />
                    <text x="25" y="96" fill="#F87171" fontSize="8" fontWeight="bold">6대 외안근 시스템</text>
                  </svg>
                )}
                {curr.id === 4 && (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    {/* Brain silhouette & V1 Cortex area */}
                    <path
                      d="M 50,15 C 30,15 15,30 15,50 C 15,70 30,85 50,85 C 60,85 75,80 85,65 C 88,55 88,40 85,30 C 75,15 65,15 50,15 Z"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      fill="#1E293B"
                    />
                    {/* V1 Visual Cortex at back */}
                    <path d="M 20,40 Q 15,60 25,75" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="22" cy="55" r="4" fill="#FB7185" className="animate-ping" />
                    <text x="25" y="96" fill="#FB7185" fontSize="8" fontWeight="bold">대뇌 1차 시각 피질 V1</text>
                  </svg>
                )}
                {curr.id === 5 && (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    {/* Parallel rays entering eye at 6m */}
                    <line x1="5" y1="35" x2="65" y2="35" stroke="#38BDF8" strokeWidth="2" />
                    <line x1="5" y1="50" x2="65" y2="50" stroke="#38BDF8" strokeWidth="2" />
                    <line x1="5" y1="65" x2="65" y2="65" stroke="#38BDF8" strokeWidth="2" />
                    <path d="M 65,25 C 90,25 90,75 65,75 Z" stroke="#64748B" strokeWidth="2" fill="#0F172A" />
                    <text x="15" y="95" fill="#38BDF8" fontSize="8" fontWeight="bold">6m(20ft) 평행광선 이완</text>
                  </svg>
                )}
              </div>

              {/* Right: Detailed Explanation */}
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/40">
                    {curr.tag}
                  </span>
                  <h4 className="text-base font-bold text-white">{curr.title}</h4>
                </div>
                <div className="text-xs text-amber-300 font-semibold">{curr.subtitle}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{curr.desc}</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Recommended Practices & Warning Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-emerald-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>올바른 안구 관리 및 훈련 권장 습관</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong>컴퓨터 모니터 거리 유지:</strong> 눈과 50~70cm 이상 확보하고 살짝 아래로 내려다보는 각도를 세팅하십시오.</li>
            <li><strong>충분한 조도 확보:</strong> 어두운 방에서 밝은 스마트폰 화면만 보는 행동은 가성 근시와 안압 상승의 주원인입니다.</li>
            <li><strong>인공눈물 점안:</strong> 본 1단계 운동과 방부제 없는 일회용 인공눈물을 적정량 병용하면 눈 표면 건조가 탁월하게 예방됩니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-rose-800 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>주의: 즉시 안과 검진이 필요한 자각 증상</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            눈 운동만으로 모든 눈 질환을 예방할 수 없습니다. 아래 증상 중 하나라도 해당된다면 운동을 멈추고 <strong>즉시 안과 전문의의 정밀 진료</strong>를 받아야 합니다.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>갑자기 시력이 급격하게 저하되거나 시야의 일부분이 보이지 않을 때</li>
            <li>눈앞에 날파리가 날아다니는 듯한 증상(비문증)이 급격하게 증가하거나 번쩍이는 빛(광시증)이 보일 때 (망막 박리 의심)</li>
            <li>안구에 극심한 통증과 함께 두통, 구토가 동반될 때 (급성 녹내장 의심)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
