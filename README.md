# Aurora · Scientific Calculator

Aurora is a sleek Next.js app that delivers a complete scientific calculator experience in the browser. It evaluates complex expressions backed by `mathjs`, supports trigonometry in degrees or radians, exposes constants such as π/τ/e, and streams live previews while you type.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to start calculating.

## Features

- DEG/RAD angle toggle that updates trig and inverse-trig functions on the fly
- Logarithms (log, ln), square roots, exponentials, absolute values, and power shortcuts
- Keyboard support for numbers, operators, parentheses, Enter/Backspace/Escape
- Inline evaluation errors with helpful messaging

## Testing

```bash
npm run lint   # ESLint
npm test       # Vitest unit tests for the calculator engine
```

The Vitest suite validates the expression evaluator, constants, and angle-mode handling so the UI can trust the results it renders.