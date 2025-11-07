# Single Source of Truth - Monorepo

A full-stack application for viewing and analyzing internal support escalations.

## Project Structure

```
single_source_of_truth_monorepo/
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
├── package.json       # Root package.json with convenience scripts
└── README.md          # This file
```

## Prerequisites

- Node.js 16+ (recommended 18+)
- npm 8+

Check versions:
```bash
node -v
npm -v
```

## Setup

### Install all dependencies

From the root directory:
```bash
npm run install:all
```

Or install individually:
```bash
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

## Running the Application

### Option 1: Run from root (recommended)

**Start frontend:**
```bash
npm run start:frontend
```
- Opens `http://localhost:3000`

**Start backend:**
```bash
npm run start:backend
```
- Typically runs on `http://localhost:3001` or `http://localhost:3000` (check backend config)

### Option 2: Run individually

**Frontend:**
```bash
cd frontend
npm start
```

**Backend:**
```bash
cd backend
npm start
```

## Development

- Frontend: React app with components in `frontend/src/components/`
- Backend: Express.js API in `backend/`
- Mock data: Currently in `frontend/src/data/mockEscalations.js` (can be replaced with API calls)

## Build

Build the frontend for production:
```bash
npm run build:frontend
```

## Testing

Run frontend tests:
```bash
npm run test:frontend
```

## Notes

- The frontend currently uses mock data but can be configured to call the backend API
- Update API endpoints in frontend when connecting to backend
- CORS may need to be configured in the backend to allow frontend requests

