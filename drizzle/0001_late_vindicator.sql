CREATE TABLE `creator_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(32) NOT NULL,
	`versions` text,
	`loaders` text,
	`changelog` text,
	`downloadUrl` text,
	`screenshotKeys` text,
	`status` enum('draft','submitted') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_drafts_id` PRIMARY KEY(`id`)
);
