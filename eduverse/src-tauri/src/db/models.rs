use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct School {
    pub id: String,
    pub name: String,
    pub address: String,
    #[serde(rename = "type")]
    pub school_type: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub school_id: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginCredentials {
    pub identifier: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterSchoolData {
    pub name: String,
    pub address: String,
    #[serde(rename = "type")]
    pub school_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterUserData {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterPayload {
    pub school: RegisterSchoolData,
    pub user: RegisterUserData,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub user: User,
    pub school: School,
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiError {
    pub error: String,
}

pub fn hash_password(password: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn generate_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

pub fn generate_token() -> String {
    let timestamp = Utc::now().timestamp();
    let random = uuid::Uuid::new_v4().to_string();
    let mut hasher = Sha256::new();
    hasher.update(format!("{}_{}", timestamp, random).as_bytes());
    hex::encode(hasher.finalize())
}

pub fn current_timestamp() -> String {
    Utc::now().to_rfc3339()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Student {
    pub id: String,
    pub first_name: String,
    pub last_name: String,
    pub class_id: String,
    pub school_id: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Class {
    pub id: String,
    pub name: String,
    pub level: String,
    pub school_id: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SchoolYear {
    pub id: String,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Teacher {
    pub id: String,
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleItem {
    pub id: String,
    pub class_name: String,
    pub teacher_name: String,
    pub subject: String,
    pub start_time: String,
    pub end_time: String,
    pub day_of_week: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStats {
    pub current_year: Option<String>,
    pub total_students: i32,
    pub total_classes: i32,
    pub total_teachers: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardData {
    pub stats: DashboardStats,
    pub school_year: Option<SchoolYear>,
    pub schedules: Vec<ScheduleItem>,
}
