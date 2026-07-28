-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 28, 2026 at 05:39 PM
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
CREATE DATABASE IF NOT EXISTS `dental_clinic` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dental_clinic`;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `treatment_type_id` varchar(50) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 30,
  `end_time` time DEFAULT NULL
) ;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `patient_name`, `doctor_id`, `doctor_name`, `date`, `time`, `treatment_type`, `status`, `notes`, `created_at`, `updated_at`, `treatment_type_id`, `duration_minutes`, `end_time`) VALUES
('a1', 'p1', 'Nour Ali', 'd1', 'Sami Khoury', '2026-04-25', '09:00:00', 'Cleaning & Check-up', 'confirmed', 'First visit', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '09:30:00'),
('a10', 'p10', 'Yousef Ghattas', 'd3', 'Adam Saleh', '2026-04-28', '09:00:00', 'Crown Consultation', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '09:30:00'),
('a11', 'p11', 'Amal Habib', 'd2', 'Lina Nassar', '2026-04-28', '09:45:00', 'Root Canal', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '10:15:00'),
('a12', 'p12', 'Fadi Nakhleh', 'd1', 'Sami Khoury', '2026-04-28', '14:00:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '14:30:00'),
('a13', 'p13', 'Huda Saba', 'd3', 'Adam Saleh', '2026-04-29', '10:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '10:30:00'),
('a14', 'p14', 'Tarek Boulos', 'd2', 'Lina Nassar', '2026-04-29', '11:30:00', 'Extraction', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '12:00:00'),
('a15', 'p15', 'Mira Shahin', 'd1', 'Sami Khoury', '2026-04-29', '12:15:00', 'Whitening', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '12:45:00'),
('a16', 'p1', 'Nour Ali', 'd2', 'Lina Nassar', '2026-04-15', '09:00:00', 'Cleaning & Check-up', 'completed', 'Completed successfully', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '09:30:00'),
('a17', 'p2', 'Sara Kanaan', 'd1', 'Sami Khoury', '2026-04-14', '10:30:00', 'Filling', 'completed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '11:00:00'),
('a1778579975903', 'p17781529662076677', 'Lara kh', 'd2', 'Dr. Lina Nassar', '2026-05-23', '14:30:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-05-12 09:59:35', '2026-06-02 11:39:07', NULL, 30, '15:00:00'),
('a1778580255162', 'p17781529662076677', 'Lara kh', 'd2', 'Dr. Lina Nassar', '2026-05-22', '14:00:00', 'Root Canal', 'scheduled', NULL, '2026-05-12 10:04:15', '2026-06-02 11:39:07', NULL, 30, '14:30:00'),
('a1778586770508', 'p17781529662076677', 'Lara kh', 'd2', 'Dr. Lina Nassar', '2026-05-20', '11:30:00', 'Filling', 'cancelled', NULL, '2026-05-12 11:52:50', '2026-06-02 11:39:07', NULL, 30, '12:00:00'),
('a1778589108135', 'p17781529662076677', 'Lara kh', 'd3', 'Dr. Adam Saleh', '2026-05-20', '12:00:00', 'Tooth Extraction', 'cancelled', NULL, '2026-05-12 12:31:48', '2026-06-02 11:39:07', NULL, 30, '12:30:00'),
('a1778665030944', 'p17781529662076677', 'Lara kh', 'd1', 'Dr. Sami Haddad', '2026-05-14', '13:30:00', 'Filling', 'cancelled', NULL, '2026-05-13 09:37:10', '2026-06-02 11:39:07', NULL, 30, '14:00:00'),
('a1780403315201', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-03', '10:30:00', 'Root Canal', 'cancelled', NULL, '2026-06-02 12:28:35', '2026-06-02 13:28:34', NULL, 30, NULL),
('a1780403352604', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-04', '11:30:00', 'Tooth Extraction', 'cancelled', 'm7md mytwajdsh', '2026-06-02 12:29:12', '2026-06-02 13:28:40', NULL, 30, NULL),
('a1780403786641', 'p17781529662076677', 'Lara kh', 'd3', 'Dr. Adam Saleh', '2026-06-03', '09:00:00', 'Cleaning & Check-up', 'cancelled', NULL, '2026-06-02 12:36:26', '2026-06-02 13:38:33', NULL, 30, '09:30:00'),
('a1780406895312', 'p17781529662076677', 'Lara kh', 'd3', 'Dr. Adam Saleh', '2026-06-03', '09:30:00', 'Root Canal', 'cancelled', NULL, '2026-06-02 13:28:15', '2026-06-02 13:38:31', 'tt3', 60, '10:30:00'),
('a1780406940028', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-03', '09:00:00', 'Root Canal', 'scheduled', NULL, '2026-06-02 13:29:00', '2026-06-02 13:29:00', 'tt3', 60, '10:00:00'),
('a1780406963511', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-03', '10:00:00', 'Filling', 'scheduled', NULL, '2026-06-02 13:29:23', '2026-06-02 13:29:23', 'tt2', 30, '10:30:00'),
('a1780408241028', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-03', '11:00:00', 'Consultation', 'scheduled', NULL, '2026-06-02 13:50:41', '2026-06-02 13:50:41', 'tt6', 10, '11:10:00'),
('a1780999141153', 'p17781529662076677', 'Lara kh', 'd178040318910469', 'Dr. aviv aviv', '2026-06-10', '09:00:00', 'Root Canal', 'cancelled', NULL, '2026-06-09 09:59:01', '2026-06-09 10:01:38', 'tt3', 60, '10:00:00'),
('a1784717229658', 'p16', 'Mohammed Rayan', 'd3', 'Dr. Adam Saleh', '2026-07-22', '14:00:00', 'Consultation', 'scheduled', NULL, '2026-07-22 10:47:09', '2026-07-22 10:47:09', 'tt6', 10, '14:10:00'),
('a1784717270124', 'p16', 'Mohammed Rayan', 'd3', 'Dr. Adam Saleh', '2026-07-22', '14:30:00', 'Consultation', 'scheduled', NULL, '2026-07-22 10:47:50', '2026-07-22 10:47:50', 'tt6', 10, '14:40:00'),
('a1784727208552', 'p17847259248565537', 'Eessa Lwabne', 'd3', 'Dr. Adam Saleh', '2026-07-23', '16:00:00', 'Cleaning & Check-up', 'cancelled', NULL, '2026-07-22 13:33:28', '2026-07-22 13:33:50', 'tt1', 30, '16:30:00'),
('a1784727369155', 'p17847259248565537', 'Eessa Lwabne', 'd3', 'Dr. Adam Saleh', '2026-07-22', '16:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-07-22 13:36:09', '2026-07-27 18:55:04', 'tt1', 30, '16:30:00'),
('a1784727449294', 'p17847259248565537', 'Eessa Lwabne', 'd3', 'Dr. Adam Saleh', '2026-07-23', '15:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-07-22 13:37:29', '2026-07-22 13:37:29', 'tt1', 30, '15:30:00'),
('a1784730236038', 'p17847259248565537', 'Eessa Lwabne', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-23', '09:00:00', 'Consultation', 'completed', NULL, '2026-07-22 14:23:56', '2026-07-28 10:30:33', 'tt6', 10, '09:10:00'),
('a1785172198425', 'p17781529662076677', 'Lara kh', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-26', '11:50:00', 'Cleaning & Check-up', 'completed', NULL, '2026-07-27 17:09:58', '2026-07-28 10:30:57', 'tt1', 30, '12:20:00'),
('a1785176956069', 'p15', 'Mira Shahin', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-28', '09:00:00', 'Filling', 'completed', NULL, '2026-07-27 18:29:16', '2026-07-28 15:30:53', 'tt2', 30, '09:30:00'),
('a1785177885931', 'p3', 'Omar Hanna', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-26', '10:40:00', 'Consultation', 'completed', NULL, '2026-07-27 18:44:45', '2026-07-28 10:31:18', 'tt6', 10, '10:50:00'),
('a1785178693201', 'p17847259248565537', 'Eessa Lwabne', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-27', '13:40:00', 'Root Canal', 'completed', NULL, '2026-07-27 18:58:13', '2026-07-27 19:47:59', 'tt3', 60, '14:40:00'),
('a1785181560835', 'p3', 'Omar Hanna', 'd17799719098443667', 'Dr. Hasan Omar', '2026-07-30', '11:10:00', 'Filling', 'confirmed', NULL, '2026-07-27 19:46:00', '2026-07-27 19:46:06', 'tt2', 30, '11:40:00'),
('a18', 'p3', 'Omar Hanna', 'd3', 'Adam Saleh', '2026-04-13', '11:00:00', 'Root Canal', 'completed', 'Stage 1 done', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '11:30:00'),
('a19', 'p4', 'Maya Issa', 'd2', 'Lina Nassar', '2026-04-12', '13:00:00', 'Whitening', 'completed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '13:30:00'),
('a2', 'p2', 'Sara Kanaan', 'd2', 'Lina Nassar', '2026-04-25', '10:00:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '10:30:00'),
('a20', 'p5', 'Leen Jaber', 'd1', 'Sami Khoury', '2026-04-11', '09:30:00', 'Cleaning & Check-up', 'cancelled', 'Patient requested cancellation', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '10:00:00'),
('a21', 'p6', 'Karim Salem', 'd3', 'Adam Saleh', '2026-04-10', '12:00:00', 'Extraction', 'completed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '12:30:00'),
('a22', 'p7', 'Rana Toma', 'd2', 'Lina Nassar', '2026-04-09', '15:00:00', 'Braces Consultation', 'completed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '15:30:00'),
('a3', 'p3', 'Omar Hanna', 'd1', 'Sami Khoury', '2026-04-25', '11:00:00', 'Root Canal', 'scheduled', 'Tooth pain', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '11:30:00'),
('a4', 'p4', 'Maya Issa', 'd3', 'Adam Saleh', '2026-04-26', '09:30:00', 'Whitening', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '10:00:00'),
('a5', 'p5', 'Leen Jaber', 'd2', 'Lina Nassar', '2026-04-26', '12:00:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '12:30:00'),
('a6', 'p6', 'Karim Salem', 'd1', 'Sami Khoury', '2026-04-26', '13:00:00', 'Extraction', 'scheduled', 'Wisdom tooth', '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '13:30:00'),
('a7', 'p7', 'Rana Toma', 'd3', 'Adam Saleh', '2026-04-27', '09:00:00', 'Braces Consultation', 'confirmed', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '09:30:00'),
('a8', 'p8', 'Jad Mansour', 'd2', 'Lina Nassar', '2026-04-27', '10:30:00', 'Filling', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '11:00:00'),
('a9', 'p9', 'Dana Farah', 'd1', 'Sami Khoury', '2026-04-27', '11:15:00', 'Cleaning & Check-up', 'scheduled', NULL, '2026-04-23 10:17:38', '2026-06-02 11:39:07', NULL, 30, '11:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `clinic_settings`
--

CREATE TABLE `clinic_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_settings`
--

INSERT INTO `clinic_settings` (`setting_key`, `setting_value`) VALUES
('automatic_invoicing', '1'),
('clinic_address', 'Ma\'alot-Tarshiha'),
('clinic_name', 'Dental Clinic'),
('clinic_phone', '+972-XX-XXXXXXX'),
('closing_time', '19:00'),
('email_notifications', '1'),
('opening_time', '09:00'),
('sms_reminders', '1'),
('vat_percentage', '18');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_availability`
--

CREATE TABLE `doctor_availability` (
  `id` int(11) NOT NULL,
  `doctor_id` varchar(50) NOT NULL,
  `day_name` varchar(20) NOT NULL,
  `opening_time` time NOT NULL,
  `closing_time` time NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_availability`
--

INSERT INTO `doctor_availability` (`id`, `doctor_id`, `day_name`, `opening_time`, `closing_time`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'd17799719098443667', 'Sunday', '09:00:00', '19:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(2, 'd17799719098443667', 'Monday', '09:00:00', '19:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(3, 'd17799719098443667', 'Tuesday', '09:00:00', '19:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(4, 'd17799719098443667', 'Wednesday', '09:00:00', '19:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(5, 'd17799719098443667', 'Thursday', '09:00:00', '19:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(6, 'd17799719098443667', 'Friday', '09:00:00', '14:00:00', 1, '2026-06-04 10:12:50', '2026-06-04 10:12:50'),
(7, 'd178040318910469', 'Sunday', '09:00:00', '19:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17'),
(8, 'd178040318910469', 'Monday', '09:00:00', '19:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17'),
(9, 'd178040318910469', 'Tuesday', '09:00:00', '19:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17'),
(10, 'd178040318910469', 'Wednesday', '09:00:00', '19:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17'),
(11, 'd178040318910469', 'Thursday', '09:00:00', '19:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17'),
(12, 'd178040318910469', 'Friday', '09:00:00', '14:00:00', 1, '2026-06-04 11:43:17', '2026-06-04 11:43:17');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_time_off`
--

CREATE TABLE `doctor_time_off` (
  `id` varchar(50) NOT NULL,
  `doctor_id` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(20) NOT NULL,
  `patient_id` varchar(20) NOT NULL,
  `appointment_id` varchar(50) DEFAULT NULL,
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

INSERT INTO `invoices` (`id`, `patient_id`, `appointment_id`, `patient_name`, `date`, `amount`, `status`, `created_at`, `updated_at`) VALUES
('inv1', 'p1', NULL, 'Nour Ali', '2026-04-15', 220.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv10', 'p11', NULL, 'Amal Habib', '2026-03-26', 280.00, 'overdue', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv11', 'p12', NULL, 'Fadi Nakhleh', '2026-03-25', 150.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv12', 'p13', NULL, 'Huda Saba', '2026-03-24', 400.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv1785232648285', 'p3', 'a1785177885931', 'Omar Hanna', '2026-07-26', 200.00, 'paid', '2026-07-28 09:57:28', '2026-07-28 10:29:12'),
('inv1785232666534', 'p17781529662076677', 'a1785172198425', 'Lara kh', '2026-07-26', 400.00, 'paid', '2026-07-28 09:57:46', '2026-07-28 10:19:28'),
('inv1785234558589', 'p17847259248565537', 'a1785178693201', 'Eessa Lwabne', '2026-07-27', 600.00, 'paid', '2026-07-28 10:29:18', '2026-07-28 10:29:46'),
('inv1785234633656', 'p17847259248565537', 'a1784730236038', 'Eessa Lwabne', '2026-07-23', 200.00, 'paid', '2026-07-28 10:30:33', '2026-07-28 10:30:38'),
('inv1785252653122', 'p15', 'a1785176956069', 'Mira Shahin', '2026-07-28', 200.00, 'paid', '2026-07-28 15:30:53', '2026-07-28 15:31:05'),
('inv2', 'p2', NULL, 'Sara Kanaan', '2026-04-14', 350.00, 'paid', '2026-04-23 10:17:38', '2026-07-27 20:33:43'),
('inv3', 'p3', NULL, 'Omar Hanna', '2026-04-13', 900.00, 'paid', '2026-04-23 10:17:38', '2026-07-27 20:33:58'),
('inv4', 'p4', NULL, 'Maya Issa', '2026-04-12', 600.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv5', 'p6', NULL, 'Karim Salem', '2026-04-10', 750.00, 'overdue', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv6', 'p7', NULL, 'Rana Toma', '2026-04-09', 180.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv7', 'p8', NULL, 'Jad Mansour', '2026-04-02', 320.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv8', 'p9', NULL, 'Dana Farah', '2026-04-01', 200.00, 'paid', '2026-04-23 10:17:38', '2026-04-23 10:17:38'),
('inv9', 'p10', NULL, 'Yousef Ghattas', '2026-03-28', 450.00, 'pending', '2026-04-23 10:17:38', '2026-04-23 10:17:38');

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
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `invoice_id` varchar(50) NOT NULL,
  `patient_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `invoice_id`, `patient_id`, `amount`, `payment_method`, `date`, `created_at`) VALUES
('pay1785184423081', 'inv2', 'p2', 350.00, 'cash', '2026-07-27', '2026-07-27 20:33:43'),
('pay1785184438303', 'inv3', 'p3', 900.00, 'card', '2026-07-27', '2026-07-27 20:33:58'),
('pay1785233968976', 'inv1785232666534', 'p17781529662076677', 400.00, 'cash', '2026-07-28', '2026-07-28 10:19:28'),
('pay1785234552899', 'inv1785232648285', 'p3', 200.00, 'bank_transfer', '2026-07-28', '2026-07-28 10:29:12'),
('pay1785234565290', 'inv1785234558589', 'p17847259248565537', 300.00, 'cash', '2026-07-28', '2026-07-28 10:29:25'),
('pay1785234586267', 'inv1785234558589', 'p17847259248565537', 300.00, 'card', '2026-07-28', '2026-07-28 10:29:46'),
('pay1785234638652', 'inv1785234633656', 'p17847259248565537', 200.00, 'cash', '2026-07-28', '2026-07-28 10:30:38'),
('pay1785252665680', 'inv1785252653122', 'p15', 200.00, 'card', '2026-07-28', '2026-07-28 15:31:05');

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
('t1785234633651', 'p17847259248565537', 'd17799719098443667', '2026-07-23', 'Consultation', NULL, 200.00, 'a1784730236038', '2026-07-28 10:30:33', '2026-07-28 10:30:33'),
('t1785234657888', 'p17781529662076677', 'd17799719098443667', '2026-07-26', 'Cleaning & Check-up', NULL, 400.00, 'a1785172198425', '2026-07-28 10:30:57', '2026-07-28 10:30:57'),
('t1785234678323', 'p3', 'd17799719098443667', '2026-07-26', 'Consultation', NULL, 200.00, 'a1785177885931', '2026-07-28 10:31:18', '2026-07-28 10:31:18'),
('t1785252653108', 'p15', 'd17799719098443667', '2026-07-28', 'Filling', NULL, 200.00, 'a1785176956069', '2026-07-28 15:30:53', '2026-07-28 15:30:53'),
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
-- Table structure for table `treatment_types`
--

CREATE TABLE `treatment_types` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `treatment_types`
--

INSERT INTO `treatment_types` (`id`, `name`, `duration_minutes`, `price`, `status`, `created_at`) VALUES
('tt1', 'Cleaning & Check-up', 30, 400.00, 'active', '2026-06-02 13:22:02'),
('tt2', 'Filling', 30, 200.00, 'active', '2026-06-02 13:22:02'),
('tt3', 'Root Canal', 60, 600.00, 'active', '2026-06-02 13:22:02'),
('tt4', 'Tooth Extraction', 10, 200.00, 'active', '2026-06-02 13:22:02'),
('tt5', 'Whitening', 60, 1200.00, 'active', '2026-06-02 13:22:02'),
('tt6', 'Consultation', 10, 200.00, 'active', '2026-06-02 13:22:02');

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
  `avatar` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(20) DEFAULT 'active',
  `password_changed_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `first_name`, `last_name`, `phone`, `birth_date`, `id_number`, `avatar`, `created_at`, `updated_at`, `status`, `password_changed_at`) VALUES
('d1', 'dr.sami@clinic.com', '$2b$10$doctor1hashedpassword', 'doctor', 'Sami', 'Haddad', '050-9100001', '1978-03-15', '910000001', 'https://example.com/avatar/d1.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('d17799719098443667', 'HasanO@gmail.com', '$2b$10$xxRdYiE5Z075VC0jELWwK./4WZUaHtQiV/l6xOYra4Tuyt3OukS1.', 'doctor', 'Hasan', 'Omar', '+972-54-1234567', '2002-04-04', '2311237777', NULL, '2026-05-28 12:38:29', '2026-05-28 12:38:29', 'active', NULL),
('d178040318910469', 'aviv@gmai', '$2b$10$ILDuHnPxwMV3wdaoJt3vsu/p.P0jsQ/C8pEV8iZHwllnbml0sOhYC', 'doctor', 'aviv', 'aviv', '087908668', '1999-12-12', '34108649', NULL, '2026-06-02 12:26:29', '2026-06-02 12:26:29', 'active', NULL),
('d2', 'dr.lina@clinic.com', '$2b$10$doctor2hashedpassword', 'doctor', 'Lina', 'Nassar', '050-9100002', '1985-08-20', '910000002', 'https://example.com/avatar/d2.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('d3', 'dr.adam@clinic.com', '$2b$10$doctor3hashedpassword', 'doctor', 'Adam', 'Saleh', '050-9100003', '1981-01-10', '910000003', 'https://example.com/avatar/d3.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('DOC001', 'doctor@test.com', '$2b$10$NAfG24Hz.0.R6VZ5.ahUbuvWe3wkc7OoYmuO8HHY68RZVs85Pinju', 'doctor', 'Test', 'Doctor', NULL, NULL, NULL, NULL, '2026-05-19 12:27:41', '2026-05-19 12:27:41', 'active', NULL),
('m1', 'manager@clinic.com', '$2b$10$KYVbZOMgL.VDpJJwL7JFHe63kR9nzT.WplnC..7/DXbWSD66ALmuO', 'manager', 'Loay', 'Khoury', '050-9000001', '1982-06-11', '900000001', 'https://example.com/avatar/m1.png', '2026-04-23 10:17:38', '2026-04-30 11:47:29', 'active', NULL),
('m17799720876861493', 'WardN@gmail.com', '$2b$10$uEXo7bYKE.coDXZvlezBkOGH7J0SO8H2tr26Skt1zKU8jAd5IpbFi', 'manager', 'Ward', 'Najar', '0567874234', '2004-09-09', '445678432', NULL, '2026-05-28 12:41:27', '2026-05-28 12:41:27', 'active', NULL),
('m17804030162377038', 'othman@gmai', '$2b$10$llyc.tYu7v0/aWEUJrLipuaNUXLNUdCjSStZRsp5WIq2v63F72nKi', 'manager', 'othman', 'aviv', '0585572008', '1999-09-09', '5828465095', NULL, '2026-06-02 12:23:36', '2026-06-02 12:23:36', 'active', NULL),
('m2', 'loayKh@clinic.com', '$2b$10$NAfG24Hz.0.R6VZ5.ahUbuvWe3wkc7OoYmuO8HHY68RZVs85Pinju', 'manager', 'Loay', 'Khoury', '0526643414', '1997-02-25', '999999999', NULL, '2026-04-30 12:30:53', '2026-04-30 12:32:44', 'active', NULL),
('p1', 'nour.ali@example.com', '$2b$10$patient1hashedpassword', 'patient', 'Nour', 'Ali', '050-1000001', '1999-04-03', '100000001', 'https://example.com/avatar/p1.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p10', 'yousef.ghattas@example.com', '$2b$10$patient10hashedpassword', 'patient', 'Yousef', 'Ghattas', '050-1000010', '1984-04-28', '100000010', 'https://example.com/avatar/p10.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p11', 'amal.habib@example.com', '$2b$10$patient11hashedpassword', 'patient', 'Amal', 'Habib', '050-1000011', '1992-06-06', '100000011', 'https://example.com/avatar/p11.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p12', 'fadi.nakhleh@example.com', '$2b$10$patient12hashedpassword', 'patient', 'Fadi', 'Nakhleh', '050-1000012', '1989-01-19', '100000012', 'https://example.com/avatar/p12.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p13', 'huda.saba@example.com', '$2b$10$patient13hashedpassword', 'patient', 'Huda', 'Saba', '050-1000013', '1996-07-01', '100000013', 'https://example.com/avatar/p13.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p14', 'tarek.boulos@example.com', '$2b$10$patient14hashedpassword', 'patient', 'Tarek', 'Boulos', '050-1000014', '1987-08-09', '100000014', 'https://example.com/avatar/p14.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p15', 'mira.shahin@example.com', '$2b$10$patient15hashedpassword', 'patient', 'Mira', 'Shahin', '050-1000015', '2002-02-25', '100000015', 'https://example.com/avatar/p15.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p16', 'mohammedRayan@test.com', '$2b$10$c7RC.cYOogK0vcgzLH8wJeUYasbg5MdDfkuSW7ST952XxAdwlOYaq', 'patient', 'Mohammed', 'Rayan', '0501234567', '2005-07-17', '123456789', 'data:image/jpeg;base64,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', '2026-04-30 10:33:39', '2026-07-22 11:48:00', 'active', NULL),
('p17781529662076677', 'larakh51@gmail.com', '$2b$10$68S8JMQ3ITG403ZUBelOzuNpV4ahcKst7u0YWC7svwSpsXSQB0F5W', 'patient', 'Lara', 'kh', '', '2026-05-25', '23112332', NULL, '2026-05-07 11:22:46', '2026-05-19 11:24:55', 'active', NULL),
('p17847259248565537', 'Eessa@clinic.com', '$2b$10$VQddo3RSKbXZrt0MphMCXeiH4N1GqjfVboD7XDc4gS1BHpKd8vxLa', 'patient', 'Eessa', 'Lwabne', '0567854321', '2003-01-18', '214563789', NULL, '2026-07-22 13:12:04', '2026-07-27 17:51:15', 'active', '2026-07-27 20:51:15'),
('p2', 'sara.kanaan@example.com', '$2b$10$patient2hashedpassword', 'patient', 'Sara', 'Kanaan', '050-1000002', '1995-12-12', '100000002', 'https://example.com/avatar/p2.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p3', 'omar.hanna@example.com', '$2b$10$patient3hashedpassword', 'patient', 'Omar', 'Hanna', '050-1000003', '1988-07-22', '100000003', 'https://example.com/avatar/p3.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p4', 'maya.issa@example.com', '$2b$10$patient4hashedpassword', 'patient', 'Maya', 'Issa', '050-1000004', '2001-10-30', '100000004', 'https://example.com/avatar/p4.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p5', 'leen.jaber@example.com', '$2b$10$patient5hashedpassword', 'patient', 'Leen', 'Jaber', '050-1000005', '1993-02-17', '100000005', 'https://example.com/avatar/p5.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p6', 'karim.salem@example.com', '$2b$10$patient6hashedpassword', 'patient', 'Karim', 'Salem', '050-1000006', '1986-09-05', '100000006', 'https://example.com/avatar/p6.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p7', 'rana.toma@example.com', '$2b$10$patient7hashedpassword', 'patient', 'Rana', 'Toma', '050-1000007', '1997-03-08', '100000007', 'https://example.com/avatar/p7.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p8', 'jad.mansour@example.com', '$2b$10$patient8hashedpassword', 'patient', 'Jad', 'Mansour', '050-1000008', '1990-11-26', '100000008', 'https://example.com/avatar/p8.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL),
('p9', 'dana.farah@example.com', '$2b$10$patient9hashedpassword', 'patient', 'Dana', 'Farah', '050-1000009', '2000-05-14', '100000009', 'https://example.com/avatar/p9.png', '2026-04-23 10:17:38', '2026-04-23 10:17:38', 'active', NULL);

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
-- Indexes for table `clinic_settings`
--
ALTER TABLE `clinic_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_time_off`
--
ALTER TABLE `doctor_time_off`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_invoice_appointment` (`appointment_id`),
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
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `treatment_types`
--
ALTER TABLE `treatment_types`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
--
-- Database: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Table structure for table `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Table structure for table `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Table structure for table `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Table structure for table `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Table structure for table `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Table structure for table `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Table structure for table `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Table structure for table `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dumping data for table `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2026-04-23 09:58:38', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"he\"}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Table structure for table `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indexes for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indexes for table `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indexes for table `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indexes for table `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indexes for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indexes for table `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indexes for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indexes for table `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indexes for table `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indexes for table `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indexes for table `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indexes for table `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indexes for table `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
