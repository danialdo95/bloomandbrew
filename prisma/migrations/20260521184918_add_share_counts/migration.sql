-- CreateTable
CREATE TABLE "PostShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalShare" (
    "id" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostShare_postId_idx" ON "PostShare"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostShare_postId_userIdentifier_key" ON "PostShare"("postId", "userIdentifier");

-- CreateIndex
CREATE INDEX "ExternalShare_externalPostId_idx" ON "ExternalShare"("externalPostId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalShare_externalPostId_userIdentifier_key" ON "ExternalShare"("externalPostId", "userIdentifier");

-- AddForeignKey
ALTER TABLE "PostShare" ADD CONSTRAINT "PostShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalShare" ADD CONSTRAINT "ExternalShare_externalPostId_fkey" FOREIGN KEY ("externalPostId") REFERENCES "ExternalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
