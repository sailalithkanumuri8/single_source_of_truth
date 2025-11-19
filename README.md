# Compass AI

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

## Data Pipeline

The production dataset comes from the scripts in `data_preprocessing/`:

1. Run `csv_to_json.py` to convert `cleaned_incidents.csv` into `incidents.json` (raw structured data).
2. Run `enrich_incidents.py` to add routing metadata, confidence scores, context, and timelines. This writes `incidents_enriched.json`.
3. The backend automatically loads `data_preprocessing/incidents_enriched.json` (or any file pointed to by `ESCALATIONS_DATA_PATH`) at startup, so the React app always works with the latest enriched data. A fallback copy in `backend/data/escalations.json` is only used if the pipeline output is missing.

Both scripts require Python 3.9+ plus the packages listed in the notebooks (scikit-learn, numpy, etc.). Re-run them whenever the CSV changes or you retrain the ML model (`model.pkl` / `label_encoder.pkl`).

## Development

- Frontend: React app with components in `frontend/src/components/`
- Backend: Express.js API in `backend/`
- Data: Generated via the pipeline above; no mock data is used in the UI.

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

- Set `REACT_APP_API_URL` if your backend runs on a non-default host/port.
- Override the backend dataset path with `ESCALATIONS_DATA_PATH` if you want to point at a different JSON file.
- CORS is enabled in the backend to allow the React frontend to fetch data.

