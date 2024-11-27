# Translation File Line Separator Validator

번역 파일 내 비정상적인 줄 종결자 식별 및 해결을 위한 솔루션

## 프로젝트 소개

이 프로젝트는 다국어 번역 파일(.xls, .xlsx)에서 비정상적인 줄 종결자를 식별하고 관리하기 위한 웹 기반 도구입니다. 여러 시트를 포함한 엑셀 파일을 분석하여 잘못된 줄 바꿈 문자나 특수 문자를 감지하고 시각적으로 표시합니다.

## 주요 기능

- 엑셀 파일(.xls, .xlsx) 업로드 및 분석
- 다중 시트 지원 및 시트별 탭 뷰
- 비정상적인 줄 종결자 자동 감지
- 문제가 있는 행 하이라이트 표시
- 상세한 문제 위치 및 유형 표시
- 페이지네이션이 적용된 데이터 테이블
- 실시간 진행률 표시

## 기술 스택

- Frontend: React, TypeScript, Next.js
- Styling: Tailwind CSS
- Excel Processing: xlsx
- Build Tool: Turborepo

## 프로젝트 구조

.
├── packages
│ └── translation_helper
│ ├── public
│ └── src
│ ├── app
│ │ ├── api
│ │ │ └── upload
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components
│ ├── types
│ └── utils
└── package.json

### 개발 서버 설치

- Node.js 18.0.0 이상

```bash
# 저장소 클론
git clone [repository-url]

# 프로젝트 디렉토리로 이동
cd [project-name]

# 의존성 설치
yarn install
```

### 개발 서버 실행

```bash
# 프로젝트 디렉토리로 이동
cd [project-name]

# 개발 서버 실행
yarn workspace @helper/translation_helper dev
```

### 프로덕션 빌드

```bash
# 의존성 설치
yarn build
```

## 사용 방법

1. 웹 브라우저에서 애플리케이션 접속
2. 파일 업로드 영역에 엑셀 파일을 드래그앤드롭 또는 클릭하여 업로드
3. 파일 분석이 완료되면 시트별로 데이터 확인 가능
4. 문제가 발견된 행은 붉은색으로 하이라이트 표시
5. 마우스 오버 시 상세 문제 정보 확인 가능

## 라이선스

MIT License

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
