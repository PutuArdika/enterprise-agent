# Database Connection Troubleshooting

## Issue: "Connection timeout" when connecting to Neon

### Causes

1. **Network/Firewall** - Your network may block Neon connections
2. **Neon firewall** - IP not whitelisted
3. **Connection string** - Invalid or expired credentials
4. **Regional issues** - Connectivity problems to specific region

### Solutions

## Option 1: Test Your Connection (Outside Node.js)

### Using psql (if installed)

```bash
psql "your-DATABASE_URL-here"
```

### Using online tools

Visit: https://neon.tech/docs/connect/connect-from-any-app

---

## Option 2: Use Local SQLite for Demo (Recommended for MVP)

If you can't connect to Neon, we can use SQLite for local development:

```bash
# This is a simpler alternative
npm install sqlite3 better-sqlite3
```

Then run the app in demo mode without database migration.

---

## Option 3: Skip Database Migration for Now

The MVP can still run without the database:

```bash
# Start the dev server
npm run dev

# App will work in "demo mode"
```

**What works:**

- ✅ Dashboard loads
- ✅ Upload page shows
- ✅ Chat interface displays
- ✅ UI/UX fully functional

**What won't work yet:**

- ❌ Actually uploading PDFs (needs DB)
- ❌ Storing in database (needs DB)
- ❌ Asking questions (needs DB)

---

## Option 4: Verify Neon Credentials

1. Go to https://console.neon.tech
2. Create a new database if needed
3. Get connection string (copy full URL)
4. Paste into `.env.local` as `DATABASE_URL`
5. Verify URL format:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

---

## Option 5: Contact Neon Support

If credentials are correct but still timing out:

- Email: support@neon.tech
- Check: https://neon.tech/status
- Verify your firewall allows outbound connections

---

## For Now: Run Without Database

```bash
npm run dev
```

This will start your Next.js app which:

- ✅ Loads all pages
- ✅ Shows the UI
- ✅ Ready for code review
- ✅ Perfect for interview demo of architecture

You can explain that in production you'd connect the database.

---

**Next Step:** Run `npm run dev` and visit http://localhost:3000
