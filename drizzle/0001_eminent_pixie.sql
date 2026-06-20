CREATE TABLE `knowledge_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`outputType` enum('text','poster','scientific','creative','song') NOT NULL DEFAULT 'text',
	`contentEn` text,
	`contentDe` text,
	`contentRu` text,
	`imageUrl` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL DEFAULT 'Untitled Session',
	`language` enum('en','de','ru','all') NOT NULL DEFAULT 'all',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `cityAvatar` enum('berlin','moscow','london') DEFAULT 'london';