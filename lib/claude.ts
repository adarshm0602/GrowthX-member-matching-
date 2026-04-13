import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    'ANTHROPIC_API_KEY is not set. Claude calls will fail until it is configured.'
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

async function callWithRetry(
  params: Anthropic.Messages.MessageCreateParamsNonStreaming,
  { retries = 3, baseDelayMs = 1000 }: { retries?: number; baseDelayMs?: number } = {}
): Promise<Anthropic.Messages.Message> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await anthropic.messages.create(params);
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const type = (err as { error?: { error?: { type?: string } } })?.error
        ?.error?.type;
      const isRetryable =
        status === 429 ||
        status === 529 ||
        (status && status >= 500) ||
        type === 'overloaded_error';
      if (!isRetryable || attempt === retries) break;
      await new Promise((r) =>
        setTimeout(r, baseDelayMs * Math.pow(2, attempt))
      );
    }
  }
  throw lastErr;
}

export type MemberProfile = {
  memberId?: string;
  name: string;
  role: string;
  title?: string;
  company?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  seeking?: string[];
  offering?: string[];
};

export type MatchResult = {
  memberId: string;
  score: number;
  reasoning: string;
};

function extractText(
  content: Anthropic.Messages.Message['content']
): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

function stripCodeFences(s: string): string {
  return s
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractJsonArray(s: string): string {
  const start = s.indexOf('[');
  const end = s.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1);
  }
  return s;
}

export async function generateMatches(
  currentMember: MemberProfile,
  allOtherMembers: MemberProfile[]
): Promise<MatchResult[]> {
  const prompt = `You are a community matchmaker for GrowthX, India's premium AI community. Analyze the current member's profile and find the 5 best matches from the member pool. Consider: complementary seeking/offering pairs, shared interests, professional synergy, and role diversity. Return ONLY a valid JSON array with exactly 5 objects, each with: memberId (string), score (number 0-100), reasoning (string, 2-3 sentences explaining why this is a great match).

CURRENT MEMBER:
${JSON.stringify(currentMember, null, 2)}

MEMBER POOL:
${JSON.stringify(allOtherMembers, null, 2)}

Respond with ONLY the JSON array. No prose, no markdown fences.`;

  const response = await callWithRetry({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = extractText(response.content);
  const cleaned = extractJsonArray(stripCodeFences(raw));

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Claude did not return an array');
    }
    return parsed as MatchResult[];
  } catch (err) {
    console.error('Failed to parse Claude match response:', raw);
    throw new Error('Failed to parse match results from Claude');
  }
}

export async function generateOutreach(
  currentMember: MemberProfile,
  matchedMember: MemberProfile,
  reasoning: string
): Promise<string> {
  const prompt = `Draft a warm, personalized 3-4 sentence intro message from ${currentMember.name} to ${matchedMember.name} for a professional community platform. Mention something specific from both profiles and the match reason: ${reasoning}. Be genuine and direct. No subject line. No placeholders. Return only the message text.

SENDER PROFILE:
${JSON.stringify(currentMember, null, 2)}

RECIPIENT PROFILE:
${JSON.stringify(matchedMember, null, 2)}`;

  const response = await callWithRetry({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return extractText(response.content);
}
