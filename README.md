# ATS Optimizer Pro

**100% Local, Zero-Cost Resume Analysis Tool**

A powerful, transparent ATS (Applicant Tracking System) resume analyzer that helps you optimize your resume for job applications. All processing happens locally—no paid APIs, no data sent to external servers.

## Features

- **📄 PDF & DOCX Support**: Upload resumes in PDF or Word format
- **🎯 Transparent Scoring**: Clear 0-100 score with detailed breakdown
- **🔍 5-Component Analysis**:
  - Keyword Match (40%)
  - Semantic Similarity (25%)
  - Required Skills Coverage (15%)
  - Keyword Distribution Quality (10%)
  - ATS Compatibility Checks (10%)
- **💡 Smart Suggestions**: Rule-based improvement recommendations
- **📊 Visual Analytics**: Circular score meter, keyword heatmaps, detailed tabs
- **🚀 Fast Performance**: < 2 seconds per analysis (no network calls)
- **🔒 Privacy-Focused**: Everything runs locally in your browser

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **pdf-parse** (PDF extraction)
- **mammoth** (DOCX parsing)
- **TF-IDF** (local semantic similarity)


## How It Works

### 1. Upload Resume
- Drag & drop or click to upload PDF/DOCX
- Automatic text extraction and section detection

### 2. Paste Job Description
- Copy the full job posting
- Include requirements, qualifications, and responsibilities

### 3. Analyze
- Click "Analyze Resume"
- Get instant results with detailed scoring

### 4. Review & Improve
- Check missing keywords
- Review matched terms
- Follow actionable suggestions
- See required skills gaps
- Verify ATS compatibility

## Scoring Algorithm

**Final Score = Weighted Average of 5 Components**

Optimized to match industry standards (Jobscan-style) - encouraging but accurate!

1. **Keyword Match (50%)**:
   - Extracts top 40 keywords from job description
   - Uses unigrams, bigrams, and trigrams
   - Removes stopwords for accuracy
   - **Score boost curve**: Rewards even moderate matches generously
   - 60%+ keyword match = 75+ score

2. **Semantic Similarity (20%)**:
   - TF-IDF vectorization of both documents
   - Cosine similarity calculation
   - **Boosted scoring**: Rewards contextual alignment
   - 100% local (no embeddings API needed)

3. **Required Skills Coverage (15%)**:
   - Detects "required", "must have", "minimum qualifications" sections
   - Extracts and matches technical skills
   - Includes skill variations (e.g., "JS" = "JavaScript")
   - **Generous scoring**: 60%+ coverage = good score

4. **Keyword Distribution Quality (10%)**:
   - Checks keyword density per section
   - Penalizes excessive stuffing (>20% density)
   - Rewards even distribution across sections
   - **Score floor**: Minimum 70/100

5. **ATS Heuristics (5%)**:
   - Detects tables (problematic for ATS)
   - Checks for multi-column layouts
   - Verifies standard section headers
   - Validates appropriate resume length
   - **Reduced impact**: These are suggestions, not dealbreakers
   - **Score floor**: Minimum 75/100

### Why This Approach?

- ✅ **Realistic scores**: Matches what you'd see on Jobscan
- ✅ **Encouraging**: Rewards good resumes appropriately
- ✅ **Still accurate**: Identifies real areas for improvement
- ✅ **Transparent**: You can see exactly how each component is scored

## Project Structure

```
ats-optimizer-pro/
├── app/
│   ├── api/
│   │   ├── parse-resume/    # PDF/DOCX upload handler
│   │   ├── analyze/          # Main scoring algorithm
│   │   └── suggest-improvements/  # Suggestions generator
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main UI
│   └── globals.css           # Styles
├── components/
│   ├── ResumeUploader.tsx    # File upload
│   ├── JobDescriptionInput.tsx
│   ├── ScoreMeter.tsx        # Circular score visualization
│   ├── AnalysisTabs.tsx      # Tabbed results
│   ├── KeywordList.tsx
│   └── SuggestionsPanel.tsx
├── lib/
│   ├── analysis/
│   │   ├── keywords.ts       # Keyword extraction
│   │   ├── ngrams.ts         # N-gram generation
│   │   ├── tfidf.ts          # TF-IDF & cosine similarity
│   │   ├── skills.ts         # Required skills detection
│   │   ├── scoring.ts        # Main algorithm
│   │   └── suggestions.ts    # Recommendations engine
│   ├── parsing/
│   │   ├── pdf.ts            # PDF text extraction
│   │   └── docx.ts           # DOCX text extraction
│   └── utils/
│       ├── text.ts           # Text preprocessing
│       └── stopwords.ts      # Stopwords list
└── types/
    └── index.ts              # TypeScript definitions
```

## Why Local-Only?

- **Zero Cost**: No API fees, ever
- **Privacy**: Your resume never leaves your computer
- **Speed**: No network latency
- **Offline**: Works without internet (after initial load)
- **Transparent**: Full control over the algorithm

## Limitations

- No AI-powered rewriting (use suggestions as guidance)
- Semantic similarity is TF-IDF-based (not LLM embeddings)
- Best results with detailed job descriptions (100+ words)

## Contributing

This is a personal tool, but feel free to fork and customize for your needs!

## License

MIT License - feel free to use and modify

---

**Made with ❤️ for job seekers**

*No tracking • No analytics • No data collection*
