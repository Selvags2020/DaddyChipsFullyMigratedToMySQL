-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: daddychips
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `order_details` text NOT NULL,
  `status` enum('New','Confirmed','Processing','Shipped','Delivered','Cancelled') DEFAULT 'New',
  `remarks` text,
  `customer_mobile_number` varchar(20) DEFAULT NULL,
  `order_source` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `order_received_date_time` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `created_by` (`created_by`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'0038','Hello, I\'m interested in these products:\n\n- tets (Qty: 1) - ₹34\n- Chips1 (Qty: 1) - ₹123\n\nTotal Amount: ₹157\n\nOrder #: 0038\n\nPlease confirm availability and provide payment details.','Delivered','12221','1111111111','Desktop',1,'customer','2025-10-30 11:59:14','2025-10-30 12:10:46','2025-10-30 12:10:46'),(2,'0004','Hello, I\'m interested in these products:\n\n- tets (Qty: 1) - ₹34\n- Chips1 (Qty: 1) - ₹123\n\nTotal Amount: ₹157\n\nOrder #: 0004\n\nPlease confirm availability and provide payment details.','New','','1234567890','Desktop',1,'customer','2025-10-30 12:07:50',NULL,'2025-10-30 12:07:50'),(3,'0005','Hello, I\'m interested in these products:\n\n- Chips1 (Qty: 1) - ₹123.00\n\nTotal Amount: ₹123.00\n\nOrder #: 0005\n\nPlease confirm availability and provide payment details.','New','','1111234567','Desktop',1,'customer','2025-10-30 12:11:22',NULL,'2025-10-30 12:11:22'),(4,'0006','Hello, I\'m interested in these products:\n\n- Pearl Millet (Qty: 1) - ₹23\n- Ragi Laddu (Qty: 1) - ₹23\n- tets (Qty: 1) - ₹34\n- Chips1 (Qty: 1) - ₹123\n\nTotal Amount: ₹203\n\nOrder #: 0006\n\nPlease confirm availability and provide payment details.','New','','1234567890','Desktop',1,'customer','2025-10-30 12:17:16',NULL,'2025-10-30 12:17:16'),(5,'0007','Hello, I\'m interested in these products:\n\n- Ragi Laddu (Qty: 1) - ₹23.00\n- Pearl Millet (Qty: 1) - ₹23.00\n- tets (Qty: 1) - ₹34.00\n- Chips1 (Qty: 1) - ₹123.00\n\nTotal Amount: ₹203.00\n\nOrder #: 0007\n\nPlease confirm availability and provide payment details.','New','','1223412345','Desktop',1,'customer','2025-10-30 12:17:31',NULL,'2025-10-30 12:17:31'),(6,'0008','Hello, I\'m interested in these products:\n\n- Pearl Millet (Qty: 1) - ₹23\n- Ragi Laddu (Qty: 1) - ₹23\n\nTotal Amount: ₹46\n\nOrder #: 0008\n\nPlease confirm availability and provide payment details.','New','','1234567890','Desktop',1,'customer','2025-10-30 12:18:27',NULL,'2025-10-30 12:18:27'),(7,'0009','Hello, I\'m interested in these products:\n\n- tets (Qty: 1) - ₹34\n- Ragi Laddu (Qty: 1) - ₹23\n\nTotal Amount: ₹57\n\nOrder #: 0009\n\nPlease confirm availability and provide payment details.','New','','1234567890','Desktop',1,'customer','2025-10-30 12:18:35',NULL,'2025-10-30 12:18:35'),(8,'0010','Hello, I\'m interested in these products:\n\n- Ragi Laddu (Qty: 1) - ₹23\n\nTotal Amount: ₹23\n\nOrder #: 0010\n\nPlease confirm availability and provide payment details.','New','','1234567890','Desktop',1,'customer','2025-10-30 12:20:56',NULL,'2025-10-30 12:20:56');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 18:15:48
