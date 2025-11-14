# Compass AI

A React app to view and analyze internal support escalations.

## Prerequisites
- Node.js 16+ (recommended 18+)
- npm 8+

Check versions:
```bash
node -v
npm -v
```

## Setup
1) Install dependencies
```bash
npm install
```

2) Start the development server
```bash
npm start
```
- Opens `http://localhost:3000`

## Build
Create a production build in `build/`:
```bash
npm run build
```

## Test (optional)
```bash
npm test
```

## Project Structure (brief)
```
src/
  components/   # UI components
  css/          # Styles
  data/         # Mock data
  utils/        # Helpers & constants
  App.js        # App shell
```

## Notes
- No backend required; uses mock data in `src/data/mockEscalations.js`.
- Update styles in `src/css/` and shared helpers in `src/utils/`.
