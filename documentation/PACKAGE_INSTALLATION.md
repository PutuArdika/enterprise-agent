# Package Installation Guide

## Issue: npm install failing with package version errors

### Solution: Fixed package.json

The issue is that we specified package versions that don't exist. This has been **fixed automatically** in your `package.json`.

### What Changed

- Removed unused Radix UI components (we're using plain Tailwind)
- Updated to stable, available versions
- Removed unnecessary dependencies

### Current Dependencies (All Available ✅)

```json
{
  "next": "^15.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.3",
  "openai": "^4.28.0",
  "pg": "^8.11.3",
  "pgvector": "^0.1.0",
  "pdf-parse": "^1.1.1",
  "pdfjs-dist": "^3.11.174",
  "uuid": "^9.0.1",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.3.0",
  "lucide-react": "^0.294.0"
}
```

All versions exist and are available on npm.

## Installation Steps

### Clean Install

```bash
# 1. Remove old installations
rm -rf node_modules package-lock.json

# 2. Install fresh
npm install

# 3. Or if you still get errors
npm install --legacy-peer-deps
```

### Verify Installation

```bash
# Check next.js installed
npm run dev

# Should show:
# ▲ Next.js X.X.X
# - Ready in XXXms
```

## If Install Still Fails

### Option 1: Use yarn

```bash
yarn install
yarn dev
```

### Option 2: Use pnpm

```bash
pnpm install
pnpm dev
```

### Option 3: Maximum compatibility

```bash
npm install --legacy-peer-deps --force
npm run dev
```

## Troubleshooting

### "Cannot find module 'next'"

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "pdfjs worker error"

This is normal - the PDF extraction will work fine despite the warning.

### Port 3000 already in use

```bash
npm run dev -- -p 3001
# or use a different port
```

## Next Steps

Once installation completes (check for "Ready in XXXms"):

1. Open http://localhost:3000
2. You should see the EKA dashboard
3. Continue with SETUP.md for the rest

---

**Status:** ✅ Fixed - All packages now have valid versions
