# Gmail CV Analysis Setup Guide

## Overview

The Gmail CV Analysis feature allows users to search their Gmail inbox for job application emails and automatically analyze CVs attached to them using OpenAI's GPT-4.

**Trigger Pattern:** `analisa cv dari inbox email xxx@gmail.com`

## How It Works

1. **User Request:** User asks to analyze CVs from a specific Gmail inbox
   - Example: "analisa cv dari inbox email xxx@gmail.com"
2. **Authentication:** System opens Gmail OAuth dialog
   - User enters Gmail email address
   - System redirects to Google OAuth login
   - User authorizes access to Gmail
   - System exchanges authorization code for access token

3. **Search & Analysis:** System searches for emails with specific keywords
   - User enters search keyword (e.g., "software engineer application")
   - System searches Gmail for matching emails with PDF/DOC attachments
   - Extracts text from each CV attachment
   - Analyzes CVs using OpenAI GPT-4

4. **Results:** System displays top 3 candidates ranked by relevance
   - Match score (0-100%)
   - Contact information
   - Skills (with badges)
   - Experience
   - Education
   - Professional summary

## Setup Instructions

### 1. Google OAuth Configuration

#### a. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

#### b. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/gmail/callback` (development)
   - `https://yourdomain.com/api/gmail/callback` (production)

5. Copy the Client ID and Client Secret

### 2. Environment Variables

Add to `.env.local`:

```bash
# Gmail OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

### 3. Implementation Details

#### API Endpoints

**POST /api/gmail/auth-url**

- Generates Google OAuth authorization URL
- Input: `{ email: string }`
- Output: `{ authUrl: string, email: string }`

**POST /api/gmail/exchange-token**

- Exchanges authorization code for access token
- Input: `{ email: string, code: string }`
- Output: `{ accessToken: string, refreshToken: string | null, expiresIn: number, email: string }`

**POST /api/gmail/search-cvs**

- Searches Gmail and analyzes CVs
- Input: `{ accessToken: string, keyword: string }`
- Output: `{ candidates: CVCandidate[], totalFound: number }`

#### CVCandidate Interface

```typescript
interface CVCandidate {
  email: string;
  subject: string;
  senderInfo: string;
  analysis: {
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
  };
  matchScore: number;
  messageId: string;
}
```

#### Components

1. **GmailAuthDialog.tsx**
   - Two-step authentication dialog
   - Email verification
   - Authorization code input

2. **CVSearchDialog.tsx**
   - Keyword input for subject line search
   - Simple form interface

3. **TopCandidates.tsx**
   - Displays top 3 candidates
   - Shows skills as badges
   - Expandable experience and education
   - Match score ranking

### 4. Usage Examples

#### Example 1: Basic CV Analysis

```
User: "analisa cv dari inbox email recruiter@gmail.com"
System: Shows Gmail auth dialog
User: Authenticates with Google
System: Shows keyword search dialog
User: "software engineer"
System: Displays top 3 matching candidates
```

#### Example 2: Different Keywords

```
User: "analisa cv dari inbox email hr@gmail.com"
System: Authenticates and searches
User: "product manager"
System: Shows product manager candidates
```

## Feature Details

### Pattern Recognition

The system detects the following patterns (case-insensitive):

- "analisa cv dari inbox email xxx@gmail.com"
- "analisis cv dari inbox email xxx@gmail.com"

Email must be in valid format: `username@domain.com`

### Search Logic

1. Searches Gmail for emails matching the keyword in subject line
2. Filters emails with PDF, DOC, or DOCX attachments
3. Retrieves up to 10 matching emails
4. Extracts text from first attachment of each email
5. Analyzes text with GPT-4-turbo
6. Calculates match score based on:
   - Keyword relevance to skills
   - Keyword relevance to experience
   - Keyword relevance to education
   - Presence of skills, experience, and education

### Match Score Calculation

```
Score = (matchingSkills × 10) +
        (matchingExperience × 15) +
        (matchingEducation × 5) +
        baseScore (10 + 15 + 10 if each section present)
Maximum: 100%
```

## Security Considerations

### Current Implementation (Development)

- Access tokens stored in client state
- Suitable for single-user development
- Token expires with session

### Production Recommendations

1. **Secure Token Storage**
   - Store refresh tokens in secure database
   - Use httpOnly cookies for access tokens
   - Implement token rotation

2. **Rate Limiting**
   - Limit Gmail API calls per user
   - Implement request queuing

3. **Audit Logging**
   - Log all Gmail searches and access
   - Track file analysis history

4. **Scope Limitation**
   - Use `gmail.readonly` scope (read-only)
   - Never request broader permissions

5. **User Consent**
   - Clear explanation of data access
   - Option to revoke access anytime

## Troubleshooting

### "Cannot find module" Errors

- Ensure all dependencies are installed: `npm install`
- Rebuild: `npm run build`

### OAuth Errors

1. Check if Client ID and Secret are correct
2. Verify redirect URI matches exactly (including protocol and port)
3. Ensure Gmail API is enabled in Google Cloud Console

### Gmail API Errors

1. Check if user has authorized the application
2. Verify access token hasn't expired
3. Ensure email account has Gmail enabled

### PDF Extraction Errors

- Verify PDF file is valid and readable
- Some PDFs with image-only content won't extract text
- Check console logs for specific pdfjs-dist errors

## API Quota & Limits

### Gmail API (Google Workspace)

- 10,000,000 requests per day (standard)
- Per-user quota: 250 requests per second

### OpenAI API

- See [OpenAI Pricing](https://openai.com/pricing)
- GPT-4-turbo for CV analysis

## Future Enhancements

1. **Multi-Account Support**
   - Manage multiple Gmail accounts
   - Switch between accounts in UI

2. **Advanced Filtering**
   - Date range filters
   - Sender filtering
   - Email body content search

3. **Batch Processing**
   - Analyze all matching emails at once
   - Export results to CSV

4. **Template Matching**
   - Create role templates
   - Auto-match candidates to templates

5. **Persistent Storage**
   - Save candidate analyses
   - Create candidate profiles
   - Track application history

6. **Notifications**
   - Alert when new matching emails arrive
   - Schedule periodic searches

## Reference Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API Documentation](https://developers.google.com/gmail/api/guides)
- [Google OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)
- [OpenAI GPT-4 Turbo](https://platform.openai.com/docs/models)
- [pdfjs-dist Documentation](https://github.com/mozilla/pdf.js)
