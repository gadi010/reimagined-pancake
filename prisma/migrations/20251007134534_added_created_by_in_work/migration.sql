/*
  Warnings:

  - Added the required column `createById` to the `Work` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `work` ADD COLUMN `createById` INTEGER NOT NULL,
    MODIFY `progress` INTEGER NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `Work` ADD CONSTRAINT `Work_createById_fkey` FOREIGN KEY (`createById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
