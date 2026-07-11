# Mindovio

AI Powered Smart Study Assistant — generate exam-focused notes, revision sheets, diagrams, charts, and practice questions.

## Structure

- `client/` — React + Vite frontend (`mindovio-client`)
- `server/` — Express + MongoDB API (`mindovio-server`)

## Setup

### Client

```bash
cd client
cp .env.example .env   # if present; set VITE_API_URL and Firebase vars
npm install
npm run dev
```

### Server

```bash
cd server
cp .env.example .env   # set MONGODB_URL, JWT_SECRET, GEMINI_API_KEY, Stripe keys, CLIENT_URL
npm install
npm run dev
```

## Environment variables

**Client**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (default `http://localhost:8000`) |
| `VITE_FIREBASE_APIKEY` | Firebase web API key |

**Server**

| Variable | Description |
|----------|-------------|
| `PORT` | API port |
| `MONGODB_URL` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLIENT_URL` | Frontend origin for redirects |

## License

ISC
