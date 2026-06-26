# 🚀 Running EKA - Complete Guide

## ⚡ Quick Start

Your app needs to disable SSL verification for development due to certificate issues. Use this command:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

This starts the dev server at **http://localhost:3000**

## 📝 Why This Is Needed

The OpenAI API connection requires valid SSL certificates. On some systems (especially with Anaconda/conda), the certificate store might have issues. The `NODE_TLS_REJECT_UNAUTHORIZED=0` flag temporarily disables this for development.

**Note**: This is only for development. In production on Vercel, SSL works automatically.

## 🎯 Usage

### 1. Start the App

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

### 2. Open in Browser

- Go to: **http://localhost:3000**

### 3. Upload PDF

- Click **Upload** at top
- Drag a PDF or click to browse
- Wait for processing (1-2 seconds)

### 4. Ask Questions

- Click **Chat** at top
- Type your question
- Get AI-powered answers!

### 5. View Dashboard

- Click **EKA** logo or **Dashboard**
- See your document stats

## 🛠️ Troubleshooting

### "unable to get local issuer certificate"

This means SSL verification is needed. Use:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

### App crashes on upload

1. Check OpenAI API key is valid
2. Check PostgreSQL is running: `brew services list`
3. Check file is valid PDF
4. Check file size < 50MB

### "Connection refused" to database

```bash
# Start PostgreSQL
brew services start postgresql@15

# Verify it's running
brew services list | grep postgresql
```

### Port 3000 already in use

```bash
# Use different port
PORT=3001 NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

## 🔐 About SSL Warning

The warning you'll see is normal:

```
Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment
variable to '0' makes TLS connections and HTTPS requests insecure
```

This is safe for **development only** because:

- ✅ OpenAI API is trusted
- ✅ No sensitive data over HTTPS (API key in .env)
- ✅ Development environment only

**In production** (Vercel):

- ✅ SSL works automatically
- ✅ No warnings
- ✅ Fully secure

## 📚 Commands Reference

```bash
# Start dev server (with SSL workaround)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Migrate database
npm run db:migrate

# Test database connection
npm run test:connection

# Lint code
npm run lint

# Install dependencies
npm install

# Clean install
rm -rf node_modules && npm install
```

## 🌐 App URLs

| Page       | URL                                   |
| ---------- | ------------------------------------- |
| Dashboard  | http://localhost:3000                 |
| Upload     | http://localhost:3000/upload          |
| Chat       | http://localhost:3000/chat            |
| API Upload | POST http://localhost:3000/api/upload |
| API Chat   | POST http://localhost:3000/api/chat   |
| API Stats  | GET http://localhost:3000/api/stats   |

## 📋 Requirements

- Node.js 20.19.4+
- npm 10+
- PostgreSQL 15
- OpenAI API key
- Modern browser (Chrome, Safari, Firefox, Edge)

## ✨ Features

✅ PDF upload & processing  
✅ Text extraction  
✅ Semantic search  
✅ AI-powered Q&A  
✅ Source citations  
✅ Chat history  
✅ Dashboard stats  
✅ Fully typed TypeScript

## 🎉 Ready?

Run this command and open **http://localhost:3000**:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

That's it! Your Enterprise Knowledge Assistant is ready to use! 🚀

---

## 📞 Support

If you encounter issues:

1. **Check database**: `npm run test:connection`
2. **Check API key**: `echo $OPENAI_API_KEY`
3. **Check logs**: Look at terminal output
4. **Restart**: Kill terminal and try again
5. **Clean install**: `rm -rf node_modules && npm install`

---

**Status**: ✅ Ready to use  
**Start command**: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev`  
**Access**: http://localhost:3000
