import { BookOpen, AlertTriangle, CheckCircle2, Shield, Eye, Brain } from "lucide-react";

export default function ScienceGuide() {
  return (
    <div id="science-guide-panel" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm mt-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <BookOpen className="w-6 h-6 text-indigo-600" id="science-guide-icon" />
        <h2 className="text-xl font-bold text-slate-800" id="science-guide-title">
          안과학 및 인지신경학적 과학적 근거 가이드
        </h2>
      </div>

      {/* Bates Method vs Real Science Comparison */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 space-y-3" id="bates-comparison">
        <div className="flex items-center space-x-2 text-amber-800 font-semibold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h3 className="text-base">⚠️ 가짜 의학 정보 경고: 베이츠법(Bates Method) 등의 허구성</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          인터넷 상에는 <strong>"눈 운동만으로 안경을 벗고 근시를 완전히 치료한다"</strong>거나 <strong>"안축장(안구 앞뒤 길이)을 물리적으로 압박하여 줄인다"</strong>는 등의 허위 광고가 많습니다. 특히 대표적인 <em>베이츠법(Bates Method)</em>은 19세기 말 안구 생리학이 발달하기 전 제시된 이론으로, 의학적 근거가 전혀 없으며 심지어 눈을 강하게 누르는 등의 행위는 <strong>망막 박리, 녹내장 유발, 각막 손상</strong> 등 영구적인 시력 상실을 초래할 수 있어 현대 안과학회(AAO)에서 강력히 경고하고 있습니다.
        </p>
        <div className="text-xs text-amber-900 font-medium">
          * 본 프로그램은 물리적인 안구 굴절률(디옵터) 자체를 영구적으로 바꾸는 마술이 아닙니다. 대신, 과학적으로 검증된 안구 윤활막 개선, 조절 기능 유연화, 시각 피질 대비감도 향상 및 조절 긴장 이완에 초점을 맞춥니다.
        </div>
      </div>

      {/* 5-Step Science Breakdown */}
      <div className="space-y-6" id="five-step-science-breakdown">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>각 운동 단계별 현대 의학적 메커니즘</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">1단계</span>
              <span>마이봄샘 자극 (Blink-Squeeze-Open)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>의학적 근거:</strong> 안구건조증 환자의 86%는 기름샘인 마이봄샘(Meibomian gland) 기능 저하가 원인입니다. 의식적인 깊은 눈 깜빡임(Blink), 가벼운 쥐어짜기(Squeeze), 크게 뜨기(Open)는 마이봄샘을 자극하여 맑은 지질(기름) 분비를 유도합니다. 이는 눈물막 최외곽의 지방층을 복원하여 눈물의 수분 증발을 완벽하게 억제합니다.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">2단계</span>
              <span>조절 피로 완화 (Accommodative Facility)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>의학적 근거:</strong> 스마트폰이나 모니터를 근거리에서 장시간 주시하면 안구 내부의 모양체(Ciliary body) 근육이 계속 수축 상태를 유지하게 되어 <em>'조절 경련(Accommodative Spasm)'</em>이나 일시적 가성 근시를 유발합니다. 화면 내 타겟의 동적 크기 변화에 초점을 맞추는 훈련은 모양체 근육의 유연한 조절 기능을 신속하게 정상화합니다.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">3단계</span>
              <span>정밀 단속 안구 운동 (Saccadic Eye Movements)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>의학적 근거:</strong> 단속성 안구 운동(Saccades)은 눈을 한 지점에서 다른 지점으로 빠르게 점프시키는 반사 및 수의 운동입니다. 이는 뇌의 전두엽에 존재하는 <em>전두안야(Frontal Eye Field)</em>와 안구를 움직이는 6개의 외안근(Extraocular muscles)을 동시 활성화하여, 정밀 시각 추정 능력을 회복시키고 독서 시 안구 운동 피로를 크게 줄여줍니다.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">4단계</span>
              <span>대비 감도 극대화 (Gabor Patch)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>의학적 근거:</strong> UC 버클리 및 이스라엘 등의 뇌신경학 인지 훈련 연구(Perceptual Learning)에 따르면, 흐릿한 동심원 형태의 줄무늬인 가보 패치(Gabor Patch)를 인지하는 훈련은 눈의 물리적인 디옵터 변경 없이도, <strong>뇌의 일차 시각 피질(V1, Visual Cortex)의 신호대 잡음비(SNR) 및 대조 감도(Contrast Sensitivity) 해상도를 극대화</strong>하여 실질적으로 글씨나 사물을 훨씬 선명하게 인식하도록 뇌 가소성을 자극합니다.
            </p>
          </div>
        </div>

        {/* Step 5 - Banner */}
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm">
            <span className="bg-indigo-200 text-indigo-950 text-xs px-2 py-0.5 rounded-full">5단계</span>
            <span>20-20-20 규칙 원거리 이완 (Accommodative Spasm Release)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>의학적 근거:</strong> 미국 안과학회(American Academy of Ophthalmology) 및 미국 검안협회(AOA)가 공식 권장하는 컴퓨터 시각 증후군(CVS) 최고 예방수칙입니다. 20분간 화면을 보았다면, <strong>최소 20피트(약 6미터) 이상 떨어진 먼 대상을 20초 동안 바라봄</strong>으로써 모양체 근육을 완전히 이완시켜 장기적인 조절 마비 및 안정피로 축적을 차단합니다.
          </p>
        </div>
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
            <span>⚠️ 주의: 즉시 안과 검진이 필요한 자각 증상</span>
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
