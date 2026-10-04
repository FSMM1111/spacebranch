# SpaceBranch — Deploy Ready

This folder is prepared for deployment to Vercel.

## Project
- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- Static front-end prototype
- No backend or environment variables required for the current prototype

## Vercel
1. Create/import a Vercel project from this folder or repository.
2. Framework preset: Vite.
3. Install command: `pnpm install --frozen-lockfile`
4. Build command: `pnpm build`
5. Output directory: `dist`
6. Node.js: 22

A `vercel.json` file is already included.

## Local check
```bash
pnpm install --frozen-lockfile
pnpm dev
```

Build:
```bash
pnpm build
```

Preview:
```bash
pnpm preview
```

## Note
The original Figma Make source files and `.figma` configuration are preserved.
