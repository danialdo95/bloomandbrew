-- Persist provider-aware post idea suggestions for admin review and calendar reuse.
CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "postIdea" TEXT NOT NULL,
    "hashtags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "sourceTrend" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'LOCAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "eventType" TEXT NOT NULL DEFAULT 'CONTENT',
    "calendarEventId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiSuggestion_status_idx" ON "AiSuggestion"("status");
CREATE INDEX "AiSuggestion_provider_idx" ON "AiSuggestion"("provider");
CREATE INDEX "AiSuggestion_sourceTrend_idx" ON "AiSuggestion"("sourceTrend");
CREATE INDEX "AiSuggestion_createdById_idx" ON "AiSuggestion"("createdById");

ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
