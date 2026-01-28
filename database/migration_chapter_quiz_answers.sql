-- Create chapter_quiz_answers table
CREATE TABLE IF NOT EXISTS chapter_quiz_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    chapter_id INT NOT NULL,
    question_index INT NOT NULL,
    selected_option_index INT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
);
