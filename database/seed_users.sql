-- Test users for LMS
-- Password for both users: test123

-- Clear existing test users if any
DELETE FROM users WHERE email IN ('admin@example.com', 'learner@example.com');

-- Insert test users with bcrypt hash of 'test123'
INSERT INTO users (email, password_hash, first_name, last_name, role, department, business_unit, status) 
VALUES 
('admin@example.com', '$2a$10$maepbNnozWq.tgRTyPFc4eLOucY8x4abYjQOzn2eEs4UOSPygZx7y', 'Admin', 'User', 'admin', 'Management', 'Corporate', 'active'),
('learner@example.com', '$2a$10$maepbNnozWq.tgRTyPFc4eLOucY8x4abYjQOzn2eEs4UOSPygZx7y', 'John', 'Doe', 'learner', 'IT', 'Technology', 'active');

-- Verify users were created
SELECT id, email, first_name, last_name, role, department FROM users WHERE email IN ('admin@example.com', 'learner@example.com');
