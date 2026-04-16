# Bloom MVP


Email: demo@bloom.app
Password: Password123!

Bloom is a cross-platform menstrual tracking MVP with a Next.js web app, React Native mobile app, Node.js + TypeScript API, PostgreSQL storage, an AI prediction module, and a gateway server for rate limiting/IP filtering.

## Architecture

- `bloom/` Next.js web app (NextAuth + TanStack Query)
- `BloomMobile/` React Native app (JWT auth + TanStack Query)
- `backend/api/` Express API + Prisma + AI prediction module
- `backend/gateway/` Express gateway for IP filtering + rate limiting

## Core Features

- Email/password signup + login (OAuth-ready for web)
- Anonymous mode
- Cycle logging (start/end)
- Symptom logging (mood, cramps, sleep, energy)
- Calendar view
- Dashboard predictions (next period, ovulation, PMS)
- Notifications (local reminders on mobile)
- Chatbot guidance (web + mobile)

## Setup

### 1) Backend API

```
cd backend/api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs on `http://localhost:4000` by default.

### 2) Gateway Server

```
cd backend/gateway
cp .env.example .env
npm install
npm run dev
```

The gateway runs on `http://localhost:3001` and proxies to the API.

### 3) Web App (Next.js)

```
cd bloom
cp .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

### 4) Mobile App (React Native)

```
cd BloomMobile
npm install
npm run android   # or npm run ios
```

Update `BloomMobile/src/services/api.ts` with your machine IP if running on a physical device.

## Database Initialization

Use Prisma migrations:

```
cd backend/api
npm run prisma:migrate
```

Or run the SQL schema directly:

```
psql "postgresql://postgres:password@localhost:5432/bloom" -f backend/api/scripts/init.sql
```

## AI Predictions

The AI module currently uses a simple baseline algorithm (average cycle length) in:

- `backend/api/src/ai/predictor.ts`

You can replace this with TensorFlow.js or a Python microservice later.

## API Endpoints (Gateway)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/anonymous`
- `GET /auth/me`
- `GET /cycles` `POST /cycles` `PUT /cycles/:id` `DELETE /cycles/:id`
- `GET /symptoms` `POST /symptoms` `PUT /symptoms/:id` `DELETE /symptoms/:id`
- `GET /notifications` `POST /notifications` `PUT /notifications/:id` `DELETE /notifications/:id`
- `GET /predictions/next`
- `POST /chat` `GET /chat/logs`

## Notes

- Web auth uses NextAuth + JWT session strategy.
- Mobile auth uses JWT directly from the API.
- Gateway rate-limits all requests and blocks IPs in-memory for the MVP.

## Next Steps

- Replace baseline predictions with TF.js model.
- Add push notifications via Firebase.
- Add analytics for symptom trends.

---

Bloom was built to be modular, maintainable, and friendly for users and developers.
