DROP DATABASE `koolndur`;
CREATE DATABASE `koolndur`;
USE `koolndur`;

-- CREATE ALL TABLES

CREATE TABLE `users` (
    `uuid` CHAR(36) CHARACTER SET latin1 NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` CHAR(60) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `userType` TINYINT(1) NOT NULL,
    PRIMARY KEY (`uuid`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`)
) Engine=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessioncookie` (
    `user` CHAR(36) CHARACTER SET latin1 NOT NULL,
    `token` CHAR(36) CHARACTER SET latin1 NOT NULL,
    issued INT(11) NOT NULL,
    PRIMARY KEY (`token`)
) Engine=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `calendars` (
  `calendarID` INT(4) NOT NULL AUTO_INCREMENT,
  `ownerID` CHAR(36) NOT NULL,
  PRIMARY KEY (`calendarID`),
  UNIQUE INDEX `calendarID_UNIQUE` (`calendarID` ASC),
  CONSTRAINT `CUserID`
    FOREIGN KEY (ownerID)
    REFERENCES `users` (uuid)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE `canViewEdit` (
  `calendarID` INT(4) NOT NULL,
  `userID` CHAR(36) NOT NULL,
  `canEdit` TINYINT(1) NOT NULL,
  PRIMARY KEY (`calendarID`, `userID`),
  CONSTRAINT `CVECalID`
	FOREIGN KEY (`calendarID`)
    REFERENCES `calendars` (`calendarID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CVEUserID`
	FOREIGN KEY (`userID`)
    REFERENCES `users` (`uuid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE `events` (
  `eventID` INT(4) NOT NULL AUTO_INCREMENT,
  `calendarID` INT(4) NOT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `eventName` VARCHAR(100) NOT NULL,
  `eventDescriptionPath` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`eventID`),
  CONSTRAINT `ECalID`
	FOREIGN KEY (`calendarID`)
    REFERENCES `calendars` (`calendarID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

-- INSERT ALL THE TEST DATA

INSERT INTO `users` (`uuid`, `username`, `password`, `email`, `userType`) VALUES
    (
        'e8494d9d-0ece-44ff-9ee4-531f82909b64',
        'admin',
        '$2b$10$xJfSYMelZj0RhPAUdNF6qO9e6wEy6rRaAfFuGAF/NbXILLYTpM29m', -- backdoor
        'admin@localhost',
        0
    );
