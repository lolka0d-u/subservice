-- CreateTable
CREATE TABLE "CreatorToken" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "payto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorToken_pkey" PRIMARY KEY ("id")
);
