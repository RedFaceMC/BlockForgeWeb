CREATE TABLE `creator_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`handle` varchar(80) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`bio` text,
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_profiles_ownerId_unique` UNIQUE(`ownerId`),
	CONSTRAINT `creator_profiles_handle_unique` UNIQUE(`handle`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`projectId` varchar(180) NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'Modrinth',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `published_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(32) NOT NULL,
	`versions` text,
	`loaders` text,
	`changelog` text,
	`downloadUrl` text,
	`screenshotKeys` text,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `published_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `published_projects_slug_unique` UNIQUE(`slug`)
);
