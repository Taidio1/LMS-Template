-- Create test_assignments table for direct assignments (independent of courses)
CREATE TABLE IF NOT EXISTS test_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    assigned_by INT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline_at DATETIME,
    status ENUM('active', 'completed', 'expired', 'revoked') DEFAULT 'active',
    max_attempts_override INT DEFAULT NULL, -- Optional override for default test attempts
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Prevent duplicate active assignments of the same test to the same user
    UNIQUE KEY unique_active_assignment (user_id, test_id)
);
