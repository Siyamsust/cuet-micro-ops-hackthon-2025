# Download Service Dashboard

React frontend for the Download Service with Sentry error tracking and trace correlation.

## Features

- **Health Status**: Real-time API health from `/health` endpoint
- **Download Jobs**: List of initiated downloads with status
- **Error Log**: Recent errors captured by Sentry
- **Trace Viewer**: Link to Jaeger UI with trace correlation
- **Performance Metrics**: API response times, success/failure rates

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_JAEGER_UI_URL=http://localhost:16686
```

### 3. Sentry Setup

1. Create a project at [sentry.io](https://sentry.io)
2. Select "React" as the platform
3. Copy the DSN and add to `.env`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3001

## Trace Correlation

The frontend implements W3C Trace Context for end-to-end traceability:

```
User clicks "Download" button
        │
        ▼
Frontend creates span with trace-id: abc123
        │
        ▼
API request includes header: traceparent: 00-abc123-...
        │
        ▼
Backend logs include: trace_id=abc123
        │
        ▼
Errors in Sentry tagged with: trace_id=abc123
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
