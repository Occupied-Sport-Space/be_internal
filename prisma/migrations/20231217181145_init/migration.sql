-- CreateTable
CREATE TABLE `SportSpace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logo` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `coords` JSON NOT NULL,
    `price` JSON NOT NULL,
    `availability` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `markerLogo` VARCHAR(191) NOT NULL,
    `maxAvailable` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
