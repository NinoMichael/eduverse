use directories::ProjectDirs;
use once_cell::sync::Lazy;
pub mod models;
pub mod repository;

use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use std::sync::Mutex;

pub static DB: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

pub fn get_db_path() -> PathBuf {
    if let Some(proj_dirs) = ProjectDirs::from("com", "eduverse", "Eduverse") {
        let data_dir = proj_dirs.data_dir();
        std::fs::create_dir_all(data_dir).ok();
        data_dir.join("eduverse.db")
    } else {
        PathBuf::from("eduverse.db")
    }
}

pub fn init_db() -> SqliteResult<()> {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schools (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            school_id TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TEXT NOT NULL,
            FOREIGN KEY (school_id) REFERENCES schools(id)
        );

        CREATE TABLE IF NOT EXISTS school_years (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 0,
            school_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (school_id) REFERENCES schools(id)
        );

        CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            level TEXT NOT NULL,
            school_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (school_id) REFERENCES schools(id)
        );

        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            school_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (school_id) REFERENCES schools(id)
        );

        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            class_id TEXT NOT NULL,
            school_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (school_id) REFERENCES schools(id)
        );

        CREATE TABLE IF NOT EXISTS schedules (
            id TEXT PRIMARY KEY,
            class_id TEXT NOT NULL,
            teacher_id TEXT NOT NULL,
            day_of_week INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            subject TEXT NOT NULL,
            school_year_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (teacher_id) REFERENCES teachers(id),
            FOREIGN KEY (school_year_id) REFERENCES school_years(id)
        );

        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
        CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
        CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
        CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
        CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day_of_week, start_time);
        CREATE TABLE IF NOT EXISTS guardians (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            name TEXT NOT NULL,
            relation TEXT NOT NULL,
            phone TEXT NOT NULL,
            profession TEXT,
            is_emergency_contact INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        CREATE INDEX IF NOT EXISTS idx_guardians_student_id ON guardians(student_id);
        CREATE INDEX IF NOT EXISTS idx_school_years_active ON school_years(is_active);
        ",
    )?;

    let mut db = DB.lock().unwrap();
    *db = Some(conn);

    Ok(())
}

pub fn with_db<T, F>(f: F) -> Result<T, String>
where
    F: FnOnce(&Connection) -> SqliteResult<T>,
{
    let db = DB.lock().map_err(|e| e.to_string())?;
    let conn = db.as_ref().ok_or("Database not initialized")?;
    f(conn).map_err(|e| e.to_string())
}
