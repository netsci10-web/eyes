# 과학적 5단계 눈 운동 코치 (Scientific 5-Step Eye Coach)

안과학(Ophthalmology) 및 인지신경학(Cognitive Neuroscience) 연구에 기반한 현대인을 위한 과학적 눈 운동 프로그램입니다.

---

## 🚀 GitHub Pages 배포 안내 (흰 화면 해결)

Vite 기본 설정(`base: '/'`)은 저장소 하위 경로(예: `https://<username>.github.io/<repository-name>/`)에서 정적 에셋 경로를 루트 도메인으로 요청하여 **404 에러 및 흰색 화면(White Screen of Death)**이 발생합니다.

본 프로젝트는 다음과 같이 문제를 완전히 수정하였습니다:
1. **상대 경로 에셋 지원 (`base: './'`)**: `vite.config.ts`에 `base: './'`를 적용하여 어떤 경로에서도 스크립트와 스타일시트가 정상 로드됩니다.
2. **에러 바운더리 (`ErrorBoundary`)**: 예상치 못한 스크립트 에러 발생 시 흰 화면 대신 복구 버튼 및 안내 화면을 표시합니다.
3. **자동 배포 워크플로우 (`.github/workflows/deploy.yml`)**: GitHub에 푸시만 하면 GitHub Pages에 자동 빌드 및 배포됩니다.

### GitHub Pages 활성화 방법
1. 깃허브 저장소 상단 메뉴에서 **Settings** 클릭
2. 좌측 메뉴에서 **Pages** 클릭
3. **Build and deployment** > **Source** 항목을 **GitHub Actions**로 선택
4. `main` 브랜치에 코드를 푸시하면 자동으로 빌드되어 배포 완료됩니다!

---

## 🛠️ 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드 (dist 폴더 생성)
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📋 5단계 과학적 운동 프로그램 구성

1. **1단계: 마이봄샘 기능 활성화 (온열 압박 & 순목 운동)**
   - 눈물막의 증발을 방지하는 마이봄샘의 지질 분비를 촉진하는 2초 리듬 깜빡임
2. **2단계: 조절 기능 훈련 (원근 교대 주시법)**
   - 모양체근(Ciliary muscle)의 긴장을 해소하고 초점 조절력을 회복
3. **3단계: 안구 운동 제어 (단속적 & 추적 안구 운동)**
   - 6개 외안근(Extraocular muscles)의 조화로운 협응력 강화
4. **4단계: 가보르 패치 대비 감도 훈련 (피질 시각 처리 자극)**
   - 1차 시각 피질(V1)의 신경 가소성 촉진 및 뇌 시각 정보 처리 개선
5. **5단계: 20-20-20 원거리 이완 및 안구 감압**
   - 부교감 신경 활성화 및 안압 완화 호흡 가이드
