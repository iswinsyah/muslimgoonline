-- 1. Tabel Developers (Tenant / Penyewa Aplikasi)
CREATE TABLE IF NOT EXISTS developers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_perusahaan VARCHAR(255) NOT NULL,
    company_slug VARCHAR(100) UNIQUE,
    app_name VARCHAR(255),
    logo_url VARCHAR(255),
    notification_email VARCHAR(255),
    maintenance_mode TINYINT(1) DEFAULT 0,
    status_langganan ENUM('Active', 'Inactive', 'Pending', 'Rejected') DEFAULT 'Pending',
    ai_persona_insight TEXT,
    ai_content_calendar TEXT,
    ai_creative_caption TEXT,
    ai_creative_visual TEXT,
    ai_creative_video TEXT,
    wa_number VARCHAR(20),
    ai_cs_instruction TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Users (Pengguna Aplikasi)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    developer_id INT NULL,
    nama_user VARCHAR(100) NOT NULL,
    role ENUM('Super Admin', 'Developer', 'Admin CS', 'Agent Freelance') NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    no_whatsapp VARCHAR(20),
    status ENUM('Active', 'Inactive', 'Rejected') DEFAULT 'Active',
    is_first_login TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE SET NULL
);

-- 3. Tabel Leads (Data Prospek - Terisolasi per Tenant)
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    developer_id INT NOT NULL, -- KUNCI ISOLASI: Menandakan milik perusahaan mana
    owner_id INT NOT NULL,     -- KUNCI AKSES: Menandakan milik agen siapa
    name VARCHAR(100) NOT NULL,
    nik VARCHAR(20),
    phone VARCHAR(20),
    job VARCHAR(100),
    channel VARCHAR(50),
    segment VARCHAR(50),
    status VARCHAR(50) DEFAULT 'NEW_LEAD',
    is_locked TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel Tasks (Manajemen Tugas)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    developer_id INT NOT NULL,
    user_id INT NOT NULL,
    lead_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);