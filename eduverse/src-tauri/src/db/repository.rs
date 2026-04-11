use crate::db::models::{
    current_timestamp, generate_id, generate_token, hash_password, AuthResponse, DashboardData,
    DashboardStats, LoginCredentials, RegisterPayload, ScheduleItem, School, SchoolYear, User,
};
use crate::db::with_db;
use chrono::Utc;
use rusqlite::{params, OptionalExtension};

pub fn create_school(name: &str, address: &str, school_type: &str) -> Result<School, String> {
    let id = generate_id();
    let created_at = current_timestamp();

    with_db(|conn| {
        conn.execute(
            "INSERT INTO schools (id, name, address, type, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, name, address, school_type, created_at],
        )?;

        Ok(School {
            id,
            name: name.to_string(),
            address: address.to_string(),
            school_type: school_type.to_string(),
            created_at,
        })
    })
}

pub fn create_user(
    username: &str,
    password: &str,
    school_id: &str,
    role: &str,
) -> Result<User, String> {
    let id = generate_id();
    let password_hash = hash_password(password);
    let created_at = current_timestamp();

    with_db(|conn| {
        conn.execute(
            "INSERT INTO users (id, username, password_hash, school_id, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, username, password_hash, school_id, role, created_at],
        )?;

        Ok(User {
            id,
            username: username.to_string(),
            password_hash,
            school_id: school_id.to_string(),
            role: role.to_string(),
            created_at,
        })
    })
}

pub fn find_user_by_username(username: &str) -> Result<Option<User>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, username, password_hash, school_id, role, created_at FROM users WHERE username = ?1"
        )?;

        let user = stmt
            .query_row(params![username], |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    password_hash: row.get(2)?,
                    school_id: row.get(3)?,
                    role: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })
            .optional()?;

        Ok(user)
    })
}

pub fn find_school_by_id(id: &str) -> Result<Option<School>, String> {
    with_db(|conn| {
        let mut stmt =
            conn.prepare("SELECT id, name, address, type, created_at FROM schools WHERE id = ?1")?;

        let school = stmt
            .query_row(params![id], |row| {
                Ok(School {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    address: row.get(2)?,
                    school_type: row.get(3)?,
                    created_at: row.get(4)?,
                })
            })
            .optional()?;

        Ok(school)
    })
}

pub fn verify_user(username: &str, password: &str) -> Result<Option<User>, String> {
    if let Some(user) = find_user_by_username(username)? {
        if user.password_hash == hash_password(password) {
            return Ok(Some(user));
        }
    }
    Ok(None)
}

pub fn handle_login(credentials: LoginCredentials) -> Result<AuthResponse, String> {
    let user = verify_user(&credentials.identifier, &credentials.password)?
        .ok_or_else(|| "Identifiant ou mot de passe incorrect".to_string())?;

    let school = find_school_by_id(&user.school_id)?.ok_or("École associée introuvable")?;

    let token = generate_token();

    Ok(AuthResponse {
        user,
        school,
        token,
    })
}

pub fn handle_register(payload: RegisterPayload) -> Result<AuthResponse, String> {
    if find_user_by_username(&payload.user.username)?.is_some() {
        return Err("Ce nom d'utilisateur existe déjà".to_string());
    }

    let school = create_school(
        &payload.school.name,
        &payload.school.address,
        &payload.school.school_type,
    )?;

    let user = create_user(
        &payload.user.username,
        &payload.user.password,
        &school.id,
        "admin",
    )?;

    let token = generate_token();

    Ok(AuthResponse {
        user,
        school,
        token,
    })
}

fn get_active_school_year(school_id: &str) -> Result<Option<SchoolYear>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active FROM school_years WHERE school_id = ?1 AND is_active = 1"
        )?;

        let school_year = stmt
            .query_row(params![school_id], |row| {
                Ok(SchoolYear {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    start_date: row.get(2)?,
                    end_date: row.get(3)?,
                    is_active: row.get::<_, i32>(4)? == 1,
                })
            })
            .optional()?;

        Ok(school_year)
    })
}

fn count_students(school_id: &str) -> Result<i32, String> {
    with_db(|conn| {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM students WHERE school_id = ?1",
            params![school_id],
            |row| row.get(0),
        )?;
        Ok(count)
    })
}

fn count_classes(school_id: &str) -> Result<i32, String> {
    with_db(|conn| {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM classes WHERE school_id = ?1",
            params![school_id],
            |row| row.get(0),
        )?;
        Ok(count)
    })
}

fn count_teachers(school_id: &str) -> Result<i32, String> {
    with_db(|conn| {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM teachers WHERE school_id = ?1",
            params![school_id],
            |row| row.get(0),
        )?;
        Ok(count)
    })
}

fn get_today_schedules(school_id: &str) -> Result<Vec<ScheduleItem>, String> {
    let day_of_week = Utc::now()
        .format("%u")
        .to_string()
        .parse::<i32>()
        .unwrap_or(1);

    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT s.id, c.name, t.first_name || ' ' || t.last_name, s.subject, s.start_time, s.end_time, s.day_of_week
             FROM schedules s
             JOIN classes c ON s.class_id = c.id
             JOIN teachers t ON s.teacher_id = t.id
             WHERE c.school_id = ?1 AND s.day_of_week = ?2
             ORDER BY s.start_time"
        )?;

        let schedules = stmt
            .query_map(params![school_id, day_of_week], |row| {
                Ok(ScheduleItem {
                    id: row.get(0)?,
                    class_name: row.get(1)?,
                    teacher_name: row.get(2)?,
                    subject: row.get(3)?,
                    start_time: row.get(4)?,
                    end_time: row.get(5)?,
                    day_of_week: row.get(6)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(schedules)
    })
}

pub fn handle_get_dashboard_data(school_id: &str) -> Result<DashboardData, String> {
    let school_year = get_active_school_year(school_id)?;
    let total_students = count_students(school_id)?;
    let total_classes = count_classes(school_id)?;
    let total_teachers = count_teachers(school_id)?;
    let schedules = get_today_schedules(school_id)?;

    let current_year = school_year.as_ref().map(|y| y.name.clone());

    let stats = DashboardStats {
        current_year,
        total_students,
        total_classes,
        total_teachers,
    };

    Ok(DashboardData {
        stats,
        school_year,
        schedules,
    })
}
