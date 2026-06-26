# 💰 Cost Analysis - Chat & Embedding Models

## Overview

This document provides a detailed cost analysis for the EKA (Enterprise Knowledge Assistant) project, specifically for the OpenAI API usage (Chat Model and Embedding Model).

---

## 1. Models Used

### Chat Model
- **Model**: `gpt-4-turbo`
- **Location**: [services/rag.ts](../services/rag.ts) - `generateAnswer()` function
- **Parameters**:
  - `temperature`: 0.7
  - `max_tokens`: 1000

### Embedding Model
- **Model**: `text-embedding-3-small` (default, configurable via `EMBEDDING_MODEL` env var)
- **Location**: [services/pdf.ts](../services/pdf.ts) - `generateEmbedding()` and `generateEmbeddingsBatch()` functions
- **Batch Processing**: 100 texts per request for efficiency

---

## 2. System Architecture & Flow

### Upload PDF Flow
```
1. Extract text from PDF (pdfjs-dist)
   ↓
2. Split text into chunks (1000 chars, 200 chars overlap)
   ↓
3. Generate embeddings for each chunk (batch processing)
   ↓
4. Store in PostgreSQL with pgvector extension
```

### Chat/Q&A Flow
```
1. User submits question
   ↓
2. Generate embedding for question (text-embedding-3-small)
   ↓
3. Semantic search in database (pgvector similarity)
   ↓
4. Retrieve top 5 most relevant chunks
   ↓
5. Build context from chunks
   ↓
6. Send to GPT-4-turbo with system prompt + context + question
   ↓
7. Return answer + source citations
```

---

## 3. OpenAI Pricing (Current Rates)

### Per Token Pricing

| Model | Input | Output |
|-------|-------|--------|
| **GPT-4-turbo** | $0.01 / 1K tokens | $0.03 / 1K tokens |
| **text-embedding-3-small** | $0.02 / 1M tokens | N/A |

*Note: Prices as of June 2026. Check [OpenAI pricing page](https://openai.com/pricing) for latest rates.*

---

## 4. Cost Per Operation

### 4.1 Embedding Generation

**Single Question Embedding:**
```
Tokens: ~15 tokens (average question)
Cost: 15 × ($0.02 / 1,000,000) = $0.0000003
```

**Embedding Batch (PDF with 10,000 words):**
```
Chunks created: ~15 chunks
Total tokens: ~6,000 tokens
Cost: 6,000 × ($0.02 / 1,000,000) = $0.00012
```

### 4.2 PDF Upload Operation

**Per PDF (Average 10,000 words):**

| Component | Calculation |
|-----------|-------------|
| Text chunks | ~15 chunks |
| Total embedding tokens | ~6,000 tokens |
| Embedding cost | $0.00012 |
| **Total cost per PDF** | **$0.00012** |

### 4.3 Chat Query Operation

**Per Single Chat Query:**

| Component | Tokens | Cost |
|-----------|--------|------|
| Question embedding | 15 | $0.0000003 |
| Context (5 chunks × 400 tokens) | 2,000 | $0.02 (input) |
| GPT-4-turbo input prompt | ~100 | Included above |
| GPT-4-turbo output (average) | ~500 | $0.015 (output) |
| **TOTAL** | **~2,600** | **$0.0350** |

---

## 5. Monthly Cost Scenarios

### 📍 Scenario A: Startup (Light Usage)

```
Monthly Activity:
├─ PDFs uploaded: 5
├─ Chat queries: 20
└─ Users: 5-10

Calculation:
├─ Embedding (5 PDFs × 6,000 tokens): 30,000 tokens → $0.0006
├─ Chat queries (20 × $0.035): → $0.70
└─ TOTAL: $0.70 / month
```

### 📊 Scenario B: Medium Business

```
Monthly Activity:
├─ PDFs uploaded: 50
├─ Chat queries: 200
└─ Users: 20-50

Calculation:
├─ Embedding (50 PDFs × 6,000 tokens): 300,000 tokens → $0.006
├─ Chat queries (200 × $0.035): → $7.00
└─ TOTAL: $7.01 / month
```

### 🚀 Scenario C: Enterprise

```
Monthly Activity:
├─ PDFs uploaded: 500
├─ Chat queries: 2,000
└─ Users: 100+

Calculation:
├─ Embedding (500 PDFs × 6,000 tokens): 3,000,000 tokens → $0.06
├─ Chat queries (2,000 × $0.035): → $70.00
└─ TOTAL: $70.06 / month
```

### 📈 Scenario D: High-Volume Enterprise

```
Monthly Activity:
├─ PDFs uploaded: 2,000
├─ Chat queries: 10,000
└─ Users: 500+

Calculation:
├─ Embedding (2,000 PDFs × 6,000 tokens): 12,000,000 tokens → $0.24
├─ Chat queries (10,000 × $0.035): → $350.00
└─ TOTAL: $350.24 / month
```

---

## 6. Cost Breakdown & Distribution

### Cost Driver Analysis

```
Cost Distribution per Chat Query:
├─ Embedding generation: 0.0009% ($0.0000003)
├─ GPT-4-turbo input: 57.1% ($0.020)
├─ GPT-4-turbo output: 42.8% ($0.015)
└─ Total: 100% ($0.035)
```

**Key Finding:** 99.9% of chat query cost comes from GPT-4-turbo, while embedding is negligible.

### Cost Drivers (Ranked)

1. **Chat Query Volume** (70-80% of total cost)
2. **PDF Upload Volume** (20-30% of total cost)
3. **Average Output Tokens** (affects cost per query)
4. **Model Selection** (different models = different pricing)

---

## 7. Cost Optimization Strategies

### ✅ Already Implemented

| Strategy | Implementation | Benefit |
|----------|---|---------|
| Use cheapest embedding model | `text-embedding-3-small` | ~80% cheaper than large variant |
| Batch embedding requests | Max 100 texts per request | Reduced API calls |
| Limit context size | Top 5 chunks (~2,000 tokens) | Efficient context window usage |
| Single embedding per question | Generate once, reuse | Minimal embedding cost |

### 🔄 Recommended Optimizations

#### 1. Query Caching
```
If user asks same question twice:
- First query: $0.035
- Cached result: $0.00
Savings: ~99% for repeated queries
```

#### 2. Use GPT-3.5-turbo for Simple Queries
```
GPT-3.5-turbo pricing:
├─ Input: $0.0005 / 1K tokens
├─ Output: $0.0015 / 1K tokens
└─ Cost per query: ~$0.002 (vs $0.035 for GPT-4)

Savings: 94% per query
```

#### 3. Implement Query Filtering
- Skip embedding generation for non-text queries
- Validate queries before processing
- Estimated savings: 5-10%

#### 4. Batch Processing for Off-Peak
- Process multiple PDFs in batch mode
- Reduced API overhead
- Estimated savings: 2-5%

#### 5. Local Caching of Common Questions
```
Example FAQ:
Q: "What is this document about?"
Q: "Who is the author?"
Q: "What are key points?"

Cache first 100 FAQ answers
Savings: 50-70% on FAQ queries
```

---

## 8. Cost Comparison: Model Options

### Chat Models

| Model | Input Cost | Output Cost | Quality | Recommendation |
|-------|-----------|-----------|---------|---|
| **gpt-4-turbo** (current) | $0.01/1K | $0.03/1K | Highest | Complex questions, accuracy critical |
| **gpt-4** | $0.03/1K | $0.06/1K | Highest | When gpt-4-turbo unavailable |
| **gpt-3.5-turbo** | $0.0005/1K | $0.0015/1K | Good | Simple Q&A, cost-sensitive |

### Embedding Models

| Model | Cost | Use Case |
|-------|------|----------|
| **text-embedding-3-small** (current) | $0.02/1M tokens | ✅ Default (best value) |
| text-embedding-3-large | $0.13/1M tokens | Higher precision needed |
| text-embedding-ada-002 | $0.0001/1K tokens | Legacy (not recommended) |

---

## 9. Budget Planning Guide

### Small Team (5-20 users)

```
Assumed Monthly Usage:
├─ PDFs: 20-50
├─ Queries: 100-300
└─ Recommended Budget: $10-15/month

Cost Breakdown:
├─ Embedding: $0.01
├─ Chat: $3.50-10.50
└─ Buffer (20%): $2-3
```

### Growing Business (20-100 users)

```
Assumed Monthly Usage:
├─ PDFs: 50-200
├─ Queries: 500-2,000
└─ Recommended Budget: $25-75/month

Cost Breakdown:
├─ Embedding: $0.05-0.20
├─ Chat: $17.50-70
└─ Buffer (20%): $4-14
```

### Enterprise (100+ users)

```
Assumed Monthly Usage:
├─ PDFs: 500+
├─ Queries: 5,000+
└─ Recommended Budget: $200+/month

Cost Breakdown:
├─ Embedding: $0.24+
├─ Chat: $175+
├─ Buffer (20%): $35+
└─ Negotiated rates: May apply
```

---

## 10. Monitoring & Tracking

### How to Track Costs

1. **OpenAI Dashboard**: Check [platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)
2. **Set Budget Limits**: Prevent unexpected charges
3. **Monitor Token Usage**: 
   - Per API endpoint
   - Per model
   - Time-based trends

### Recommended Monitoring

```
Daily tracking:
- Total API calls
- Tokens used (input + output)
- Cost per operation type

Weekly review:
- Cost trends
- Query patterns
- Optimization opportunities
```

---

## 11. Cost Reduction Checklist

- [ ] Monitor monthly usage trends
- [ ] Implement query caching for FAQ
- [ ] Test GPT-3.5-turbo for simple queries
- [ ] Review and prune unused PDFs
- [ ] Optimize chunk size (reduce context)
- [ ] Set OpenAI API budget limits
- [ ] Cache frequently used embeddings
- [ ] Batch process PDFs during off-peak hours
- [ ] Review context window usage
- [ ] Consider enterprise pricing at scale

---

## 12. Summary

| Metric | Value |
|--------|-------|
| **Cost per chat query** | $0.035 |
| **Cost per PDF upload (10KB)** | $0.00012 |
| **Cheapest scenario (5 PDFs, 20 queries/month)** | $0.70 |
| **Enterprise scenario (500 PDFs, 2K queries/month)** | $70.06 |
| **Cost driver** | Chat volume (70-80%) |
| **Optimization potential** | 50-90% with caching & model switching |

---

## 13. References

- [OpenAI Pricing](https://openai.com/pricing)
- [GPT-4 Turbo Documentation](https://platform.openai.com/docs/models/gpt-4-turbo)
- [Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Usage Limits & Billing](https://platform.openai.com/account/billing/limits)

---

**Last Updated**: June 2026  
**Project**: EKA (Enterprise Knowledge Assistant)  
**Version**: 1.0.0
