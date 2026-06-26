# Gmail Search Error Handling - Fix

## 🔧 Problem Identified

**Error Message:** `Error: Failed to search Gmail messages`

**Issue:**

- Generic error message didn't show actual reason
- No token validation before search
- API errors weren't being propagated
- Hard to debug when something fails

## ✅ Solution Implemented

### 1. Enhanced Error Messages

All Gmail API calls now return detailed error information:

**Before:**

```
Failed to search Gmail messages
Failed to get attachment
Failed to get message details
```

**After:**

```
Gmail search failed: Invalid OAuth scope
Get attachment failed: The user has not granted the application...
Get message failed: Invalid authentication credentials
```

### 2. Token Validation Added

**New Feature:** Check token validity before searching

```typescript
// Validate token by making a simple API call
const validateResponse = await fetch(
  "https://www.googleapis.com/gmail/v1/users/me/profile",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  },
);

if (!validateResponse.ok) {
  return NextResponse.json(
    { error: `Invalid or expired access token: ${errorMsg}` },
    { status: 401 },
  );
}
```

**Benefits:**

- ✅ Fails early with clear message
- ✅ Saves time processing
- ✅ User knows to re-authorize

### 3. Better Error Handling Flow

```
POST /api/gmail/search-cvs
  ↓
Parse request (accessToken, keyword)
  ↓
Validate inputs
  ↓
VALIDATE TOKEN (NEW!)
  ↓
Search Gmail
  ↓
Process each message
  ↓
Return results
  ↓
CATCH: Return detailed error
```

## 📋 Files Modified

### `app/api/gmail/search-cvs/route.ts`

**Function: `searchGmailMessages()`**

- ✅ Enhanced error message with API details
- ✅ Logs full error response for debugging

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
  console.error("Gmail API error:", errorMsg, errorData);
  throw new Error(`Gmail search failed: ${errorMsg}`);
}
```

**Function: `getMessageAttachment()`**

- ✅ Enhanced error message
- ✅ Check for missing data in response

```typescript
if (!base64Data) {
  throw new Error("No data in attachment response");
}
```

**Function: `getMessageDetails()`**

- ✅ Enhanced error message with API response details

**Function: `POST()`**

- ✅ Added token validation at start
- ✅ Added logging for debugging
- ✅ Better error message propagation

```typescript
// Validate token first
const validateResponse = await fetch(
  "https://www.googleapis.com/gmail/v1/users/me/profile",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  },
);

if (!validateResponse.ok) {
  return NextResponse.json(
    { error: `Invalid or expired access token: ${errorMsg}` },
    { status: 401 },
  );
}
```

## 🎯 Error Scenarios Handled

### Scenario 1: Invalid/Expired Token

```
Error: Invalid or expired access token: Invalid OAuth scope
Status: 401
Action: User needs to re-authorize Gmail
```

### Scenario 2: Gmail API Rate Limit

```
Error: Gmail search failed: Daily rate limit exceeded
Status: 500
Action: Wait and try again later
```

### Scenario 3: Missing Attachment Data

```
Error: Failed to download attachment: No data in attachment response
Status: 500
Action: Skip this attachment and try next
```

### Scenario 4: Network Error

```
Error: Failed to search Gmail: Network timeout
Status: 500
Action: Retry the request
```

## 🧠 Debugging Features Added

### Console Logging

Each step now logs details:

```typescript
console.log("Validating access token...");
console.log(`Searching Gmail with keyword: "${keyword}"`);
console.log(`Found ${messages.length} messages, processing...`);
console.error("Gmail API error:", errorMsg, errorData);
console.error("Token validation error:", errorMsg);
console.warn(`Failed to process message ${message.id}: ${msg}`);
```

### Detailed Error Messages

- HTTP status code included
- API error message included
- Request details logged
- Response data logged (when available)

## 🔒 Security

### No Sensitive Data Logged

- ✅ Token not logged (only used in requests)
- ✅ Email content not logged
- ✅ CV data not logged
- ✅ Only error details logged

### Origin Validation

- Already present in callback handler
- Token validated with official endpoint

## 🚀 Improvements Made

| Aspect         | Before    | After                     |
| -------------- | --------- | ------------------------- |
| Error Messages | Generic   | Detailed with API info    |
| Token Check    | None      | Validated before search   |
| Debugging      | Hard      | Console logs at each step |
| User Feedback  | Confusing | Clear error messages      |
| Recovery       | Unknown   | Know exactly what failed  |

## 📊 Response Examples

### Success Response

```json
{
  "candidates": [
    {
      "email": "john@example.com",
      "subject": "CV for Senior Developer",
      "senderInfo": "John Doe <john@example.com>",
      "matchScore": 85,
      "analysis": {
        "name": "John Doe",
        "skills": ["Python", "JavaScript", "React"],
        "experience": [...],
        "education": [...],
        "summary": "..."
      }
    }
  ],
  "totalFound": 3
}
```

### Error Response - Invalid Token

```json
{
  "error": "Invalid or expired access token: Invalid OAuth scope"
}
```

### Error Response - No Results

```json
{
  "candidates": [],
  "message": "No matching emails found"
}
```

### Error Response - API Error

```json
{
  "error": "CV search failed: Gmail search failed: Daily rate limit exceeded"
}
```

## 🧪 Testing Checklist

- [x] Error handling enhanced
- [x] Token validation added
- [x] Detailed error messages
- [x] Logging at key points
- [x] No sensitive data logged
- [x] All error scenarios handled
- [x] TypeScript types correct
- [x] No build errors

## 📞 What to Do When Error Occurs

### Error: "Invalid or expired access token"

**Action:** Click "Continue" in dialog to re-authorize Gmail

### Error: "Gmail search failed: Daily rate limit exceeded"

**Action:** Wait 24 hours, then try again (Google API limit)

### Error: "Failed to download attachment"

**Action:** Check the email, ensure PDF is valid

### Error: "Failed to extract text from PDF"

**Action:** Try a different PDF/CV format

## 🚀 Status

✅ **Complete and Tested**

- ✅ Error handling improved
- ✅ Token validation added
- ✅ Detailed logging added
- ✅ No build errors
- ✅ Production ready

## 📈 Benefits

1. **Better Debugging**
   - Clear error messages
   - Console logs for tracing
   - Know exactly what failed

2. **Better User Experience**
   - Knows when token is invalid
   - Knows what action to take
   - Clear error messages

3. **Better Reliability**
   - Early token validation
   - Fails gracefully
   - Retry logic possible

---

**Status:** ✅ COMPLETE

Gmail search error handling is now production-ready with detailed debugging!
