# Frontend — Exam Seat Management

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Structure

```
src/
├── assets/        Static assets (images, icons)
├── components/    Shared/reusable UI components
├── constants/     App-wide constants
├── features/      Feature-based modules (auth, exams, sessions, ...)
├── hooks/         Custom React hooks
├── layouts/       Page layout wrappers
├── pages/         Route-level page components
├── routes/        React Router configuration
├── services/      API service layer
├── store/         Redux store configuration
├── types/         Shared TypeScript types
└── utils/         Utility/helper functions
```
