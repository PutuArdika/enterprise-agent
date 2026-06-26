# Gmail CV Analysis - Flow Diagrams & Architecture

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Types: "analisa cv dari inbox email recruiter@gmail.com"   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                 ┌──────────────────────┐
                 │  Pattern Detection   │
                 │  in ChatInterface    │
                 └──────────┬───────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Show GmailAuthDialog              │
            │ "Enter Gmail Email Address"       │
            │ [email input] [Continue button]   │
            └────────────┬──────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────────────┐
          │ User clicks Continue                 │
          │ System calls /api/gmail/auth-url     │
          └────────────┬─────────────────────────┘
                       │
                       ▼
          ┌────────────────────────────────────────┐
          │ Browser opens Google OAuth Window      │
          │ User logs in with Google Account       │
          │ User clicks "Authorize"                │
          └────────────┬─────────────────────────┘
                       │
                       ▼
          ┌────────────────────────────────────────┐
          │ Google redirects to our callback       │
          │ System gets authorization code        │
          └────────────┬─────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │ System calls /api/gmail/exchange-token   │
        │ Exchanges code for access token          │
        │ Gets back: accessToken, refreshToken     │
        └─────────────┬──────────────────────────┘
                      │
                      ▼
          ┌─────────────────────────────────┐
          │ Show CVSearchDialog              │
          │ "Enter Search Keyword"           │
          │ [keyword input] [Search button]  │
          └────────────┬────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ User enters: "software engineer"     │
        │ Clicks Search                        │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │ System calls /api/gmail/search-cvs     │
        │ {accessToken, keyword}                 │
        └────────────┬─────────────────────────┘
                     │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
    ┌────────────────┐  ┌────────────────┐
    │ Search Gmail   │  │ For each email:│
    │ using keyword  │  │ - Get message  │
    │ Find emails    │  │ - Find attach  │
    │ with PDF/DOC   │  │ - Download file│
    └────────────────┘  │ - Extract text │
                        │ - Analyze with │
                        │   GPT-4        │
                        │ - Calculate    │
                        │   match score  │
                        └────────────────┘
           │                   │
           └─────────┬─────────┘
                     │
                     ▼
         ┌──────────────────────────────┐
         │ Sort by match score          │
         │ Take top 3 candidates        │
         │ Return results               │
         └────────────┬─────────────────┘
                      │
                      ▼
          ┌───────────────────────────────────┐
          │ Show TopCandidates component      │
          │ Display:                          │
          │  #1 Candidate - 95% Match        │
          │      Skills, Experience, Edu     │
          │  #2 Candidate - 87% Match        │
          │      Skills, Experience, Edu     │
          │  #3 Candidate - 78% Match        │
          │      Skills, Experience, Edu     │
          └───────────────────────────────────┘
```

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Frontend (React/Next.js)                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ChatInterface (Main Container)                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ - Detects Gmail pattern                               │  │
│  │ - Manages auth state                                  │  │
│  │ - Displays dialogs and results                        │  │
│  └────────────────────────────────────────────────────────┘  │
│          ├─────────────────────┬──────────────────┐           │
│          │                     │                  │           │
│          ▼                     ▼                  ▼           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐   │
│  │ GmailAuthDialog  │  │ CVSearchDialog   │  │TopCandid │   │
│  │                  │  │                  │  │  ates    │   │
│  │ OAuth 2-step     │  │ Keyword input    │  │  Results │   │
│  │ verification     │  │ & validation     │  │ Display  │   │
│  └──────────────────┘  └──────────────────┘  └──────────┘   │
│          │                     │                  │           │
│          └─────────────────────┼──────────────────┘           │
│                                │                              │
│                        API Calls (fetch)                      │
│                                │                              │
└────────────────────────────────┼──────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
         ┌──────────────────┐ ┌──────────┐ ┌──────────────┐
         │ Backend (Next.js) │ │ Google   │ │ OpenAI       │
         │ API Routes       │ │ OAuth    │ │ API          │
         │                  │ │          │ │ (GPT-4)      │
         ├──────────────────┤ └──────────┘ └──────────────┘
         │                  │
         │ /api/gmail/      │
         │ ├─ auth-url      │   Authenticate  │   Analyze
         │ ├─ exchange-token│   user via      │   CV text
         │ └─ search-cvs    │   Google OAuth  │   using
         │                  │                  │   GPT-4
         │ Search, extract, │
         │ analyze process: │
         │ 1. Get access    │
         │    token         │
         │ 2. Search Gmail  │
         │    messages      │
         │ 3. Download      │
         │    attachments   │
         │ 4. Extract text  │
         │    from PDFs     │
         │ 5. Analyze with  │
         │    OpenAI        │
         │ 6. Calculate     │
         │    scores        │
         │ 7. Return top 3  │
         │                  │
         └──────────────────┘
                    │
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌─────────────┐      ┌──────────────┐
    │ Gmail API   │      │ Database     │
    │             │      │ (Optional)   │
    │ - Search    │      │              │
    │ - Read msgs │      │ - Store      │
    │ - Download  │      │   searches   │
    │   files     │      │ - Save       │
    │             │      │   candidates │
    └─────────────┘      └──────────────┘
```

## Data Flow

```
┌──────────────────┐
│ User Input       │
│ "analisa cv..."  │
└────────┬─────────┘
         │
         ▼
┌───────────────────────────────────┐
│ Extract Email from Message        │
│ recruiter@gmail.com               │
└────────┬────────────────────────┤
         │                        │
         ▼                        │
┌───────────────────────────────────┐
│ Create OAuth URL                  │
│ GET accounts.google.com/o/oauth...│
└────────┬────────────────────────┤
         │                        │
         ▼                        │
┌───────────────────────────────────┐
│ User Authorizes in Browser        │
│ Google returns authorization code │
└────────┬────────────────────────┤
         │                        │
         ▼                        │
┌───────────────────────────────────┐
│ Exchange Code for Token           │
│ POST oauth2.googleapis.com/token  │
│ Response: {access_token, ...}     │
└────────┬────────────────────────┤
         │                        │
         ▼                        │
┌───────────────────────────────────┐
│ User Enters Keyword               │
│ "software engineer"               │
└────────┬────────────────────────┤
         │                        │
         ▼                        │
┌────────────────────────────────────────────┐
│ Search Gmail Messages                      │
│ Query: subject:"software engineer"         │
│ With attachments: pdf, doc, docx           │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ For Each Message (up to 10):               │
│ 1. Get full message details                │
│ 2. Find attachment ID                      │
│ 3. Download attachment file                │
│ 4. Convert to Uint8Array                   │
│ 5. Parse with pdfjs-dist                   │
│ 6. Extract text from all pages             │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ Analyze with OpenAI GPT-4                  │
│ Prompt: Extract name, email, phone,        │
│         skills, experience, education      │
│ Response: {name, email, ...}               │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ Calculate Match Score for Each Candidate   │
│ Points for:                                │
│ - Skill matches (×10)                      │
│ - Experience matches (×15)                 │
│ - Education matches (×5)                   │
│ - Having skills/exp/edu (×10/15/10)        │
│ Max: 100%                                  │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ Sort by Match Score (Descending)           │
│ Take Top 3 Candidates                      │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ Return to Frontend                         │
│ {                                          │
│   candidates: [                            │
│     {                                      │
│       email, subject, senderInfo,          │
│       analysis: {skills, exp, edu, ...},   │
│       matchScore: 95,                      │
│       messageId                            │
│     },                                     │
│     ...                                    │
│   ]                                        │
│ }                                          │
└────────┬──────────────────────────────────┤
         │                                  │
         ▼                                  │
┌────────────────────────────────────────────┐
│ Render TopCandidates Component             │
│ Display all 3 candidates with info        │
└────────────────────────────────────────────┘
```

## Component Relationships

```
ChatInterface (Main)
├── Pattern Detection
│   └── "analisa cv dari inbox email xxx@gmail.com"
│
├── GmailAuthDialog
│   ├── Step 1: Email Input
│   │   └── POST /api/gmail/auth-url
│   │
│   └── Step 2: Authorization Code
│       └── POST /api/gmail/exchange-token
│           └── Get: accessToken, refreshToken
│
├── CVSearchDialog
│   ├── Keyword Input
│   │   └── POST /api/gmail/search-cvs
│   │       ├── Search Gmail (gmail.googleapis.com)
│   │       ├── Download attachments
│   │       ├── Extract text (pdfjs-dist)
│   │       ├── Analyze (openai)
│   │       └── Calculate scores
│   │
│   └── Get: candidates array
│
└── TopCandidates
    ├── Display #1, #2, #3 candidates
    ├── Show match scores
    ├── Show skills, experience, education
    └── View/Close options
```

## Time Timeline

```
T+0s    User types message
T+0.1s  Pattern detected → Show GmailAuthDialog
T+1s    User enters email, clicks Continue
T+1.1s  Call /api/gmail/auth-url → Get OAuth URL
T+1.2s  Browser opens OAuth window
T+2s    User logs in and authorizes
T+2.1s  Browser redirects with code
T+2.2s  Call /api/gmail/exchange-token → Get token
T+2.3s  Show CVSearchDialog
T+3s    User enters "software engineer", clicks Search
T+3.1s  Call /api/gmail/search-cvs with token
T+3.2s  Search Gmail (~500ms)
T+3.7s  Download 3 CV files (~500ms)
T+4.2s  Extract text from PDFs (~1s)
T+5.2s  Analyze with GPT-4 (~3s)
T+8.2s  Calculate match scores (~100ms)
T+8.3s  Return results, show TopCandidates
T+8.5s  User sees top 3 candidates displayed
```

---

This architecture ensures secure, efficient CV analysis with clear separation of concerns between frontend UI, backend API logic, and external service integrations.
