-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "community" TEXT NOT NULL DEFAULT 'Bloom & Brew',
ADD COLUMN     "filter" TEXT NOT NULL DEFAULT 'Natural';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'BB',
ADD COLUMN     "location" TEXT;
