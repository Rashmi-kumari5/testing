# Asama · NTS High Priority

A lightweight Next.js dashboard that lists every high-priority task on the Asama `NTS`
board. The page fetches live data when the Asama API is available and falls back to the
latest committed snapshot so that product reviews and demos always have useful content.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to see the board.

## Configuration

| Variable | Purpose |
| --- | --- |
| `ASAMA_API_BASE_URL` | Base URL of the Asama API (e.g. `https://example.com/api`). When omitted, the UI automatically uses the snapshot stored in `data/asama/nts-board.json`. |
| `ASAMA_BOARD_ID` | (Optional) Override the board key. Defaults to `NTS`. |

Both variables can be added to a `.env.local` file.

## Testing

```bash
npm run lint   # ESLint
npm test       # Vitest unit tests for the data normalisers
```

The Vitest suite focuses on the parsing logic that needs to behave consistently across
different payload shapes.