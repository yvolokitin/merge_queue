DROP TABLE IF EXISTS `merge_queue`;
CREATE TABLE `merge_queue` (
    `ID` bigint(20) NOT NULL auto_increment,
    `DELIVERY_ID` bigint(20) NOT NULL DEFAULT 0,
    `QUEUE` varchar(64) COLLATE `utf8_general_ci` NOT NULL,
    `BRANCH` varchar(128) COLLATE `utf8_general_ci` NOT NULL,
    `EMAIL` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `JIRA` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `REVIEW` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `DESCRIPTION` varchar(1024) COLLATE `utf8_general_ci` NOT NULL,
    `DATE` datetime NOT NULL,
    `ORDER` int(11) NOT NULL,
    PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARACTER SET `utf8` COLLATE=utf8_general_ci AUTO_INCREMENT=1;

DROP TABLE IF EXISTS `ka_queues`;
CREATE TABLE `ka_queues` (
    `ID` bigint(11) NOT NULL auto_increment,
    `NAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `DESCRIPTION` varchar(512) COLLATE `utf8_general_ci` NOT NULL,
    `TYPE` enum('FREE', 'MANAGED') NOT NULL DEFAULT 'MANAGED',
    `STATUS` enum('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `OWNER` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `SUBSCRIBERS` varchar(1024) DEFAULT NULL,
    `APPROVALS` varchar(1024) DEFAULT NULL,
    `DATE` datetime NOT NULL,
    `ORDER` int(11) NOT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE KEY `NAME_IX` (`NAME`)
) ENGINE=MyISAM DEFAULT CHARACTER SET `utf8` COLLATE=utf8_general_ci AUTO_INCREMENT=13;

INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`)  VALUES ('KA_trunk', 'KA_trunk Merge Queue', 'FREE', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 1);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Ftr3.0_maint', 'KA_Ftr3.0_maint Merge Queue', 'MANAGED', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 2);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Elm2.0_maint', 'KA_Elm2.0_maint Merge Queue', 'MANAGED', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 3);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Elm1.0_maint', 'KA_Elm1.0_maint Merge Queue', 'MANAGED', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 4);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Alder4.0_maint', 'KA_Alder4.0_maint Merge Queue', 'MANAGED', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 5);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_AlderF2.1M_maint', 'KA_AlderF2.1M_maint Merge Queue', 'MANAGED', 'ACTIVE', 'Yura.Volokitin@arris.com', NOW(), 6);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Alder1.3_maint', 'KA_Alder1.3_maint', 'MANAGED', 'DISABLED', 'Bill.CarpenterIII@arris.com', NOW(), 7);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Alder2.0_maint', 'KA_Alder2.0_maint', 'MANAGED', 'DISABLED', 'Bill.CarpenterIII@arris.com', NOW(), 8);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_Alder2.1_maint', 'KA_Alder2.1_maint', 'MANAGED', 'DISABLED', 'Bill.CarpenterIII@arris.com', NOW(), 9);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_AlderF2.0_release', 'KA_AlderF2.0_release', 'MANAGED', 'DISABLED', 'Bill.CarpenterIII@arris.com', NOW(), 10);
INSERT INTO ka_queues (`NAME`, `DESCRIPTION`, `TYPE`, `STATUS`, `OWNER`, `DATE`, `ORDER`) VALUES ('KA_AlderF2.1M_release', 'KA_AlderF2.1M_release', 'MANAGED', 'DISABLED', 'Bill.CarpenterIII@arris.com', NOW(), 11);


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `ID` bigint(11) NOT NULL auto_increment,
    `ARRIS_ID` varchar(32) COLLATE `utf8_general_ci` NOT NULL,
    `NAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `SURNAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `EMAIL` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `TITLE` varchar(64) COLLATE `utf8_general_ci` NOT NULL,
    `EMPLOYEEID` varchar(32) COLLATE `utf8_general_ci` NOT NULL,
    `DEPARTMENT` varchar(64) COLLATE `utf8_general_ci` NOT NULL,
    `PAGE` varchar(64) COLLATE `utf8_general_ci` NOT NULL DEFAULT 'kaqueue',
    `QUEUE` varchar(64) COLLATE `utf8_general_ci` NOT NULL DEFAULT 'KA_trunk',
    `DLS_ARCHI` enum('yes', 'no') NOT NULL DEFAULT 'no',
    `DLS_AGE` varchar(32) COLLATE `utf8_general_ci` NOT NULL DEFAULT 'three',
    `DLS_QUEUE` varchar(64) COLLATE `utf8_general_ci` NOT NULL DEFAULT 'all',
    `TARGET_ID` int(20) NOT NULL DEFAULT 0,
    `TARGET_NAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL DEFAULT 'none',
    `QUEUE_STATUS` enum('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `OWN_TARGET_CREATE` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_RENAME` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_ARCHIVE` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_REMOVE` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_CREATE` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_RENAME` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_ARCHIVE` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_REMOVE` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_ADD_ROW` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_EDIT_ROW` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_APPROVE_ROW` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_QUEUE_ROW` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_COPY_ROW` boolean NOT NULL DEFAULT 0,
    `OWN_TARGET_DELETE_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_ADD_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_EDIT_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_APPROVE_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_QUEUE_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_COPY_ROW` boolean NOT NULL DEFAULT 0,
    `FOREIGN_TARGET_DELETE_ROW` boolean NOT NULL DEFAULT 0,
    `TYPE` enum('USER', 'ADMIN', 'GOD') NOT NULL DEFAULT 'USER',
    `DATE` datetime NOT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE KEY `ARRIS_ID_IX` (`ARRIS_ID`)
) ENGINE=MyISAM DEFAULT CHARACTER SET `utf8` COLLATE=utf8_general_ci AUTO_INCREMENT=1;

UPDATE `users` SET `TYPE`='ADMIN';
INSERT INTO `users` (`ARRIS_ID`, `NAME`, `SURNAME`, `EMAIL`, `TITLE`, `EMPLOYEEID`, `DEPARTMENT`, `TARGET_ID`, `TARGET_NAME`, `TYPE`, `DATE`) VALUES ('yvolokitin', 'Yura', 'Volokitin', 'Yura.Volokitin@arrisi.com', 'Engineer', 'EmpId', 'Department code', '0', 'none', 'USER', NOW());


DROP TABLE IF EXISTS `targets`;
CREATE TABLE `targets` (
    `ID` bigint(20) NOT NULL auto_increment,
    `NAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `CREATOR` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `ARCHIVED` boolean NOT NULL DEFAULT 0,
    `QUEUE` varchar(64) COLLATE `utf8_general_ci` NOT NULL,
    `SUBSCRIBERS` varchar(1024) COLLATE `utf8_general_ci` NOT NULL,
    `DATE` datetime NOT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE KEY `NAME_IX` (`NAME`)
) ENGINE=MyISAM DEFAULT CHARACTER SET `utf8` COLLATE=utf8_general_ci AUTO_INCREMENT=1313;


DROP TABLE IF EXISTS `deliveries`;
CREATE TABLE `deliveries` (
    `ID` bigint(20) NOT NULL auto_increment,
    `TARGET_ID` bigint(20) NOT NULL,
    `TARGET_NAME` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `APPROVED_BY` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `JIRA` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `DESCRIPTION` varchar(1024) COLLATE `utf8_general_ci` NOT NULL,
    `REVIEW` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `JIRAP` varchar(128) COLLATE `utf8_general_ci` NOT NULL,
    `CUSTOMERP` varchar(128) COLLATE `utf8_general_ci` NOT NULL,
    `REGRESSION` boolean NOT NULL,
    `EMAIL` varchar(256) COLLATE `utf8_general_ci` NOT NULL,
    `BRANCH` varchar(128) COLLATE `utf8_general_ci` NOT NULL,
    `FA` varchar(128) COLLATE `utf8_general_ci` NOT NULL,
    `ADDITIONAL` varchar(1024) COLLATE `utf8_general_ci` NOT NULL,
    `COMMENTS` varchar(1024) COLLATE `utf8_general_ci` NOT NULL,
    `DATE` datetime NOT NULL,
    PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARACTER SET `utf8` COLLATE=utf8_general_ci AUTO_INCREMENT=13;



DELETE FROM test.delivery_list;
INSERT INTO test.delivery_list SELECT * from build_system.delivery_list;

DELETE FROM test.target_list;
INSERT INTO test.target_list SELECT * from build_system.target_list;
