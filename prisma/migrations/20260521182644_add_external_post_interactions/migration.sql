-- CreateTable
CREATE TABLE "ExternalPost" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalUrl" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalComment" (
    "id" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL DEFAULT 'BB',
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalLike" (
    "id" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSavedPost" (
    "id" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalSavedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalPost_source_idx" ON "ExternalPost"("source");

-- CreateIndex
CREATE INDEX "ExternalPost_createdAt_idx" ON "ExternalPost"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalComment_externalPostId_idx" ON "ExternalComment"("externalPostId");

-- CreateIndex
CREATE INDEX "ExternalLike_externalPostId_idx" ON "ExternalLike"("externalPostId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalLike_externalPostId_userIdentifier_key" ON "ExternalLike"("externalPostId", "userIdentifier");

-- CreateIndex
CREATE INDEX "ExternalSavedPost_externalPostId_idx" ON "ExternalSavedPost"("externalPostId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSavedPost_externalPostId_userIdentifier_key" ON "ExternalSavedPost"("externalPostId", "userIdentifier");

-- AddForeignKey
ALTER TABLE "ExternalComment" ADD CONSTRAINT "ExternalComment_externalPostId_fkey" FOREIGN KEY ("externalPostId") REFERENCES "ExternalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLike" ADD CONSTRAINT "ExternalLike_externalPostId_fkey" FOREIGN KEY ("externalPostId") REFERENCES "ExternalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSavedPost" ADD CONSTRAINT "ExternalSavedPost_externalPostId_fkey" FOREIGN KEY ("externalPostId") REFERENCES "ExternalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
