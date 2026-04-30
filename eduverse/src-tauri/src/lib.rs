mod db;

use db::models::{AuthResponse, DashboardData, Guardian, LoginCredentials, RegisterPayload, SchoolYear};
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

#[tauri::command]
fn get_dashboard_data(school_id: String) -> Result<DashboardData, String> {
    repository::handle_get_dashboard_data(&school_id)
}

#[tauri::command]
fn get_school_years(school_id: String) -> Result<Vec<SchoolYear>, String> {
    repository::handle_get_school_years(&school_id)
}

#[tauri::command]
fn create_school_year(
    school_id: String,
    name: String,
    start_date: String,
    end_date: String,
) -> Result<SchoolYear, String> {
    repository::handle_create_school_year(&school_id, &name, &start_date, &end_date)
}

#[tauri::command]
fn update_school_year(
    id: String,
    name: String,
    start_date: String,
    end_date: String,
) -> Result<SchoolYear, String> {
    repository::handle_update_school_year(&id, &name, &start_date, &end_date)
}

#[tauri::command]
fn set_active_school_year(id: String, school_id: String) -> Result<SchoolYear, String> {
    repository::handle_set_active_school_year(&id, &school_id)
}

#[tauri::command]
fn close_school_year(id: String) -> Result<SchoolYear, String> {
    repository::handle_close_school_year(&id)
}

#[tauri::command]
fn delete_school_year(id: String) -> Result<(), String> {
    repository::handle_delete_school_year(&id)
}

#[tauri::command]
fn validate_license(_public_key: String, private_key: String) -> Result<bool, String> {
    let valid_keys = ["DEMO-2024-ABCD", "TEST-KEY-1234", "EDUVERSE-PRO-2024"];
    Ok(valid_keys.contains(&private_key.as_str()))
}

#[tauri::command]
fn validate_license_local(
    _public_key: String,
    private_key: String,
    _signature: String,
) -> Result<bool, String> {
    let valid_keys = ["DEMO-2024-ABCD", "TEST-KEY-1234", "EDUVERSE-PRO-2024"];
    Ok(valid_keys.contains(&private_key.as_str()))
}

#[tauri::command]
fn get_guardians_by_student_id(student_id: String) -> Result<Vec<Guardian>, String> {
    repository::handle_get_guardians_by_student_id(&student_id)
}

#[tauri::command]
fn create_guardian(
    student_id: String,
    name: String,
    relation: String,
    phone: String,
    profession: Option<String>,
    is_emergency_contact: bool,
) -> Result<Guardian, String> {
    repository::handle_create_guardian(&student_id, &name, &relation, &phone, profession.as_deref(), is_emergency_contact)
}

#[tauri::command]
fn update_guardian(
    id: String,
    name: String,
    relation: String,
    phone: String,
    profession: Option<String>,
    is_emergency_contact: bool,
) -> Result<Guardian, String> {
    repository::handle_update_guardian(&id, &name, &relation, &phone, profession.as_deref(), is_emergency_contact)
}

#[tauri::command]
fn delete_guardian(id: String) -> Result<(), String> {
    repository::handle_delete_guardian(&id)
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
            check_session,
            get_dashboard_data,
            get_school_years,
            create_school_year,
            update_school_year,
            set_active_school_year,
            close_school_year,
            delete_school_year,
            validate_license,
            validate_license_local,
            get_guardians_by_student_id,
            create_guardian,
            update_guardian,
            delete_guardian
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
