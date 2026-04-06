mod db;

use db::models::{LoginCredentials, RegisterPayload, AuthResponse};
use db::repository;

#[tauri::command]
fn login(credentials: LoginCredentials) -> Result<AuthResponse, String> {
    repository::handle_login(credentials)
}

#[tauri::command]
fn register(payload: RegisterPayload) -> Result<AuthResponse, String> {
    repository::handle_register(payload)
}

#[tauri::command]
fn logout() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
fn check_session() -> Result<AuthResponse, String> {
    Err("No active session".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    db::init_db().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            login,
            register,
            logout,
            check_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
