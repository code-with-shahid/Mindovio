# Mindovio

AI Powered Smart Study Assistant — generate exam-focused notes, revision sheets, diagrams, charts, mock tests, and practice questions.

## Structure

- `client/` — React + Vite frontend (`mindovio-client`)
- `server/` — Express + MongoDB API (`mindovio-server`)

## Setup

### Client

```bash
cd client
cp .env.example .env
# set VITE_API_URL and VITE_FIREBASE_APIKEY
npm install
npm run dev
```

### Server

```bash
cd server
cp .env.example .env
# set MONGODB_URL, JWT_SECRET, GEMINI_API_KEY, Stripe test keys, CLIENT_URL, CORS_ORIGINS, admin vars
npm install
npm run dev
```

## Environment variables

**Client**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (local: `http://localhost:8000`) |
| `VITE_FIREBASE_APIKEY` | Firebase web API key |

**Server**

| Variable | Description |
|----------|-------------|
| `PORT` | API port |
| `NODE_ENV` | `development` locally; `production` on the API host |
| `MONGODB_URL` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `STRIPE_SECRET_KEY` | Use `sk_test_…` for Stripe test mode |
| `STRIPE_WEBHOOK_SECRET` | Optional in test mode (credits also confirm via `/api/credit/confirm`) |
| `CLIENT_URL` | Frontend origin for Stripe redirects |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |

## Deploy notes

1. Deploy the API (Render/Railway/etc) with `NODE_ENV=production` and all server env vars.
2. Set client `VITE_API_URL` to that API URL, then `cd client && npm run build`.
3. Firebase Hosting serves `client/dist` (`firebase deploy --only hosting`).
4. Keep Stripe in **test mode** (`sk_test_…`) until you are ready for live payments.

## License

ISC
