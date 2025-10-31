CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'User', 'SuperAdmin') DEFAULT 'User',
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    password_reset_token VARCHAR(100) NULL,
    password_reset_expires TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL
);
 
-- Insert sample admin user (password: admin123)
INSERT INTO users (uid, email, password_hash, full_name, role, is_active) 
VALUES (
    'admin001', 
    'admin@example.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password hashed
    'System Administrator', 
    'Admin', 
    TRUE
);