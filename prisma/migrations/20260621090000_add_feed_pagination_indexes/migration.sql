-- Support stable cursor pagination for public and following feeds.
CREATE INDEX "Post_status_createdAt_id_idx" ON "Post"("status", "createdAt", "id");
CREATE INDEX "Post_status_authorId_createdAt_id_idx" ON "Post"("status", "authorId", "createdAt", "id");
