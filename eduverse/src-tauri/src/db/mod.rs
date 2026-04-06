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

        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
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
