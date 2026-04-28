-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2026 at 12:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dental_clinic`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` varchar(20) NOT NULL,
  `patient_id` varchar(20) NOT NULL,
  `patient_name` varchar(201) NOT NULL,
  `doctor_id` varchar(20) NOT NULL,
  `doctor_name` varchar(201) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `treatment_type` varchar(150) NOT NULL,
  `status` enum('scheduled','completed','cancelled','confirmed') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `patient_name`, `doctor_id`, `doctor_name`, `date`, `time`, `treatment_type`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('a1', 'p1', 'Nour Ali', 'd1', 'Sami Khoury', '2026-04-25', '09:00:00', 'Cleaning & Check-up', 'confirmed', 'First visit', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a10', 'p10', 'Yousef Ghattas', 'd3', 'Adam Saleh', '2026-04-28', '09:00:00', 'Crown Consultation', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a11', 'p11', 'Amal Habib', 'd2', 'Lina Nassar', '2026-04-28', '09:45:00', 'Root Canal', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a12', 'p12', 'Fadi Nakhleh', 'd1', 'Sami Khoury', '2026-04-28', '14:00:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a13', 'p13', 'Huda Saba', 'd3', 'Adam Saleh', '2026-04-29', '10:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a14', 'p14', 'Tarek Boulos', 'd2', 'Lina Nassar', '2026-04-29', '11:30:00', 'Extraction', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a15', 'p15', 'Mira Shahin', 'd1', 'Sami Khoury', '2026-04-29', '12:15:00', 'Whitening', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a16', 'p1', 'Nour Ali', 'd2', 'Lina Nassar', '2026-04-15', '09:00:00', 'Cleaning & Check-up', 'completed', 'Completed successfully', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a17', 'p2', 'Sara Kanaan', 'd1', 'Sami Khoury', '2026-04-14', '10:30:00', 'Filling', 'completed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a18', 'p3', 'Omar Hanna', 'd3', 'Adam Saleh', '2026-04-13', '11:00:00', 'Root Canal', 'completed', 'Stage 1 done', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a19', 'p4', 'Maya Issa', 'd2', 'Lina Nassar', '2026-04-12', '13:00:00', 'Whitening', 'completed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a2', 'p2', 'Sara Kanaan', 'd2', 'Lina Nassar', '2026-04-25', '10:00:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a20', 'p5', 'Leen Jaber', 'd1', 'Sami Khoury', '2026-04-11', '09:30:00', 'Cleaning & Check-up', 'cancelled', 'Patient requested cancellation', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a21', 'p6', 'Karim Salem', 'd3', 'Adam Saleh', '2026-04-10', '12:00:00', 'Extraction', 'completed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a22', 'p7', 'Rana Toma', 'd2', 'Lina Nassar', '2026-04-09', '15:00:00', 'Braces Consultation', 'completed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a3', 'p3', 'Omar Hanna', 'd1', 'Sami Khoury', '2026-04-25', '11:00:00', 'Root Canal', 'scheduled', 'Tooth pain', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a4', 'p4', 'Maya Issa', 'd3', 'Adam Saleh', '2026-04-26', '09:30:00', 'Whitening', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a5', 'p5', 'Leen Jaber', 'd2', 'Lina Nassar', '2026-04-26', '12:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a6', 'p6', 'Karim Salem', 'd1', 'Sami Khoury', '2026-04-26', '13:00:00', 'Extraction', 'scheduled', 'Wisdom tooth', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a7', 'p7', 'Rana Toma', 'd3', 'Adam Saleh', '2026-04-27', '09:00:00', 'Braces Consultation', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a8', 'p8', 'Jad Mansour', 'd2', 'Lina Nassar', '2026-04-27', '10:30:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('a9', 'p9', 'Dana Farah', 'd1', 'Sami Khoury', '2026-04-27', '11:15:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(20) NOT NULL,
  `patient_id` varchar(20) NOT NULL,
  `patient_name` varchar(201) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('paid','pending','overdue') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `patient_id`, `patient_name`, `date`, `amount`, `status`, `created_at`, `updated_at`) VALUES
('inv1', 'p1', 'Nour Ali', '2026-04-15', 220.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv10', 'p11', 'Amal Habib', '2026-03-26', 280.00, 'overdue', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv11', 'p12', 'Fadi Nakhleh', '2026-03-25', 150.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv12', 'p13', 'Huda Saba', '2026-03-24', 400.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv2', 'p2', 'Sara Kanaan', '2026-04-14', 350.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv3', 'p3', 'Omar Hanna', '2026-04-13', 900.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv4', 'p4', 'Maya Issa', '2026-04-12', 600.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv5', 'p6', 'Karim Salem', '2026-04-10', 750.00, 'overdue', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv6', 'p7', 'Rana Toma', '2026-04-09', 180.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv7', 'p8', 'Jad Mansour', '2026-04-02', 320.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv8', 'p9', 'Dana Farah', '2026-04-01', 200.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv9', 'p10', 'Yousef Ghattas', '2026-03-28', 450.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` varchar(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `description`, `cost`, `created_at`) VALUES
(1, 'inv1', 'Routine cleaning and oral exam', 220.00, '2026-04-23 10:17:38'),
(2, 'inv2', 'Composite filling on upper molar', 300.00, '2026-04-23 10:17:38'),
(3, 'inv2', 'Materials fee', 50.00, '2026-04-23 10:17:38'),
(4, 'inv3', 'Root canal treatment - session 1', 800.00, '2026-04-23 10:17:38'),
(5, 'inv3', 'X-ray and supplies', 100.00, '2026-04-23 10:17:38'),
(6, 'inv4', 'Teeth whitening session', 600.00, '2026-04-23 10:17:38'),
(7, 'inv5', 'Wisdom tooth extraction', 700.00, '2026-04-23 10:17:38'),
(8, 'inv5', 'Medication and post-op supplies', 50.00, '2026-04-23 10:17:38'),
(9, 'inv6', 'Orthodontic consultation', 180.00, '2026-04-23 10:17:38'),
(10, 'inv7', 'Dental filling', 320.00, '2026-04-23 10:17:38'),
(11, 'inv8', 'Cleaning and plaque removal', 200.00, '2026-04-23 10:17:38'),
(12, 'inv9', 'Crown consultation and prep', 450.00, '2026-04-23 10:17:38'),
(13, 'inv10', 'Emergency pain treatment', 220.00, '2026-04-23 10:17:38'),
(14, 'inv10', 'Medication plan', 60.00, '2026-04-23 10:17:38'),
(15, 'inv11', 'Quick check-up', 150.00, '2026-04-23 10:17:38'),
(16, 'inv12', 'Dental restoration', 400.00, '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` varchar(20) NOT NULL,
  `patient_id` varchar(20) NOT NULL,
  `allergies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`allergies`)),
  `conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`conditions`)),
  `medications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`medications`)),
  `blood_type` varchar(5) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `allergies`, `conditions`, `medications`, `blood_type`, `notes`, `created_at`, `updated_at`) VALUES
('mr1', 'p1', '[\"Penicillin\"]', '[\"Asthma\"]', '[\"Ventolin\"]', 'A+', 'Patient experiences mild anxiety during procedures', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr2', 'p2', '[\"None\"]', '[\"Diabetes\"]', '[\"Metformin\"]', 'O+', 'Monitor sugar levels before long procedures', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr3', 'p3', '[\"Latex\"]', '[\"Hypertension\"]', '[\"Lisinopril\"]', 'B+', 'Avoid latex gloves', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr4', 'p4', '[\"Ibuprofen\"]', '[\"None\"]', '[\"None\"]', 'AB+', 'Sensitive gums', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr5', 'p6', '[\"None\"]', '[\"Heart disease\"]', '[\"Aspirin\"]', 'O-', 'Requires careful bleeding assessment', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr6', 'p8', '[\"Dust\"]', '[\"None\"]', '[\"None\"]', 'A-', 'No major issues', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr7', 'p10', '[\"Amoxicillin\"]', '[\"Migraine\"]', '[\"Sumatriptan\"]', 'B-', 'Frequent headaches reported', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('mr8', 'p11', '[\"None\"]', '[\"Pregnancy\"]', '[\"Prenatal vitamins\"]', 'AB-', 'Avoid unnecessary X-rays', '2026-04-23 10:17:38', '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

CREATE TABLE `treatments` (
  `id` varchar(20) NOT NULL,
  `patient_id` varchar(20) NOT NULL,
  `doctor_id` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `materials` text DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `appointment_id` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `treatments`
--

INSERT INTO `treatments` (`id`, `patient_id`, `doctor_id`, `date`, `description`, `materials`, `cost`, `appointment_id`, `created_at`, `updated_at`) VALUES
('t1', 'p1', 'd2', '2026-04-15', 'Routine cleaning and oral exam', 'Scaler, fluoride paste', 220.00, 'a16', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t10', 'p11', 'd2', '2026-03-26', 'Emergency pain treatment and medication plan', 'Temporary dressing, prescription', 280.00, NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t2', 'p2', 'd1', '2026-04-14', 'Composite filling on upper molar', 'Composite resin, bonding agent', 350.00, 'a17', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t3', 'p3', 'd3', '2026-04-13', 'Root canal treatment - first session', 'Files, irrigation solution, temporary seal', 900.00, 'a18', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t4', 'p4', 'd2', '2026-04-12', 'Teeth whitening session', 'Whitening gel, LED activation', 600.00, 'a19', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t5', 'p6', 'd3', '2026-04-10', 'Wisdom tooth extraction', 'Local anesthesia, extraction kit', 750.00, 'a21', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t6', 'p7', 'd2', '2026-04-09', 'Orthodontic consultation', 'X-ray review, treatment plan', 180.00, 'a22', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t7', 'p8', 'd2', '2026-04-02', 'Dental filling on lower premolar', 'Composite resin', 320.00, NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t8', 'p9', 'd1', '2026-04-01', 'Routine cleaning and plaque removal', 'Scaler, polish paste', 200.00, NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('t9', 'p10', 'd3', '2026-03-28', 'Crown consultation and prep', 'Impression material', 450.00, NULL, '2026-04-23 10:17:38', '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('patient','doctor','manager') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `first_name`, `last_name`, `phone`, `birth_date`, `id_number`, `avatar`, `created_at`, `updated_at`) VALUES
('d1', 'dr.sami@clinic.com', '$2b$10$doctor1hashedpassword', 'doctor', 'Sami', 'Haddad', '050-9100001', '1978-03-15', '910000001', 'https://example.com/avatar/d1.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('d2', 'dr.lina@clinic.com', '$2b$10$doctor2hashedpassword', 'doctor', 'Lina', 'Nassar', '050-9100002', '1985-08-20', '910000002', 'https://example.com/avatar/d2.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('d3', 'dr.adam@clinic.com', '$2b$10$doctor3hashedpassword', 'doctor', 'Adam', 'Saleh', '050-9100003', '1981-01-10', '910000003', 'https://example.com/avatar/d3.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('m1', 'manager@clinic.com', '$2b$10$managerhashedpassword', 'manager', 'Loay', 'Khoury', '050-9000001', '1982-06-11', '900000001', 'https://example.com/avatar/m1.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p1', 'nour.ali@example.com', '$2b$10$patient1hashedpassword', 'patient', 'Nour', 'Ali', '050-1000001', '1999-04-03', '100000001', 'https://example.com/avatar/p1.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p10', 'yousef.ghattas@example.com', '$2b$10$patient10hashedpassword', 'patient', 'Yousef', 'Ghattas', '050-1000010', '1984-04-28', '100000010', 'https://example.com/avatar/p10.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p11', 'amal.habib@example.com', '$2b$10$patient11hashedpassword', 'patient', 'Amal', 'Habib', '050-1000011', '1992-06-06', '100000011', 'https://example.com/avatar/p11.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p12', 'fadi.nakhleh@example.com', '$2b$10$patient12hashedpassword', 'patient', 'Fadi', 'Nakhleh', '050-1000012', '1989-01-19', '100000012', 'https://example.com/avatar/p12.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p13', 'huda.saba@example.com', '$2b$10$patient13hashedpassword', 'patient', 'Huda', 'Saba', '050-1000013', '1996-07-01', '100000013', 'https://example.com/avatar/p13.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p14', 'tarek.boulos@example.com', '$2b$10$patient14hashedpassword', 'patient', 'Tarek', 'Boulos', '050-1000014', '1987-08-09', '100000014', 'https://example.com/avatar/p14.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p15', 'mira.shahin@example.com', '$2b$10$patient15hashedpassword', 'patient', 'Mira', 'Shahin', '050-1000015', '2002-02-25', '100000015', 'https://example.com/avatar/p15.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p2', 'sara.kanaan@example.com', '$2b$10$patient2hashedpassword', 'patient', 'Sara', 'Kanaan', '050-1000002', '1995-12-12', '100000002', 'https://example.com/avatar/p2.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p3', 'omar.hanna@example.com', '$2b$10$patient3hashedpassword', 'patient', 'Omar', 'Hanna', '050-1000003', '1988-07-22', '100000003', 'https://example.com/avatar/p3.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p4', 'maya.issa@example.com', '$2b$10$patient4hashedpassword', 'patient', 'Maya', 'Issa', '050-1000004', '2001-10-30', '100000004', 'https://example.com/avatar/p4.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p5', 'leen.jaber@example.com', '$2b$10$patient5hashedpassword', 'patient', 'Leen', 'Jaber', '050-1000005', '1993-02-17', '100000005', 'https://example.com/avatar/p5.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p6', 'karim.salem@example.com', '$2b$10$patient6hashedpassword', 'patient', 'Karim', 'Salem', '050-1000006', '1986-09-05', '100000006', 'https://example.com/avatar/p6.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p7', 'rana.toma@example.com', '$2b$10$patient7hashedpassword', 'patient', 'Rana', 'Toma', '050-1000007', '1997-03-08', '100000007', 'https://example.com/avatar/p7.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p8', 'jad.mansour@example.com', '$2b$10$patient8hashedpassword', 'patient', 'Jad', 'Mansour', '050-1000008', '1990-11-26', '100000008', 'https://example.com/avatar/p8.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('p9', 'dana.farah@example.com', '$2b$10$patient9hashedpassword', 'patient', 'Dana', 'Farah', '050-1000009', '2000-05-14', '100000009', 'https://example.com/avatar/p9.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_doctor_schedule`
-- (See below for the actual view)
--
CREATE TABLE `v_doctor_schedule` (
`doctor_id` varchar(20)
,`doctor_name` varchar(201)
,`appointment_id` varchar(20)
,`date` date
,`time` time
,`patient_id` varchar(20)
,`patient_name` varchar(201)
,`treatment_type` varchar(150)
,`status` enum('scheduled','completed','cancelled','confirmed')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_invoice_item_totals`
-- (See below for the actual view)
--
CREATE TABLE `v_invoice_item_totals` (
`invoice_id` varchar(20)
,`patient_id` varchar(20)
,`patient_name` varchar(201)
,`invoice_amount` decimal(10,2)
,`items_total` decimal(32,2)
,`difference` decimal(33,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_open_invoices`
-- (See below for the actual view)
--
CREATE TABLE `v_open_invoices` (
`id` varchar(20)
,`patient_id` varchar(20)
,`patient_name` varchar(201)
,`date` date
,`amount` decimal(10,2)
,`status` enum('paid','pending','overdue')
,`days_since_issue` int(7)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_patient_visit_history`
-- (See below for the actual view)
--
CREATE TABLE `v_patient_visit_history` (
`patient_id` varchar(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`treatment_id` varchar(20)
,`treatment_date` date
,`description` text
,`materials` text
,`cost` decimal(10,2)
,`doctor_id` varchar(20)
,`doctor_full_name` varchar(201)
,`appointment_id` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_upcoming_appointments`
-- (See below for the actual view)
--
CREATE TABLE `v_upcoming_appointments` (
`id` varchar(20)
,`date` date
,`time` time
,`status` enum('scheduled','completed','cancelled','confirmed')
,`treatment_type` varchar(150)
,`notes` text
,`patient_id` varchar(20)
,`patient_name` varchar(201)
,`doctor_id` varchar(20)
,`doctor_name` varchar(201)
);

-- --------------------------------------------------------

--
-- Structure for view `v_doctor_schedule`
--
DROP TABLE IF EXISTS `v_doctor_schedule`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_doctor_schedule`  AS SELECT `a`.`doctor_id` AS `doctor_id`, `a`.`doctor_name` AS `doctor_name`, `a`.`id` AS `appointment_id`, `a`.`date` AS `date`, `a`.`time` AS `time`, `a`.`patient_id` AS `patient_id`, `a`.`patient_name` AS `patient_name`, `a`.`treatment_type` AS `treatment_type`, `a`.`status` AS `status` FROM `appointments` AS `a` ORDER BY `a`.`doctor_id` ASC, `a`.`date` ASC, `a`.`time` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_invoice_item_totals`
--
DROP TABLE IF EXISTS `v_invoice_item_totals`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_invoice_item_totals`  AS SELECT `i`.`id` AS `invoice_id`, `i`.`patient_id` AS `patient_id`, `i`.`patient_name` AS `patient_name`, `i`.`amount` AS `invoice_amount`, coalesce(sum(`ii`.`cost`),0) AS `items_total`, `i`.`amount`- coalesce(sum(`ii`.`cost`),0) AS `difference` FROM (`invoices` `i` left join `invoice_items` `ii` on(`ii`.`invoice_id` = `i`.`id`)) GROUP BY `i`.`id`, `i`.`patient_id`, `i`.`patient_name`, `i`.`amount` ;

-- --------------------------------------------------------

--
-- Structure for view `v_open_invoices`
--
DROP TABLE IF EXISTS `v_open_invoices`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_open_invoices`  AS SELECT `i`.`id` AS `id`, `i`.`patient_id` AS `patient_id`, `i`.`patient_name` AS `patient_name`, `i`.`date` AS `date`, `i`.`amount` AS `amount`, `i`.`status` AS `status`, to_days(curdate()) - to_days(`i`.`date`) AS `days_since_issue` FROM `invoices` AS `i` WHERE `i`.`status` in ('pending','overdue') ORDER BY `i`.`date` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_patient_visit_history`
--
DROP TABLE IF EXISTS `v_patient_visit_history`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_patient_visit_history`  AS SELECT `t`.`patient_id` AS `patient_id`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `t`.`id` AS `treatment_id`, `t`.`date` AS `treatment_date`, `t`.`description` AS `description`, `t`.`materials` AS `materials`, `t`.`cost` AS `cost`, `t`.`doctor_id` AS `doctor_id`, concat(`d`.`first_name`,' ',`d`.`last_name`) AS `doctor_full_name`, `t`.`appointment_id` AS `appointment_id` FROM ((`treatments` `t` join `users` `u` on(`u`.`id` = `t`.`patient_id`)) join `users` `d` on(`d`.`id` = `t`.`doctor_id`)) ORDER BY `t`.`patient_id` ASC, `t`.`date` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_upcoming_appointments`
--
DROP TABLE IF EXISTS `v_upcoming_appointments`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_upcoming_appointments`  AS SELECT `a`.`id` AS `id`, `a`.`date` AS `date`, `a`.`time` AS `time`, `a`.`status` AS `status`, `a`.`treatment_type` AS `treatment_type`, `a`.`notes` AS `notes`, `a`.`patient_id` AS `patient_id`, `a`.`patient_name` AS `patient_name`, `a`.`doctor_id` AS `doctor_id`, `a`.`doctor_name` AS `doctor_name` FROM `appointments` AS `a` WHERE `a`.`date` >= curdate() AND `a`.`status` in ('scheduled','confirmed') ORDER BY `a`.`date` ASC, `a`.`time` ASC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_appointments_patient_id` (`patient_id`),
  ADD KEY `idx_appointments_doctor_id` (`doctor_id`),
  ADD KEY `idx_appointments_date` (`date`),
  ADD KEY `idx_appointments_status` (`status`),
  ADD KEY `idx_appointments_doctor_date_time` (`doctor_id`,`date`,`time`),
  ADD KEY `idx_appointments_patient_date` (`patient_id`,`date`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoices_patient_id` (`patient_id`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `idx_invoices_date` (`date`),
  ADD KEY `idx_invoices_patient_status` (`patient_id`,`status`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice_id` (`invoice_id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patient_id` (`patient_id`),
  ADD UNIQUE KEY `idx_medical_records_patient_id` (`patient_id`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_treatments_patient_id` (`patient_id`),
  ADD KEY `idx_treatments_doctor_id` (`doctor_id`),
  ADD KEY `idx_treatments_date` (`date`),
  ADD KEY `idx_treatments_appointment_id` (`appointment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_last_name` (`last_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `fk_medical_records_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatments`
--
ALTER TABLE `treatments`
  ADD CONSTRAINT `fk_treatments_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_treatments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_treatments_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
