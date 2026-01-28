-- LMS Database Schema (MySQL)
-- Based on FDS Requirements
SET FOREIGN_KEY_CHECKS = 0;
-- ==========================================
-- 1. Users & Authentication
-- ==========================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('learner', 'admin') DEFAULT 'learner',
    department VARCHAR(100),
    business_unit VARCHAR(100),
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ==========================================
-- 2. Course Categories
-- ==========================================
DROP TABLE IF EXISTS course_categories;
CREATE TABLE course_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2b. Courses
-- ==========================================
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) COMMENT 'Legacy category string (synced with category_id)',
    category_id INT,
    order_in_category INT DEFAULT 0,
    department VARCHAR(100),
    owner_id INT,
    version VARCHAR(20) DEFAULT 'v1',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    deadline_days INT DEFAULT 0 COMMENT 'Default days to complete',
    deadline_hours INT DEFAULT 0 COMMENT 'Default hours to complete',
    has_course_test BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL
);
-- ==========================================
-- 3. Course Content (PDF/PPT Files)
-- ==========================================
DROP TABLE IF EXISTS course_content;
CREATE TABLE course_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('pdf', 'ppt', 'pptx') NOT NULL,
    file_size BIGINT,
    total_pages INT DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
-- ==========================================
-- 4. Native Slides (Title, Text, Image - FDS 5.3.2.3)
-- ==========================================
DROP TABLE IF EXISTS course_slides;
CREATE TABLE course_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    chapter_id INT COMMENT 'Link to the chapter this slide belongs to',
    title VARCHAR(255),
    content_text TEXT,
    image_path VARCHAR(500) COMMENT 'Path to uploaded image (jpg/png/gif)',
    image_name VARCHAR(255) COMMENT 'Original filename of uploaded image',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
);

-- ==========================================
-- 4b. Course Chapters (Unified Lessons: Video, Slide, Quiz)
-- ==========================================
DROP TABLE IF EXISTS course_chapters;
CREATE TABLE course_chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255),
    type ENUM('video', 'slide', 'quiz') NOT NULL,
    content_data JSON COMMENT 'Stores video URL, slides list, or quiz config',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. Course Assignments
-- ==========================================
DROP TABLE IF EXISTS course_assignments;
CREATE TABLE course_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    assigned_by INT,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline_at DATETIME NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'overdue') DEFAULT 'not_started',
    completed_at DATETIME,
    last_access_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);
-- ==========================================
-- 6. Course Progress (Granular Tracking)
-- ==========================================
DROP TABLE IF EXISTS course_progress;
CREATE TABLE course_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    chapter_id INT NOT NULL,
    current_page INT DEFAULT 0,
    total_pages_viewed INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0,
    last_viewed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
);
-- ==========================================
-- 7. Tests & Quizzes definitions
-- ==========================================
DROP TABLE IF EXISTS tests;
CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    test_type ENUM('course_test', 'periodic_test') NOT NULL,
    course_id INT NULL COMMENT 'Only for course_test',
    pass_threshold DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    time_limit_minutes INT,
    max_attempts INT DEFAULT 1,
    question_order ENUM('sequential', 'random') DEFAULT 'sequential',
    show_answers_review BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
-- ==========================================
-- 8. Test Questions
-- ==========================================
DROP TABLE IF EXISTS test_questions;
CREATE TABLE test_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('single_choice', 'multiple_choice', 'true_false') NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.00,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
-- ==========================================
-- 9. Test Answers (Options)
-- ==========================================
DROP TABLE IF EXISTS test_answers;
CREATE TABLE test_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE
);
-- ==========================================
-- 10. Periodic Test Schedules
-- ==========================================
DROP TABLE IF EXISTS periodic_test_schedules;
CREATE TABLE periodic_test_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    frequency_type ENUM('days', 'weeks', 'months') NOT NULL,
    frequency_value INT NOT NULL,
    target_department VARCHAR(100),
    target_business_unit VARCHAR(100),
    next_run_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
-- ==========================================
-- 11. Test Attempts (Execution)
-- ==========================================
DROP TABLE IF EXISTS test_attempts;
CREATE TABLE test_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    user_id INT NOT NULL,
    assignment_id INT NULL COMMENT 'Link to course assignment if course_test',
    attempt_number INT DEFAULT 1,
    score DECIMAL(5,2),
    passed BOOLEAN,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    time_spent_seconds INT,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE SET NULL
);
-- ==========================================
-- 12. User Answers (Detail)
-- ==========================================
DROP TABLE IF EXISTS test_user_answers;
CREATE TABLE test_user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT NULL COMMENT 'Selected answer option ID',
    is_correct BOOLEAN,
    answered_at DATETIME,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES test_answers(id) ON DELETE SET NULL
);
-- ==========================================
-- 13. Periodic Test Assignments (Tracking Cycles)
-- ==========================================
DROP TABLE IF EXISTS periodic_test_assignments;
CREATE TABLE periodic_test_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    user_id INT NOT NULL,
    cycle_start_date DATE,
    cycle_end_date DATE,
    status ENUM('pending', 'completed', 'missed') DEFAULT 'pending',
    completed_at DATETIME,
    attempt_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES periodic_test_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE SET NULL
);
-- ==========================================
-- 14. Email Notifications Queue
-- ==========================================
DROP TABLE IF EXISTS email_notifications;
CREATE TABLE email_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('course_assigned', 'deadline_reminder', 'overdue', 'periodic_test_assigned', 'periodic_test_reminder', 'test_completed') NOT NULL,
    reference_id INT,
    reference_type ENUM('course_assignment', 'test', 'periodic_test'),
    subject VARCHAR(255),
    body TEXT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- ==========================================
-- 15. Admin Action Log
-- ==========================================
DROP TABLE IF EXISTS admin_action_log;
CREATE TABLE admin_action_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);
SET FOREIGN_KEY_CHECKS = 1;
