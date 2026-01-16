# 🛡️ AutoAuditAI

<div align="center">

**AI 기반 GitHub Pull Request 자동 보안 감사 시스템**

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)](https://www.mongodb.com/)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange?logo=amazon-aws)](https://aws.amazon.com/bedrock/)

[기능](#-주요-기능) • [시작하기](#-시작하기) • [기술 스택](#-기술-스택) • [구조](#-프로젝트-구조)

</div>

---

## 📖 소개

**AutoAuditAI**는 GitHub Pull Request의 코드 변경사항을 AWS Bedrock의 Claude 3 Sonnet을 활용하여 자동으로 분석하고 보안 취약점을 감지하는 AI 기반 보안 감사 플랫폼입니다.

개발자가 PR을 생성하면 자동으로 다음 항목들을 검사합니다:
- 🔒 보안 취약점 탐지
- 🔑 인증/인가 변경사항
- 🔐 하드코딩된 시크릿 정보
- 📦 새로운 외부 패키지 추가
- 🌐 새로운 API 엔드포인트
- 👤 개인정보 수집 코드
- 🛡️ 보안 패치 여부

## ✨ 주요 기능

### 🔍 자동 코드 분석
- PR diff를 실시간으로 분석하여 보안 이슈를 즉시 감지
- AWS Bedrock Claude 3 Sonnet을 활용한 고도화된 AI 분석
- JSON 형식의 구조화된 분석 결과 제공

### 🔐 GitHub OAuth 통합
- GitHub 계정으로 간편 로그인
- 저장소 및 PR 목록 자동 조회
- JWT 기반 안전한 인증 시스템

### 📊 대시보드
- 직관적인 웹 인터페이스
- 실시간 분석 결과 시각화
- PR별 감사 상태 추적

### 🐳 Docker 지원
- Docker Compose를 통한 원클릭 배포
- 개발 환경과 프로덕션 환경 분리

## 🚀 시작하기

### 필수 요구사항

- Python 3.12+
- Node.js 18+ (pnpm 권장)
- Docker & Docker Compose
- MongoDB
- AWS 계정 (Bedrock 접근 권한)
- GitHub OAuth App

### 환경 변수 설정

#### Backend (`.env` 파일 생성)

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Secret
BACKEND_SECRET_KEY=your_secret_key_here

# AWS Bedrock
AWS_ACCESS=your_aws_access_key
AWS_SECRET=your_aws_secret_key
```

#### Frontend

환경 변수는 `docker-compose.yml`에서 설정되거나 `.env.local` 파일에 추가할 수 있습니다.

### 설치 방법

#### 방법 1: Docker Compose (권장)

```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

서비스 접속:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MongoDB: localhost:27017

#### 방법 2: 로컬 개발 환경

**Backend 설정:**

```bash
# Python 가상환경 생성
python3.12 -m venv venv

# 가상환경 활성화
# macOS/Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

# 의존성 설치
cd back
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend 설정:**

```bash
# pnpm 설치 (전역)
npm install -g pnpm

# 의존성 설치
cd front
pnpm install

# 개발 서버 실행
pnpm dev
```

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **3D Graphics**: Spline
- **State Management**: React Context API

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12
- **AI Model**: AWS Bedrock (Claude 3 Sonnet)
- **Database**: MongoDB
- **Authentication**: JWT, GitHub OAuth
- **API Client**: aiohttp

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database**: MongoDB
- **Cloud**: AWS Bedrock

## 📁 프로젝트 구조

```
AutoAuditAi/
├── back/                    # Backend (FastAPI)
│   ├── main.py             # FastAPI 애플리케이션 진입점
│   ├── bedrock.py          # AWS Bedrock 클라이언트
│   ├── db.py               # MongoDB 연결 및 유틸리티
│   ├── requirements.txt    # Python 의존성
│   └── Dockerfile          # Backend Docker 이미지
│
├── front/                   # Frontend (Next.js)
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # 랜딩 페이지
│   │   ├── dashboard/      # 대시보드 페이지
│   │   ├── oauth/          # OAuth 콜백 페이지
│   │   └── rules/          # 규칙 설정 페이지
│   ├── components/         # React 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   └── mouse-trail.tsx
│   ├── contexts/           # React Context
│   │   └── auth-context.tsx
│   └── lib/                # 유틸리티 함수
│
├── docker-compose.yml      # Docker Compose 설정
└── README.md               # 프로젝트 문서
```

## 🔑 API 엔드포인트

### 인증
- `GET /auth/github/login` - GitHub OAuth 로그인 시작
- `GET /auth/github/callback` - GitHub OAuth 콜백 처리
- `GET /me` - 현재 사용자 정보 조회

### 저장소 및 PR
- `GET /repos` - 사용자의 GitHub 저장소 목록 조회
- `GET /repos/{repo}/pulls` - 특정 저장소의 PR 목록 조회

### 코드 분석
- `POST /analyze-diff` - PR diff 분석 요청

## 🔒 보안 감사 항목

AutoAuditAI는 다음 7가지 항목을 자동으로 검사합니다:

1. **새로운 HTTP API 엔드포인트** - 새로운 엔드포인트나 사용자 입력 파라미터 추가 여부
2. **보안 취약점** - SQL Injection, XSS, CSRF 등 보안 취약점 탐지
3. **인증/인가 변경** - 인증 및 권한 검증 로직 변경사항
4. **하드코딩된 시크릿** - API 키, 비밀번호 등 민감 정보 하드코딩 여부
5. **개인정보 수집** - 새로운 개인정보 수집 코드 추가 여부
6. **새로운 외부 패키지** - package.json/dependencies에 추가된 새로운 패키지
7. **보안 패치** - 보안 취약점 패치 여부

## 📝 사용 예시

1. **GitHub 로그인**
   - 웹 애플리케이션에 접속하여 GitHub 계정으로 로그인

2. **저장소 선택**
   - 대시보드에서 감사할 저장소 선택

3. **PR 분석**
   - PR 목록에서 분석할 PR 선택
   - 자동으로 diff 분석 시작

4. **결과 확인**
   - 분석 결과를 JSON 형식으로 확인
   - 보안 이슈가 발견되면 상세 설명 제공

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 팀

프로젝트를 만든 팀에 대한 정보를 여기에 추가하세요.

## 🙏 감사의 말

- [AWS Bedrock](https://aws.amazon.com/bedrock/) - AI 모델 제공
- [Next.js](https://nextjs.org/) - 강력한 React 프레임워크
- [FastAPI](https://fastapi.tiangolo.com/) - 현대적인 Python 웹 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - 아름다운 UI 컴포넌트

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요! ⭐**

Made with ❤️ by AutoAuditAI Team

</div>
