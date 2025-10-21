# Question Generation System Guide

## Overview

The Question Builder Bot is an automated system for generating educational questions using AI. It processes categories in batches, tracks progress, and handles failures gracefully.

## Architecture

```
┌─────────────────┐
│  Admin UI       │  Trigger batches, monitor progress
│  /admin/seeds   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoints  │  Create batches, retry failed jobs
│  /api/admin/... │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Worker Script  │  Process batches with concurrency control
│  gen:questions  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GPT API Client │  Call AI service to generate questions
│  aiClient.ts    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database       │  Save questions, track progress
│  Prisma/Postgres│
└─────────────────┘
```

## Database Models

### GenerationBatch
Represents a batch of question generation jobs.

**Fields:**
- `id` - Unique identifier
- `status` - PENDING | RUNNING | DONE | FAILED | PAUSED
- `language` - ISO language code (e.g., "en", "cs")
- `targetCount` - Number of categories to process
- `processed` - Categories processed so far
- `succeeded` - Successfully completed jobs
- `failed` - Failed jobs
- `startedAt` - When processing began
- `finishedAt` - When processing completed
- `note` - Optional notes

### GenerationJob
Individual job to generate questions for one category.

**Fields:**
- `id` - Unique identifier
- `status` - PENDING | RUNNING | DONE | FAILED
- `sssCategoryId` - Target category
- `batchId` - Parent batch
- `language` - Target language
- `error` - Error message if failed
- `aiLogId` - Link to AI response log
- `startedAt` / `finishedAt` - Timestamps

### AIResponseLog
Logs all AI API calls for auditing and debugging.

**Fields:**
- `id` - Unique identifier
- `prompt` - Input sent to GPT
- `response` - Raw response from GPT
- `tokensIn` - Input tokens used
- `tokensOut` - Output tokens used
- `model` - AI model used
- `createdAt` - Timestamp

## Configuration

### Environment Variables

```bash
# Required
GPT_GEN_URL=https://api.openai.com/v1/chat/completions
GPT_GEN_KEY=sk_your_api_key_here
ADMIN_TOKEN=your_random_secret_token

# Optional (with defaults)
NEXT_PUBLIC_GEN_MAX_CONCURRENCY=2        # Concurrent API calls
NEXT_PUBLIC_Q_PER_CAT_MIN=5              # Min questions per category
NEXT_PUBLIC_Q_PER_CAT_MAX=12             # Max questions per category
NEXT_PUBLIC_GEN_LANGS=en                 # Languages (comma-separated)
NEXT_PUBLIC_GEN_DRY_RUN=false            # Test mode (don't save)
NEXT_PUBLIC_GEN_BATCH_SIZE=50            # Batch size
NEXT_PUBLIC_GEN_MAX_RETRIES=3            # Max retries
NEXT_PUBLIC_GEN_RETRY_DELAY=1000         # Retry delay (ms)
```

### Configuration File

All settings are centralized in `apps/web/lib/config/generator.ts`:

```typescript
export const GEN_CONFIG = {
  MAX_CONCURRENCY: 2,           // API calls in parallel
  QUESTIONS_PER_CATEGORY_MIN: 5,
  QUESTIONS_PER_CATEGORY_MAX: 12,
  LANGUAGES: ['en'],            // Target languages
  GPT_URL: '',                  // AI endpoint
  GPT_KEY: '',                  // AI API key
  ADMIN_TOKEN: '',              // Admin auth
  DRY_RUN: false,              // Test without saving
};
```

## Usage

### 1. Setup Environment

```bash
# Copy and edit environment file
cp env.example .env.local

# Set required variables
GPT_GEN_URL=https://api.openai.com/v1/chat/completions
GPT_GEN_KEY=sk-your-actual-key
ADMIN_TOKEN=$(openssl rand -base64 32)
```

### 2. Run Database Migration

```bash
# Push schema changes
pnpm db:push

# Or create migration
cd packages/db
pnpm exec prisma migrate dev --name question-generation-system
```

### 3. Create a Batch (via Admin UI)

1. Navigate to `/admin/seeds`
2. Select language
3. Click "Create Batch"
4. Note the batch ID

### 4. Run the Worker

```bash
# From project root
pnpm gen:questions

# Or from apps/web
cd apps/web
pnpm gen:questions
```

**Output:**
```
🤖 Question Generation Worker Starting...

⚙️  Configuration:
   Languages: en
   Concurrency: 2
   Questions per category: 5-12
   GPT URL: ✅ Configured
   Dry run: No

🚀 Starting batch generation for language: en
📊 Found 150 leaf categories to process
📦 Created batch: clx123abc
✅ Created 150 jobs
⚙️  Processing 150 jobs with concurrency: 2

  🔧 [1/150] Generating for: Sports > Soccer > Rules
    ✅ Saved 8 questions
    ⏱️  Completed in 1234ms
  🔧 [2/150] Generating for: Sports > Soccer > Equipment
    ✅ Saved 10 questions
    ⏱️  Completed in 1456ms
  ...

✨ Batch clx123abc complete:
   Processed: 150
   Succeeded: 148
   Failed: 2
   Status: DONE
```

### 5. Monitor Progress

- Check admin UI at `/admin/seeds`
- Auto-refreshes every 5 seconds when batches are running
- Shows progress bars and statistics

### 6. Retry Failed Jobs

If some jobs fail:

1. In admin UI, click "Retry Failed" on the batch
2. Run `pnpm gen:questions` again
3. Worker will process only PENDING jobs

## API Endpoints

### GET /api/admin/generate
List recent batches with statistics.

**Response:**
```json
{
  "success": true,
  "batches": [
    {
      "id": "clx123",
      "status": "DONE",
      "language": "en",
      "targetCount": 150,
      "processed": 150,
      "succeeded": 148,
      "failed": 2,
      ...
    }
  ]
}
```

### POST /api/admin/generate
Create a new batch.

**Headers:**
```
x-admin-token: your_admin_token
```

**Request:**
```json
{
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "clx123abc",
  "message": "Batch created. Run: pnpm gen:questions"
}
```

### POST /api/admin/generate/retry
Retry failed jobs in a batch.

**Headers:**
```
x-admin-token: your_admin_token
```

**Request:**
```json
{
  "batchId": "clx123abc"
}
```

**Response:**
```json
{
  "success": true,
  "retriedCount": 5,
  "message": "Reset 5 failed jobs to PENDING. Run: pnpm gen:questions"
}
```

## GPT API Integration

### Request Format

The system sends this to your GPT endpoint:

```json
{
  "system": "You are a careful educational content generator.",
  "instruction": "Generate concise, high-quality starter questions...",
  "input": {
    "language": "en",
    "categoryName": "Soccer Rules",
    "categoryPath": ["Sports", "Soccer"],
    "minCount": 5,
    "maxCount": 12
  }
}
```

### Expected Response

The API should return:

```json
{
  "questions": [
    "What are the basic rules of soccer?",
    "How many players are on each team?",
    "What is offside in soccer?",
    ...
  ],
  "meta": {},
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200
  },
  "model": "gpt-4"
}
```

### Alternative Formats Supported

The system tolerates various response formats:

```json
// Nested format
{ "output": { "questions": [...] } }

// OpenAI format
{ "choices": [{ "message": { "content": {...} } }] }

// Markdown wrapped
```json
{
  "questions": [...]
}
\```
```

## Multi-Language Support

### Adding Languages

1. Update environment variable:
```bash
NEXT_PUBLIC_GEN_LANGS=en,cs,de
```

2. Create batches for each language:
```bash
# The worker processes all configured languages
pnpm gen:questions
```

3. Questions are saved with `language` field
4. Frontend can filter by user's language preference

### Language Codes

Use ISO 639-1 codes:
- `en` - English
- `cs` - Czech
- `de` - German
- `es` - Spanish
- `fr` - French

## Error Handling

### Job Failures

**Common causes:**
- GPT API rate limit
- Invalid API key
- Network timeout
- Malformed response

**Recovery:**
1. Check logs in console
2. Fix configuration if needed
3. Click "Retry Failed" in admin UI
4. Re-run worker

### Idempotency

The system is designed to be idempotent:
- Re-running won't duplicate questions
- Only PENDING jobs are processed
- DONE jobs are skipped
- FAILED jobs can be reset to PENDING

### Dry Run Mode

Test without saving to database:

```bash
NEXT_PUBLIC_GEN_DRY_RUN=true pnpm gen:questions
```

Output shows what would be saved:
```
⚠️  DRY RUN: Would have saved 8 questions
```

## Performance Tuning

### Concurrency

**Low concurrency (1-2):**
- Slower overall
- Lower API costs
- Safer for rate limits

**Higher concurrency (3-5):**
- Faster processing
- Higher API costs
- Risk of rate limiting

**Recommendation:** Start with 2, increase if stable.

### Questions per Category

**Fewer questions (5-8):**
- Faster generation
- Lower token costs
- May need more rounds later

**More questions (10-15):**
- Better category coverage
- Higher token costs
- Longer processing time

**Recommendation:** 5-12 is a good balance.

## Monitoring

### Admin Dashboard

Access at `/admin/seeds`:

- **Batch list** - Recent batches with status
- **Progress bars** - Visual progress indicators
- **Statistics** - Success/fail counts
- **Auto-refresh** - Updates every 5 seconds
- **Retry button** - Reset failed jobs

### Console Logs

Worker provides detailed logging:

```
🚀 Starting batch...
📊 Found X categories
⚙️  Processing with concurrency: Y
🔧 [1/150] Generating for: Category Name
  ✅ Saved 8 questions
  ⏱️  Completed in 1234ms
❌ Job failed: Error message
✨ Batch complete: processed=150 succeeded=148 failed=2
```

## Security

### Admin Authentication

Simple token-based auth for MVP:

**Headers required:**
```
x-admin-token: your_admin_token_value
```

**Frontend:**
```typescript
fetch('/api/admin/generate', {
  headers: {
    'x-admin-token': GEN_CONFIG.ADMIN_TOKEN
  }
})
```

**Backend:**
```typescript
function auth(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') === GEN_CONFIG.ADMIN_TOKEN;
}
```

### Future Enhancements

For production, consider:
- NextAuth admin role check
- API key per-user
- Rate limiting on admin endpoints
- Audit logging

## Troubleshooting

### "GPT_GEN_URL not configured"

**Solution:** Set `GPT_GEN_URL` in environment

### "Unauthorized" on API calls

**Solution:** Ensure `ADMIN_TOKEN` matches in env and request headers

### Worker doesn't process jobs

**Symptoms:** Batches stay PENDING

**Solutions:**
1. Check if worker script is running
2. Verify database connection
3. Check GPT API configuration
4. Review worker console output

### Questions not appearing

**Symptoms:** Jobs succeed but no questions in database

**Solutions:**
1. Check `DRY_RUN` is false
2. Verify Question table exists
3. Check foreign key constraints
4. Review aiResponseLog for actual responses

### Rate limiting from GPT API

**Symptoms:** Many jobs fail with rate limit errors

**Solutions:**
1. Reduce `MAX_CONCURRENCY` to 1
2. Add delays between requests
3. Upgrade API plan
4. Process in smaller batches

## Best Practices

### 1. Start Small

```bash
# Test with dry run first
NEXT_PUBLIC_GEN_DRY_RUN=true pnpm gen:questions

# Then run for real on a small batch
NEXT_PUBLIC_GEN_LANGS=en
NEXT_PUBLIC_Q_PER_CAT_MAX=5
```

### 2. Monitor Costs

- Check AI response logs for token usage
- Calculate costs before large batches
- Use cheaper models for testing

### 3. Review Quality

- Spot-check generated questions
- Adjust prompts if quality is low
- Use approval workflow before showing to users

### 4. Gradual Rollout

1. Generate for one language
2. Review quality
3. Adjust configuration
4. Generate for remaining languages

## Future Enhancements

### Planned Features

- ✅ Basic generation (v0.5.4)
- 🔄 Cron job automation
- 🔄 Quality scoring
- 🔄 Duplicate detection
- 🔄 Manual review workflow
- 🔄 Question versioning
- 🔄 Category-specific prompts
- 🔄 Multiple AI providers

### Scaling Considerations

For 4,300+ categories:

1. **Batch processing** - Process 50-100 at a time
2. **Time estimates** - At 2/sec, 4300 takes ~35 minutes
3. **Cost estimates** - ~10-20 tokens per question
4. **Error rate** - Expect 1-5% failures
5. **Retry strategy** - Auto-retry transient failures

## API Reference

### Generate Questions (AI Client)

```typescript
import { generateQuestions } from '@/lib/aiClient';

const result = await generateQuestions({
  categoryName: 'Soccer Rules',
  categoryPath: ['Sports', 'Soccer'],
  language: 'en',
  minCount: 5,
  maxCount: 12,
});

// result.questions: string[]
// result.meta: any
// result.tokensIn: number
// result.tokensOut: number
```

### Create Batch (Programmatically)

```typescript
const response = await fetch('/api/admin/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': process.env.ADMIN_TOKEN,
  },
  body: JSON.stringify({ language: 'en' }),
});

const { batchId } = await response.json();
```

### Check Batch Status

```typescript
const response = await fetch('/api/admin/generate');
const { batches } = await response.json();

batches.forEach(batch => {
  console.log(`${batch.id}: ${batch.status} (${batch.processed}/${batch.targetCount})`);
});
```

## Examples

### Example: Generate Questions for English

```bash
# 1. Configure
export NEXT_PUBLIC_GEN_LANGS=en
export NEXT_PUBLIC_GEN_MAX_CONCURRENCY=2
export GPT_GEN_URL=https://api.openai.com/v1/chat/completions
export GPT_GEN_KEY=sk-your-key

# 2. Create batch via UI or API
curl -X POST http://localhost:3000/api/admin/generate \
  -H "x-admin-token: your_token" \
  -H "Content-Type: application/json" \
  -d '{"language":"en"}'

# 3. Run worker
pnpm gen:questions
```

### Example: Multi-Language Generation

```bash
# Configure multiple languages
export NEXT_PUBLIC_GEN_LANGS=en,cs,de

# Worker will process all languages
pnpm gen:questions
```

### Example: Retry Failed Jobs

```bash
# Via API
curl -X POST http://localhost:3000/api/admin/generate/retry \
  -H "x-admin-token: your_token" \
  -H "Content-Type: application/json" \
  -d '{"batchId":"clx123"}'

# Then re-run worker
pnpm gen:questions
```

## Support

For issues or questions:

1. Check console logs
2. Review AI response logs in database
3. Test GPT API connection separately
4. Check configuration with `validateGeneratorConfig()`
5. Use dry run mode to debug without costs

## Migration from Old System

If you had a previous generation system:

1. **Backup existing questions**
2. **Run migration** to add new tables
3. **Test with dry run**
4. **Process incrementally** by language
5. **Merge or replace** old questions as needed

