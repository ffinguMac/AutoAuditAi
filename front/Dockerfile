FROM node:20-alpine

LABEL authors="park-woohyun"

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml* ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 개발 서버 실행
CMD ["pnpm", "dev"]
