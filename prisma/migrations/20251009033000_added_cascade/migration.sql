-- DropForeignKey
ALTER TABLE `attachment` DROP FOREIGN KEY `Attachment_workId_fkey`;

-- DropForeignKey
ALTER TABLE `workassignee` DROP FOREIGN KEY `WorkAssignee_workId_fkey`;

-- DropIndex
DROP INDEX `Attachment_workId_fkey` ON `attachment`;

-- DropIndex
DROP INDEX `WorkAssignee_workId_fkey` ON `workassignee`;

-- AddForeignKey
ALTER TABLE `WorkAssignee` ADD CONSTRAINT `WorkAssignee_workId_fkey` FOREIGN KEY (`workId`) REFERENCES `Work`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_workId_fkey` FOREIGN KEY (`workId`) REFERENCES `Work`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
