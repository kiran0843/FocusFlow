# FocusFlow (MERN) – Gamified Productivity

FocusFlow helps you plan up to 3 tasks/day, run Pomodoro sessions, track distractions, and earn XP. Modern React + Node.js app with a glassmorphism UI.

## Features
- Tasks limited to 3 per day with completion XP
- Pomodoro: 25/5, pause/resume, session history
- Distraction logging (quick buttons + notes)
- Analytics dashboard (Recharts)
- Auth with JWT (Context API)

## Tech Stack
- Frontend: React 18, Vite, Tailwind, shadcn/ui, React Router, react-hook-form, react-hot-toast, Lucide, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, express-validator, helmet, cors

## Monorepo Layout
```
focusflow/
  backend/   # Express API, Mongo, JWT
  frontend/  # React app (Vite + Tailwind)
```

## Setup
1) Backend
```
cd backend
npm i
copy .env.example .env  # or create .env
# Required:
# MONGODB_URI=mongodb://localhost:27017/focusflow
# JWT_SECRET=change_me
# PORT=5000
# CORS_ORIGIN=http://localhost:5173
npm run dev
```
2) Frontend
```
cd frontend
npm i
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
```
App: http://localhost:5173  API: http://localhost:5000/api

## Useful Scripts
- Backend: `npm run dev`, `npm test`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Testing
- Backend Jest tests in `backend/test/`: `cd backend && npm test`

## Notes
- Default Pomodoro XP: 25 per completed work session
- Levels: level = floor(totalXP / 100) + 1
- Ensure both servers run and `VITE_API_URL` matches backend

## License
MIT

