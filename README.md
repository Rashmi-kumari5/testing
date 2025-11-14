# Dark Calculator (Task 2)

A minimal Next.js experience that focuses on a tactile, dark-themed calculator. The UI is responsive, keyboard-friendly, and powered by a small utility layer that handles the math with predictable precision.

## Features

- Sleek dark interface with layered glassmorphism accents
- Four basic operations with smart chaining/overwrite logic
- Helper commands for percentage conversion and sign toggling
- Accessible controls with large tap targets and live region updates

## Getting started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Testing & quality

Mathematical helpers live in `lib/calc.ts` and are covered with Vitest.

```bash
npm run test
```

Lint the project with:

```bash
npm run lint
```
