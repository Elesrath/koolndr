DROP DATABASE `koolndur`;
CREATE DATABASE `koolndur`;
USE `koolndur`;

-- CREATE ALL TABLES

CREATE TABLE `users` (
    `uuid` CHAR(36) CHARACTER SET latin1 NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` CHAR(60) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
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

-- INSERT ALL THE TEST DATA

INSERT INTO `users` (`uuid`, `username`, `password`, `email`) VALUES
    (
        'e8494d9d-0ece-44ff-9ee4-531f82909b64',
        'admin',
        '$2b$10$xJfSYMelZj0RhPAUdNF6qO9e6wEy6rRaAfFuGAF/NbXILLYTpM29m', -- backdoor
        'admin@localhost'
    );
