# AI Service Module

Optional AI-enhanced receipt parsing using OpenAI.

## Overview

The AI module provides an optional enhancement layer for receipt parsing. It uses OpenAI's GPT models to parse OCR text into structured receipt data with higher accuracy than regex-based parsing.

## Key Features

- **Optional & Pluggable**: Can be enabled/disabled via environment variable
- **Backward Compatible**: Falls back to regex parser if AI is disabled or returns low confidence
- **No Hallucination**: Returns `null` for low-confidence results instead of guessing
- **Traceability**: Logs prompt version, model, and OCR input length for debugging
- **Isolated**: Completely separate from existing OCR logic

## Architecture

```
Receipt Upload
  ↓
GCP Vision OCR (unchanged)
  ↓
OCR Text
  ↓
┌─────────────────────────┐
│  AI Service (optional)  │
│  - Check if enabled     │
│  - Parse with OpenAI    │
│  - Validate confidence  │
└─────────────────────────┘
  ↓
If AI success (high/medium confidence)
  → Use AI result
Else
  → Fall back to regex parser (existing)
  ↓
Save to database (unchanged)
```

## Configuration

Add to `.env`:

```env
# Enable AI-enhanced parsing
OPENAI_ENABLED=true

# OpenAI API Key (required if enabled)
OPENAI_API_KEY=sk-...

# Model to use (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Temperature for generation (default: 0.1)
# Lower = more deterministic, higher = more creative
OPENAI_TEMPERATURE=0.1
```

## Usage

The AI service is automatically injected into the ReceiptService. No code changes needed - just set environment variables.

### With AI Disabled (default)

```
OPENAI_ENABLED=false
```

Behavior: Uses regex parser only (existing logic)

### With AI Enabled

```
OPENAI_ENABLED=true
OPENAI_API_KEY=sk-...
```

Behavior:
1. Tries AI parsing first
2. If AI returns high/medium confidence → uses AI result
3. If AI returns low confidence or fails → falls back to regex parser
4. Logs which method was used

## Prompt Management

Prompts are externalized in [`prompts/receipt-parser.prompt.ts`](./prompts/receipt-parser.prompt.ts).

**Prompt Version**: 1.0.0

Changes to prompts should:
1. Increment the version number
2. Document what changed and why
3. Test with real receipt samples

## API Response

The AI service returns:

```typescript
{
  result: {
    merchantName: string | null,
    totalAmount: number | null,
    date: string | null,
    lineItems: Array<{description: string, amount: number}>,
    confidence: 'high' | 'medium' | 'low'
  } | null,
  metadata: {
    promptVersion: string,
    model: string,
    temperature: number,
    ocrTextLength: number,
    timestamp: Date
  }
}
```

## Confidence Levels

- **high**: All required fields extracted, clear patterns found
- **medium**: Most fields extracted, some ambiguity
- **low**: Few fields extracted, high uncertainty → **result discarded**

## Logging

The AI service logs:
- Service initialization (enabled/disabled)
- Each parsing attempt with metadata
- Success/failure with confidence level
- Fallback to regex parser when needed

Example logs:
```
[LOG] AI Service initialized with model: gpt-4o-mini, temperature: 0.1
[LOG] AI parsing receipt (length: 542, model: gpt-4o-mini, version: 1.0.0)
[LOG] AI parsing successful (confidence: high, merchant: true, total: true, date: true)
[LOG] Receipt processed successfully (id: abc-123, method: ai, merchant: Walmart, total: 45.67)
```

## Safety Features

1. **No Hallucination**: Returns `null` instead of guessing
2. **Validation**: Checks result has at least one required field
3. **Fallback**: Always has regex parser as backup
4. **Isolation**: AI failure doesn't break receipt processing
5. **No Silent Changes**: Logs which method was used

## Testing

### Test with AI Disabled
```bash
OPENAI_ENABLED=false npm run start:dev
```
Expected: Uses regex parser, logs "AI Service is disabled"

### Test with AI Enabled (no key)
```bash
OPENAI_ENABLED=true npm run start:dev
```
Expected: Warns "OPENAI_API_KEY is not configured", disables AI

### Test with AI Enabled (with key)
```bash
OPENAI_ENABLED=true OPENAI_API_KEY=sk-... npm run start:dev
```
Expected: Uses AI parsing, logs model and version

## Cost Considerations

- **Model**: gpt-4o-mini is recommended (cheap, fast)
- **Token Usage**: ~200-500 tokens per receipt (OCR text + prompt + response)
- **Estimated Cost**: $0.0001-0.0003 per receipt with gpt-4o-mini

## Troubleshooting

### AI always falls back to regex
- Check API key is valid
- Check `OPENAI_ENABLED=true`
- Check logs for error messages

### Low confidence results
- Try adjusting `OPENAI_TEMPERATURE` (lower = more consistent)
- Update prompt to be more specific
- Check OCR quality (garbage in, garbage out)

### High costs
- Switch to `gpt-4o-mini` (cheapest)
- Set `OPENAI_ENABLED=false` for non-critical environments
- Add rate limiting if needed

## Future Enhancements

- [ ] Add support for custom prompts via config
- [ ] Cache AI results for identical OCR text
- [ ] Add confidence threshold configuration
- [ ] Support other AI providers (Anthropic, Gemini)
- [ ] Add A/B testing framework (AI vs regex accuracy)
