# Backend — Exam Seat Management

## Setup

```bash
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |

## Architecture

This backend follows **Clean Architecture** with the **Dependency Inversion Principle (DIP)**.

```
Route → Controller → Service → Repository → Model → MongoDB
```

Each layer (Controller, Service, Repository) has:
- An `interfaces/` folder — the contract/abstraction
- An `implementations/` folder — the concrete class
