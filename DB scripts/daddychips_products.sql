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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` varchar(50) NOT NULL,
  `firebase_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category_id` varchar(50) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `standard_price` decimal(10,2) DEFAULT NULL,
  `offer_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `product_image` text,
  `tags` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('prod1761667917280','-Ocf_mPC7IcehVeHDzXj','Chips1','dfgerg','chips','Chips',1212.00,123.00,2322,'http://localhost/DaddyChipsAPI/uploads/690323e382235_1761813475.png','[\"chips\"]',1,'Admin','2025-10-28 10:41:57','2025-10-30 08:37:55'),('prod1761752786','','tets','fghtrh','fgfhrthjryjtry-u6ryu-5ryu4','fgfhrthjryjtry u6ryu 5ryu4',3434.00,34.00,45,'http://localhost/DaddyChipsAPI/uploads/690236d253f51_1761752786.png','[\"4545b454\"]',1,'Admin','2025-10-29 11:16:26','2025-10-29 15:46:56'),('prod1761826496','','Ragi Laddu','df','fgfhrthjryjtry-u6ryu-5ryu4','snacks',23.00,23.00,22,'http://localhost/DaddyChipsAPI/uploads/690356c0a3f8e_1761826496.png','[\"23\"]',1,'Admin','2025-10-30 07:44:56','2025-10-30 12:14:56'),('prod1761826509','','Pearl Millet','df','fgfhrthjryjtry-u6ryu-5ryu4','snacks',23.00,23.00,21,'http://localhost/DaddyChipsAPI/uploads/690356cd3d742_1761826509.png','[\"df\"]',1,'Admin','2025-10-30 07:45:09','2025-10-30 12:15:09');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 18:15:47
