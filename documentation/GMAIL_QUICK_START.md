# Gmail CV Analysis - Quick Start Guide

## 5-Minute Setup

### Step 1: Create Google OAuth Credentials (3 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Go to "APIs & Services" > "Library"
4. Search and enable "Gmail API"
5. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
6. Choose "Web application"
7. Add redirect URI: `http://localhost:3000/api/gmail/callback`
8. Copy **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables (1 minute)

Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

### Step 3: Test It (1 minute)

1. Start the app: `npm run dev`
2. Open chat interface
3. Type: `analisa cv dari inbox email your-email@gmail.com`
4. Follow the OAuth flow
5. Enter a keyword like: `software engineer application`
6. See top 3 candidates!

## How to Use

### Basic Usage

Type in chat:

```
analisa cv dari inbox email recruiter@gmail.com
```

What happens:

1. Gmail auth dialog appears
2. You authorize with Google
3. System asks for search keyword
4. You enter keyword: "software engineer"
5. System shows top 3 matching candidates

### Example Keywords

- "software engineer"
- "product manager"
- "data scientist"
- "job application"
- "cv"
- Any other job title or role

## What You'll See

For each candidate:

- ⭐ Match Score (0-100%)
- 👤 Sender Name & Email
- 📝 Professional Summary
- 💼 Skills (as badges)
- 🏆 Experience (with highlights)
- 🎓 Education

## Troubleshooting

### "OAuth credentials missing"

→ Check `.env.local` has correct values

### "Cannot authenticate"

→ Verify redirect URI matches exactly in Google Console

### "No matching emails found"

→ Try different keyword or check if emails have attachments

### "Failed to extract text from PDF"

→ PDF might be image-only, try another file

## File Structure

```
├── components/
│   ├── GmailAuthDialog.tsx      (Gmail login)
│   ├── CVSearchDialog.tsx       (Keyword input)
│   └── TopCandidates.tsx        (Results display)
├── app/api/gmail/
│   ├── auth-url/route.ts        (Generate OAuth URL)
│   ├── exchange-token/route.ts  (Get access token)
│   └── search-cvs/route.ts      (Search & analyze)
└── documentation/
    ├── GMAIL_CV_ANALYSIS.md          (Full guide)
    └── GMAIL_CV_ANALYSIS_COMPLETE.md (Implementation details)
```

## Feature Highlights

✅ **Secure** - Uses OAuth, read-only access
✅ **Automatic** - Pattern detection in chat
✅ **Smart** - GPT-4 powered CV analysis
✅ **Fast** - Results in 10-15 seconds
✅ **Simple** - Just type and authorize

## Supported File Types

- `.pdf` - PDF files
- `.doc` - Microsoft Word
- `.docx` - Microsoft Word (newer)

## Common Issues & Solutions

| Issue                     | Solution                             |
| ------------------------- | ------------------------------------ |
| OAuth window doesn't open | Check browser popup blocker          |
| "Invalid email" error     | Make sure email format is correct    |
| No results found          | Try different keyword or check inbox |
| Slow processing           | Normal, GPT-4 analysis takes time    |
| Token expired             | Just authorize again                 |

## API Costs

- **Gmail API**: Free (generous quota)
- **OpenAI GPT-4**: ~$0.03 per CV analyzed
- Typical cost per search: ~$0.10 for 3 CVs

## Privacy & Security

✅ Only reads emails (read-only access)
✅ Google handles authentication
✅ No data stored permanently
✅ You can revoke access anytime
✅ Each session is independent

## Next Steps

1. ✅ Set up Google OAuth (5 min)
2. ✅ Add environment variables
3. ✅ Test with sample emails
4. ⏭️ Try different keywords
5. ⏭️ Customize match score algorithm if needed

## Need Help?

Check these files:

- `GMAIL_CV_ANALYSIS.md` - Detailed documentation
- `GMAIL_CV_ANALYSIS_COMPLETE.md` - Implementation details
- Component files have inline comments

## Want to Customize?

### Change Match Score Weights

Edit `app/api/gmail/search-cvs/route.ts` in `calculateMatchScore()`:

```typescript
score += matchingSkills * 10; // Change 10 to your weight
score += matchingExp * 15; // Change 15 to your weight
score += matchingEdu * 5; // Change 5 to your weight
```

### Change Candidate Limit

Edit line in same file:

```typescript
.slice(0, 3)  // Change 3 to show more/fewer candidates
```

### Change Search Limit

Edit same file:

```typescript
messages.slice(0, 10); // Change 10 to search more emails
```

---

🚀 **Ready to go!** Start analyzing CVs now.
