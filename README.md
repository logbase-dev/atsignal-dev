# AtSignal - 통합 행동데이터 플랫폼

Nethru가 보유한 데이터 분석 기술력과 경험을 집약한 통합 행동데이터 플랫폼

## 프로젝트 구조

Monorepo 구조로 다음 앱들을 포함합니다:

- **web**: 메인 웹사이트 (atsignal.io)
- **docs**: 문서 사이트 (docs.atsignal.io)
- **support**: 고객지원 사이트 (support.atsignal.io)
- **app**: 솔루션 체험 사이트 (app.atsignal.io)
- **functions**: Firebase Functions (백엔드 API)

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Hosting**: Firebase Hosting
- **Backend**: Firebase Functions
- **Database**: Firestore
- **Deployment**: Firebase Hosting (다중 Target)

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

각 앱별로 개발 서버를 실행할 수 있습니다:

```bash
# web 앱
cd apps/web && npm run dev

# docs 앱
cd apps/docs && npm run dev

# support 앱
cd apps/support && npm run dev

# app 앱
cd apps/app && npm run dev
```

### 빌드

```bash
# 개별 빌드
npm run build:web
npm run build:docs
npm run build:support
npm run build:app
npm run build:functions

# 전체 빌드
npm run build:all
```

### 배포

```bash
# 개별 배포
npm run deploy:web
npm run deploy:docs
npm run deploy:support
npm run deploy:app

# 전체 배포
npm run deploy:all
```

## 디렉토리 구조

자세한 디렉토리 구조는 `doc/atsignal-project-structure_v2.md`를 참조하세요.

## 참고 문서

- [요구사항 정의서](./doc/atsignal-요구사항정의서-초안.md)
- [설계 문서](./doc/atsignal-설계문서-초안.md)
- [프로젝트 구조 v2](./doc/atsignal-project-structure_v2.md)

