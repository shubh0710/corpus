# Corpus

**Backtest a mix of Indian mutual funds against the market.** Choose how much of your money goes into each of six funds, invest it as a monthly SIP or as one lump sum, and see how that mix would actually have done since September 2019, compared with simply buying a Nifty 500 index fund.

## Features

- **Build a mix.** Give each of six funds a share (equity, debt and gold). A colour ribbon shows the split, and the page checks that the shares add up to 100%.
- **Two ways to invest.** A fixed amount every month (SIP) or a single amount up front (lump sum), over any window of at least one year.
- **A fair comparison.** The same money, on the same days, goes into a Nifty 500 index fund, so your mix is measured against what the broad market did.
- **Clear results.**
  - **Return a year:** XIRR for a SIP, CAGR for a lump sum.
  - **Bumpiness:** annualised volatility (standard deviation of daily returns).
  - **Worst fall:** the deepest peak-to-trough drop (maximum drawdown).
  - **Beta:** how closely the mix moved with the market.
  - A growth chart of your mix against the benchmark, and a table of each fund on its own with small trend lines.
- **Accounts and saved mixes.** Sign up, log in, and save, load or delete your mixes. Passwords are hashed, and each person can only see and change their own mixes.
- **Built for everyone.** Responsive from 320 px phones to wide monitors; usable with a keyboard alone; labelled for screen readers.

## How it works

1. **Prices.** The page downloads each fund's full daily NAV (net asset value) history from [mfapi.in](https://www.mfapi.in/), a free API built on AMFI data.
2. **Dates.** It finds the window that every fund and the benchmark share (from September 2019, when the youngest of them, the Nifty 500 index fund, begins, to the latest available NAV) and limits the date pickers to it.
3. **Replay.** For a SIP it buys units on each monthly date you would have invested; for a lump sum it buys once. It then values the units every day after.
4. **Measure.** The same steps run for the benchmark, and the metrics above are worked out for the mix, the benchmark and each fund.

## The funds

Every mutual fund here is the **Direct Plan, Growth** option, so returns aren't reduced by distributor commissions and gains stay invested instead of being paid out. Gold BeES is an exchange-traded fund, which has no separate plans.

| Fund | Category | AMFI code |
|---|---|---|
| Nippon India Small Cap Fund | Small cap equity | 118778 |
| HDFC Mid Cap Fund | Mid cap equity | 118989 |
| Nippon India Large Cap Fund | Large cap equity | 118632 |
| DSP Natural Resources and New Energy Fund | Thematic equity | 119028 |
| DSP Gilt Fund | Government debt | 119099 |
| Nippon India ETF Gold BeES | Gold | 140088 |
| **Benchmark:** Motilal Oswal Nifty 500 Index Fund | Broad market index | 147625 |

## Tech stack

| Layer | Tools |
|---|---|
| Front end | React 19, Vite 8, Recharts 3, plain CSS with design tokens |
| Server | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Accounts | bcryptjs (password hashing), JSON Web Tokens (log-in sessions) |
| Data | mfapi.in (daily NAVs) |
| Quality | ESLint, a check file beside each module |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (only needed for accounts and saved mixes)

### 1. Front end

```bash
git clone https://github.com/shubh0710/corpus.git
cd corpus
npm install
npm run dev
```

Open http://localhost:5173. The fund data and the form work without the server.

### 2. Server (accounts and saved mixes)

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

| Variable | What it is |
|---|---|
| `MONGODB_URI` | Your Atlas connection string, including the database user's password |
| `JWT_SECRET` | A long random string used to sign log-in tokens. Keep it private |

In Atlas, add your current IP address under **Network Access**, then start the server:

```bash
npm run dev
```

It runs at http://localhost:3000. With both running, the front end's development server forwards every `/api` request to it, so the page and the server talk without any extra setup.

> `.env` is listed in `.gitignore` and must never be committed. Only `.env.example`, with placeholder values, belongs in the repository.

### Scripts

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | Front end with live reload |
| root | `npm run build` | Production build into `dist/` |
| root | `npm run preview` | Serve the production build locally |
| root | `npm run lint` | Run ESLint over the project |
| `server/` | `npm run dev` | Server with live reload, reading `.env` |
| `server/` | `npm start` | Server for production |

## Project structure

```
corpus/
├── index.html            # Page shell: title, fonts, icons
├── public/               # Files served as-is (favicons)
├── fixtures/             # Sample data used by the checks
├── src/
│   ├── App.jsx           # Holds shared state and puts the page together
│   ├── components/       # One file per card or pop-up, each with its own CSS
│   ├── lib/              # Calculations, data fetching and API helpers, each with a -check.mjs
│   └── index.css         # Design tokens and shared styles
└── server/
    ├── index.js          # Connects to MongoDB, then starts listening
    ├── app.js            # Builds the Express app and mounts the routes
    ├── routes/           # Which address goes to which controller
    ├── controllers/      # What each request does
    ├── models/           # Mongoose schemas: User, Mix
    ├── middleware/       # requireAuth: checks the log-in token
    └── validate*.js      # Server-side input rules
```

The server follows a model, controller, routes layout; the React front end is the view.

## API

All mix routes need an `Authorization: Bearer <token>` header and only ever touch the caller's own mixes.

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/api/health` | Is the server up? | 200 |
| POST | `/api/auth/register` | Create an account `{ email, password }` | 201 `{ token, user }` |
| POST | `/api/auth/login` | Log in `{ email, password }` | 200 `{ token, user }` |
| GET | `/api/auth/me` | Who does this token belong to? | 200 `{ user }` |
| GET | `/api/mixes` | List your saved mixes, newest first | 200 |
| POST | `/api/mixes` | Save a mix `{ name, shares: [{ schemeCode, share }] }` | 201 |
| DELETE | `/api/mixes/:id` | Delete one of your mixes | 204 |

Errors come back as `{ "error": "a readable message" }` with the matching status code (400, 401, 404 or 409). A wrong email and a wrong password get the same message, so the log-in form doesn't reveal which emails have accounts.

## Checks

Each module has a small check script beside it. Run any of them with Node:

```bash
# front end, from the project root
node src/lib/validateInputs-check.mjs
node src/lib/mixesApi-check.mjs

# server, from server/
node validateMix-check.mjs
node health-check.mjs

# server checks that use the database (a separate "corpus-test" database)
node --env-file=.env mixes-api-check.mjs
node --env-file=.env auth-api-check.mjs
```

Most print a `PASS` or `FAIL` line per case and a final `ALL PASS`. The checks for the page's API helpers (`authApi`, `mixesApi`) swap `fetch` for a stand-in, so they run offline. The data-fetching checks (`fetchNavData`, `fetchAllFunds`, `live-pipeline`) call mfapi.in for real and need an internet connection.

## Disclaimer

Corpus is an educational project. Nothing here is investment advice. Past performance does not guarantee future returns. NAV data comes from mfapi.in and may contain gaps or errors. Corpus is not affiliated with any fund house, AMFI or mfapi.in.

## License

[MIT](LICENSE) © 2026 Shubh

Built by [Shubh](https://github.com/shubh0710).