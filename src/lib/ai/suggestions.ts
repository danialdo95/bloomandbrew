import type { CalendarEventType } from "@/lib/calendar";

export type SuggestionProvider = "DEEPSEEK" | "LOCAL";

export type SuggestionTrend = {
  label: string;
  count: number;
};

export type GeneratedSuggestion = {
  title: string;
  postIdea: string;
  hashtags: string[];
  sourceTrend: string;
  provider: SuggestionProvider;
  eventType: CalendarEventType;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type DeepSeekSuggestionPayload = {
  suggestions?: Array<{
    title?: unknown;
    postIdea?: unknown;
    hashtags?: unknown;
    sourceTrend?: unknown;
    eventType?: unknown;
  }>;
};

const MAX_SUGGESTIONS = 5;
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

export async function generateProviderAwareSuggestions(
  trends: SuggestionTrend[],
): Promise<GeneratedSuggestion[]> {
  if (process.env.DEEPSEEK_API_KEY) {
    const deepSeekSuggestions = await generateDeepSeekSuggestions(trends);

    if (deepSeekSuggestions.length) {
      return deepSeekSuggestions;
    }
  }

  return generateLocalTrendSuggestions(trends);
}

export function getSuggestionProviderLabel() {
  return process.env.DEEPSEEK_API_KEY
    ? "DeepSeek"
    : "Local trend engine";
}

function generateLocalTrendSuggestions(trends: SuggestionTrend[]) {
  const usableTrends = trends
    .filter((trend) => trend.label.trim())
    .slice(0, MAX_SUGGESTIONS);

  return usableTrends.map((trend, index) => {
    const normalizedTrend = trend.label.trim();
    const eventType = getEventType(normalizedTrend, index);
    const title = getTitle(normalizedTrend, eventType);
    const postIdea = getPostIdea(normalizedTrend, eventType, index);

    return {
      title,
      postIdea,
      hashtags: getHashtags(normalizedTrend, eventType),
      sourceTrend: normalizedTrend,
      provider: "LOCAL" as const,
      eventType,
    };
  });
}

async function generateDeepSeekSuggestions(trends: SuggestionTrend[]) {
  const usableTrends = trends
    .filter((trend) => trend.label.trim())
    .slice(0, MAX_SUGGESTIONS);

  if (!usableTrends.length) {
    return [];
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? DEFAULT_DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You generate concise social media post ideas for Bloom & Brew, a cafe and floral community. Return JSON only.",
          },
          {
            role: "user",
            content: [
              "Create 5 calendar-ready post ideas from these trends.",
              "Return this JSON shape exactly:",
              "{\"suggestions\":[{\"title\":\"\",\"postIdea\":\"\",\"hashtags\":[\"\"],\"sourceTrend\":\"\",\"eventType\":\"CONTENT\"}]}",
              "Allowed eventType values: CAFE, FLORAL, SOCIAL, PROMOTION, CONTENT.",
              `Trends: ${JSON.stringify(usableTrends)}`,
            ].join("\n"),
          },
        ],
        response_format: {
          type: "json_object",
        },
        thinking: {
          type: "disabled",
        },
        temperature: 0.7,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as DeepSeekResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return [];
    }

    return normalizeDeepSeekSuggestions(JSON.parse(content) as DeepSeekSuggestionPayload);
  } catch {
    return [];
  }
}

function normalizeDeepSeekSuggestions(payload: DeepSeekSuggestionPayload) {
  return (payload.suggestions ?? [])
    .map((suggestion, index): GeneratedSuggestion | null => {
      const sourceTrend = normalizeString(suggestion.sourceTrend)
        || `trend-${index + 1}`;
      const eventType = normalizeEventType(suggestion.eventType, index);
      const title = normalizeString(suggestion.title)
        || getTitle(sourceTrend, eventType);
      const postIdea = normalizeString(suggestion.postIdea)
        || getPostIdea(sourceTrend, eventType, index);
      const hashtags = Array.isArray(suggestion.hashtags)
        ? suggestion.hashtags.map(normalizeString).filter(Boolean)
        : [];

      if (!postIdea) {
        return null;
      }

      return {
        title,
        postIdea,
        hashtags: hashtags.length ? hashtags : getHashtags(sourceTrend, eventType),
        sourceTrend,
        provider: "DEEPSEEK",
        eventType,
      };
    })
    .filter((suggestion): suggestion is GeneratedSuggestion => Boolean(suggestion))
    .slice(0, MAX_SUGGESTIONS);
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEventType(value: unknown, index: number): CalendarEventType {
  if (
    value === "CAFE"
    || value === "FLORAL"
    || value === "SOCIAL"
    || value === "PROMOTION"
    || value === "CONTENT"
  ) {
    return value;
  }

  return getEventType("", index);
}

function getEventType(trend: string, index: number): CalendarEventType {
  const lowerTrend = trend.toLowerCase();

  if (/coffee|latte|matcha|espresso|cafe|brew/.test(lowerTrend)) {
    return "CAFE";
  }

  if (/flower|floral|bouquet|petal|rose|tulip/.test(lowerTrend)) {
    return "FLORAL";
  }

  if (/sale|drop|launch|promo|special/.test(lowerTrend)) {
    return "PROMOTION";
  }

  return index % 3 === 0 ? "SOCIAL" : "CONTENT";
}

function getTitle(trend: string, eventType: CalendarEventType) {
  const label = toTitleCase(trend);

  if (eventType === "CAFE") {
    return `${label} cafe pairing`;
  }

  if (eventType === "FLORAL") {
    return `${label} bouquet idea`;
  }

  if (eventType === "PROMOTION") {
    return `${label} community spotlight`;
  }

  if (eventType === "SOCIAL") {
    return `${label} community question`;
  }

  return `${label} post idea`;
}

function getPostIdea(trend: string, eventType: CalendarEventType, index: number) {
  const label = trend.toLowerCase();
  const templates = {
    CAFE: [
      `Ask the community to share a ${label} drink and the cafe corner they would photograph with it.`,
      `Invite creators to compare their favorite ${label} order with a floral pairing.`,
    ],
    FLORAL: [
      `Ask florists to share a ${label} arrangement and the cafe drink that matches its color palette.`,
      `Invite users to post a ${label} detail they noticed during a cafe visit.`,
    ],
    PROMOTION: [
      `Create a short post announcing a ${label} moment and ask followers what they want included next.`,
      `Invite the community to vote on the next ${label} bundle or cafe-floral pairing.`,
    ],
    SOCIAL: [
      `Start a discussion asking followers how ${label} fits into their ideal weekend cafe plan.`,
      `Ask users to share one photo, memory, or recommendation connected to ${label}.`,
    ],
    CONTENT: [
      `Turn ${label} into a simple post idea: one cafe detail, one floral detail, and one question for followers.`,
      `Ask creators to share a quick ${label} inspiration post with a caption and three matching hashtags.`,
    ],
  } satisfies Record<CalendarEventType, string[]>;

  const options = templates[eventType];
  return options[index % options.length];
}

function getHashtags(trend: string, eventType: CalendarEventType) {
  const cleanTrend = trend.replace(/[^a-z0-9]/gi, "");
  const typeTag = eventType === "CAFE"
    ? "#CafeCulture"
    : eventType === "FLORAL"
      ? "#FloralInspo"
      : eventType === "PROMOTION"
        ? "#BloomDrop"
        : "#CommunityPost";

  return [
    cleanTrend ? `#${cleanTrend}` : "#BloomAndBrew",
    "#BloomAndBrew",
    typeTag,
  ];
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
