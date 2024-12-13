# Season Settlement System

시즌별 포인트 정산 처리를 위한 웹 기반 정산 시스템입니다.

## 시스템 개요

이 시스템은 다음과 같은 기능을 제공합니다:

- 다중 시즌 정산 데이터 처리
- 시즌별 MBX 시세 입력 및 관리
- 정산용 데이터 자동 생성
- 엑셀 파일 기반의 데이터 입출력

## 시스템 구성

```
packages/seasonsettlement/
├── src/
│   ├── components/     # UI 컴포넌트
│   ├── types/         # 타입 정의
│   ├── utils/         # 유틸리티 함수
│   └── app/           # 페이지 및 레이아웃
```

## 실행 환경

- Node.js 18.0.0 이상
- Yarn 4.x
- Next.js 14.x
- TypeScript 5.x

## 시작하기

1. 개발 서버 실행:

```bash
yarn dev
```

2. 빌드:

```bash
yarn build
```

3. 프로덕션 서버 실행:

```bash
yarn start
```

## 입력 파일 형식

정산 처리를 위한 엑셀 파일은 다음 형식을 따라야 합니다:

- 시즌 정보가 포함된 헤더
- 각 행의 포인트 데이터
- 지원 형식: .xlsx, .xls

## 출력 데이터

시스템은 다음과 같은 정산 데이터를 생성합니다:

- 시즌별 정산 금액
- MBX 변환 정보
- 정산 처리 메타데이터
