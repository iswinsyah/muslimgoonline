-- 1. Tabel Developers (Tenant / Penyewa Aplikasi)
CREATE TABLE IF NOT EXISTS developers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_perusahaan VARCHAR(255) NOT NULL,
    status_langganan ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Users (Pengguna Aplikasi)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    developer_id INT NULL, -- NULL jika Super Admin (Milik MGO Pusat)
    nama_user VARCHAR(100) NOT NULL,
    role ENUM('Super Admin', 'Developer', 'Admin CS', 'Agent Freelance') NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Wajib di-hash
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