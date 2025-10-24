-- AlterTable
ALTER TABLE `project` ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `githubRepoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `GithubRepo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repoId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `private` BOOLEAN NOT NULL,
    `htmlUrl` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `ownerLogin` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `webhook` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GithubRepo_repoId_key`(`repoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_githubRepoId_fkey` FOREIGN KEY (`githubRepoId`) REFERENCES `GithubRepo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
