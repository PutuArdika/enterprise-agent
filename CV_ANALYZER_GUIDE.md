# CV Analyzer Feature

## Overview

The CV Analyzer is a new feature in EMPA that allows users to upload and analyze their CVs/Resumes. Using AI-powered analysis, it extracts key information including contact details, professional summary, skills, experience, and education.

## Features

### 1. **PDF Upload**

- Drag-and-drop interface
- Click to select files
- Real-time file validation
- Visual feedback for selected files

### 2. **AI-Powered Analysis**

- Extracts contact information (name, email, phone)
- Identifies professional skills
- Parses work experience
- Extracts education details
- Generates professional summary

### 3. **Beautiful Results Display**

- Organized card-based layout
- Skills shown as badges
- Experience and education in easy-to-read format
- Contact information prominently displayed

## How to Use

### Step 1: Navigate to CV Analyzer

Click on the **"📄 CV Analyzer"** menu item in the navigation bar.

### Step 2: Upload Your CV

- **Drag and drop** your PDF CV onto the upload area, OR
- **Click** the upload area to select a file from your computer

### Step 3: Analyze

Click the **"Analyze CV"** button to process your document.

### Step 4: View Results

Your extracted information will appear in organized sections:

- 👤 Contact Information
- 📋 Professional Summary
- 🛠️ Skills
- 💼 Experience
- 🎓 Education

## Technical Details

### Frontend (`app/cv-analyzer/page.tsx`)

- React component with file upload handling
- Drag-and-drop functionality
- Loading states with animated indicators
- Responsive layout (mobile and desktop)
- Error handling with user-friendly messages

### Backend (`app/api/cv-analyzer/route.ts`)

1. **File Handling**
   - Accepts PDF files via multipart/form-data
   - Validates file type and content

2. **Text Extraction**
   - Uses `pdf-parse` library to extract text from PDFs
   - Handles extraction errors gracefully

3. **AI Analysis**
   - Sends extracted text to OpenAI GPT-4
   - Requests structured JSON output
   - Parses JSON response for display

4. **Response Format**
   ```json
   {
     "success": true,
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+1-555-0000",
     "skills": ["JavaScript", "React", "Python", "Data Analysis"],
     "experience": [
       "Senior Developer at TechCorp (2020-present) - Led team of 5 developers"
     ],
     "education": ["B.S. Computer Science from State University (2018)"],
     "summary": "Experienced full-stack developer with 5+ years of expertise..."
   }
   ```

## Navigation Integration

Added to `components/Navigation.tsx`:

```typescript
{ href: "/cv-analyzer", label: "CV Analyzer", icon: "📄" }
```

The new menu item appears in the navigation bar alongside:

- Dashboard 📊
- Upload 📁
- Chat 💬
- **CV Analyzer 📄** (NEW)

## Files Created/Modified

### New Files

- `app/cv-analyzer/page.tsx` - Main CV Analyzer page component
- `app/api/cv-analyzer/route.ts` - API endpoint for CV analysis

### Modified Files

- `components/Navigation.tsx` - Added CV Analyzer menu item

## Dependencies Used

- **pdfjs-dist** - PDF text extraction (already in package.json)
- **openai** - GPT-4 API for analysis (already configured)
- **React** - UI component framework
- **Tailwind CSS** - Styling

## Usage Examples

### Example 1: Analyzing a Software Engineer CV

1. Upload CV.pdf
2. Click "Analyze CV"
3. View extracted skills like React, Node.js, TypeScript
4. See professional experience formatted clearly

### Example 2: Analyzing a Business Manager CV

1. Upload Resume.pdf
2. Click "Analyze CV"
3. View leadership skills and management experience
4. See education credentials

## Error Handling

The feature handles several error cases:

1. **No File Selected**
   - Error: "Please select a PDF file first"

2. **Invalid File Type**
   - Error: "Please upload a PDF file"

3. **PDF Text Extraction Failed**
   - Error: "Could not extract text from PDF"

4. **AI Analysis Failed**
   - Error: "Failed to analyze CV with AI"

5. **Network Error**
   - Error: "Failed to analyze CV"

## Future Enhancements

Potential improvements for future versions:

1. **Job Matching**
   - Compare CV with job postings
   - Show relevance scores

2. **CV Improvement Suggestions**
   - Identify missing sections
   - Recommend skill additions

3. **Multiple File Formats**
   - Support DOCX, TXT, HTML
   - Better formatting preservation

4. **Salary Range Estimation**
   - Based on skills and experience
   - Market comparison data

5. **Career Path Analysis**
   - Suggest next career moves
   - Skill gaps identification

6. **Interview Preparation**
   - Potential interview questions
   - Tips based on CV content

## Troubleshooting

### Upload Not Working

- Ensure file is a valid PDF
- Check file size (should be < 50MB)
- Try a different browser

### Analysis Takes Too Long

- Large PDFs may take longer
- Check internet connection
- OpenAI API may be slow

### Results Look Incorrect

- PDF may have unusual formatting
- Scanned PDFs (images) won't work
- Try copying text from CV directly

## Testing

To test the CV Analyzer:

1. **Start the app:**

   ```bash
   npm run dev
   ```

2. **Navigate to:**

   ```
   http://localhost:3000/cv-analyzer
   ```

3. **Upload a sample CV:**
   - Use a real CV (PDF format)
   - Or create a test document

4. **Verify results:**
   - Check that all sections are populated
   - Verify accuracy of extracted information

## Configuration

The CV Analyzer uses the existing OpenAI configuration:

- Model: `gpt-4-turbo`
- Temperature: `0.3` (more deterministic)
- Max tokens: `2000`

To adjust AI behavior, modify the parameters in `app/api/cv-analyzer/route.ts`:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo", // Change model if needed
  temperature: 0.3, // Lower = more consistent
  max_tokens: 2000, // Increase for longer CVs
});
```

## API Rate Limiting

The endpoint uses the same rate limits as your OpenAI API plan. For high-volume analysis:

- Implement request queuing
- Add rate limit handling
- Consider batch processing

## Privacy & Security

- PDFs are processed server-side only
- Text is sent to OpenAI (check privacy policy)
- No data is stored in the database by default
- To store CVs, add database integration

## Support

For issues or questions:

1. Check error messages (they're descriptive)
2. Verify PDF is valid and contains readable text
3. Check OpenAI API key is valid
4. Review IMPLEMENTATION_GUIDE.md for backend setup
