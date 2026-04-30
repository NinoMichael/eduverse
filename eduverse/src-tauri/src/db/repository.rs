use crate::db::models::{
    current_timestamp, generate_id, generate_token, hash_password, AuthResponse, DashboardData,
    DashboardStats, LoginCredentials, RegisterPayload, ScheduleItem, School, SchoolYear, User,
};
use crate::db::with_db;
use chrono::{Datelike, NaiveDate, Utc};
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

fn determine_school_year_status(start_date: &str, end_date: &str) -> &'static str {
    let today = Utc::now().date_naive();

    if let (Ok(start), Ok(end)) = (
        NaiveDate::parse_from_str(start_date, "%Y-%m-%d"),
        NaiveDate::parse_from_str(end_date, "%Y-%m-%d"),
    ) {
        if today < start {
            "planned"
        } else if today >= start && today <= end {
            "in_progress"
        } else {
            "closed"
        }
    } else {
        "planned"
    }
}

pub fn get_school_years(school_id: &str) -> Result<Vec<SchoolYear>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active, school_id, created_at 
             FROM school_years 
             WHERE school_id = ?1 
             ORDER BY start_date DESC",
        )?;

        let years = stmt
            .query_map(params![school_id], |row| {
                Ok(SchoolYear {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    start_date: row.get(2)?,
                    end_date: row.get(3)?,
                    is_active: row.get::<_, i32>(4)? == 1,
                    school_id: row.get(5)?,
                    created_at: row.get(6)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(years)
    })
}

pub fn get_school_year_by_id(id: &str) -> Result<Option<SchoolYear>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active, school_id, created_at 
             FROM school_years 
             WHERE id = ?1",
        )?;

        let year = stmt
            .query_row(params![id], |row| {
                Ok(SchoolYear {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    start_date: row.get(2)?,
                    end_date: row.get(3)?,
                    is_active: row.get::<_, i32>(4)? == 1,
                    school_id: row.get(5)?,
                    created_at: row.get(6)?,
                })
            })
            .optional()?;

        Ok(year)
    })
}

pub fn create_school_year(
    school_id: &str,
    name: &str,
    start_date: &str,
    end_date: &str,
) -> Result<SchoolYear, String> {
    let id = generate_id();
    let created_at = current_timestamp();

    with_db(|conn| {
        conn.execute(
            "INSERT INTO school_years (id, name, start_date, end_date, is_active, school_id, created_at) 
             VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6)",
            params![id, name, start_date, end_date, school_id, created_at],
        )?;

        Ok(SchoolYear {
            id,
            name: name.to_string(),
            start_date: start_date.to_string(),
            end_date: end_date.to_string(),
            is_active: false,
            school_id: school_id.to_string(),
            created_at,
        })
    })
}

pub fn update_school_year(
    id: &str,
    name: &str,
    start_date: &str,
    end_date: &str,
) -> Result<SchoolYear, String> {
    with_db(|conn| {
        let rows = conn.execute(
            "UPDATE school_years SET name = ?1, start_date = ?2, end_date = ?3 WHERE id = ?4",
            params![name, start_date, end_date, id],
        )?;

        if rows == 0 {
            return Err("Année scolaire non trouvée".to_string());
        }

        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active, school_id, created_at 
             FROM school_years 
             WHERE id = ?1",
        )?;

        let year = stmt.query_row(params![id], |row| {
            Ok(SchoolYear {
                id: row.get(0)?,
                name: row.get(1)?,
                start_date: row.get(2)?,
                end_date: row.get(3)?,
                is_active: row.get::<_, i32>(4)? == 1,
                school_id: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        Ok(year)
    })
}

pub fn set_active_school_year(id: &str, school_id: &str) -> Result<SchoolYear, String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE school_years SET is_active = 0 WHERE school_id = ?1",
            params![school_id],
        )?;

        let rows = conn.execute(
            "UPDATE school_years SET is_active = 1 WHERE id = ?1",
            params![id],
        )?;

        if rows == 0 {
            return Err("Année scolaire non trouvée".to_string());
        }

        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active, school_id, created_at 
             FROM school_years 
             WHERE id = ?1",
        )?;

        let year = stmt.query_row(params![id], |row| {
            Ok(SchoolYear {
                id: row.get(0)?,
                name: row.get(1)?,
                start_date: row.get(2)?,
                end_date: row.get(3)?,
                is_active: row.get::<_, i32>(4)? == 1,
                school_id: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        Ok(year)
    })
}

pub fn close_school_year(id: &str) -> Result<SchoolYear, String> {
    with_db(|conn| {
        let rows = conn.execute(
            "UPDATE school_years SET is_active = 0 WHERE id = ?1",
            params![id],
        )?;

        if rows == 0 {
            return Err("Année scolaire non trouvée".to_string());
        }

        let mut stmt = conn.prepare(
            "SELECT id, name, start_date, end_date, is_active, school_id, created_at 
             FROM school_years 
             WHERE id = ?1",
        )?;

        let year = stmt.query_row(params![id], |row| {
            Ok(SchoolYear {
                id: row.get(0)?,
                name: row.get(1)?,
                start_date: row.get(2)?,
                end_date: row.get(3)?,
                is_active: row.get::<_, i32>(4)? == 1,
                school_id: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        Ok(year)
    })
}

pub fn delete_school_year(id: &str) -> Result<(), String> {
    with_db(|conn| {
        let rows = conn.execute("DELETE FROM school_years WHERE id = ?1", params![id])?;

        if rows == 0 {
            return Err("Année scolaire non trouvée".to_string());
        }

        Ok(())
    })
}

pub fn handle_get_school_years(school_id: &str) -> Result<Vec<SchoolYear>, String> {
    get_school_years(school_id)
}

pub fn handle_create_school_year(
    school_id: &str,
    name: &str,
    start_date: &str,
    end_date: &str,
) -> Result<SchoolYear, String> {
    create_school_year(school_id, name, start_date, end_date)
}

pub fn handle_update_school_year(
    id: &str,
    name: &str,
    start_date: &str,
    end_date: &str,
) -> Result<SchoolYear, String> {
    update_school_year(id, name, start_date, end_date)
}

pub fn handle_set_active_school_year(id: &str, school_id: &str) -> Result<SchoolYear, String> {
    set_active_school_year(id, school_id)
}

pub fn handle_close_school_year(id: &str) -> Result<SchoolYear, String> {
    close_school_year(id)
}

pub fn handle_delete_school_year(id: &str) -> Result<(), String> {
    delete_school_year(id)
}

pub fn get_guardians_by_student_id(student_id: &str) -> Result<Vec<crate::db::models::Guardian>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, student_id, name, relation, phone, profession, is_emergency_contact, created_at 
             FROM guardians 
             WHERE student_id = ?1 
             ORDER BY is_emergency_contact DESC, created_at ASC"
        )?;

        let guardians = stmt
            .query_map(params![student_id], |row| {
                Ok(crate::db::models::Guardian {
                    id: row.get(0)?,
                    student_id: row.get(1)?,
                    name: row.get(2)?,
                    relation: row.get(3)?,
                    phone: row.get(4)?,
                    profession: row.get(5)?,
                    is_emergency_contact: row.get::<_, i32>(6)? == 1,
                    created_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(guardians)
    })
}

pub fn create_guardian(
    student_id: &str,
    name: &str,
    relation: &str,
    phone: &str,
    profession: Option<&str>,
    is_emergency_contact: bool,
) -> Result<crate::db::models::Guardian, String> {
    let id = crate::db::models::generate_id();
    let created_at = crate::db::models::current_timestamp();

    with_db(|conn| {
        conn.execute(
            "INSERT INTO guardians (id, student_id, name, relation, phone, profession, is_emergency_contact, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                id,
                student_id,
                name,
                relation,
                phone,
                profession,
                if is_emergency_contact { 1 } else { 0 },
                created_at
            ],
        )?;

        Ok(crate::db::models::Guardian {
            id,
            student_id: student_id.to_string(),
            name: name.to_string(),
            relation: relation.to_string(),
            phone: phone.to_string(),
            profession: profession.map(|p| p.to_string()),
            is_emergency_contact,
            created_at,
        })
    })
}

pub fn update_guardian(
    id: &str,
    name: &str,
    relation: &str,
    phone: &str,
    profession: Option<&str>,
    is_emergency_contact: bool,
) -> Result<crate::db::models::Guardian, String> {
    with_db(|conn| {
        let rows = conn.execute(
            "UPDATE guardians SET name = ?1, relation = ?2, phone = ?3, profession = ?4, is_emergency_contact = ?5 
             WHERE id = ?6",
            params![
                name,
                relation,
                phone,
                profession,
                if is_emergency_contact { 1 } else { 0 },
                id
            ],
        )?;

        if rows == 0 {
            return Err("Responsable non trouvé".to_string());
        }

        Ok(crate::db::models::Guardian {
            id: id.to_string(),
            student_id: "".to_string(), // Will be fetched separately if needed
            name: name.to_string(),
            relation: relation.to_string(),
            phone: phone.to_string(),
            profession: profession.map(|p| p.to_string()),
            is_emergency_contact,
            created_at: "".to_string(),
        })
    })
}

pub fn delete_guardian(id: &str) -> Result<(), String> {
    with_db(|conn| {
        let rows = conn.execute("DELETE FROM guardians WHERE id = ?1", params![id])?;

        if rows == 0 {
            return Err("Responsable non trouvé".to_string());
        }

        Ok(())
    })
}

pub fn handle_get_guardians_by_student_id(student_id: &str) -> Result<Vec<crate::db::models::Guardian>, String> {
    get_guardians_by_student_id(student_id)
}

pub fn handle_create_guardian(
    student_id: &str,
    name: &str,
    relation: &str,
    phone: &str,
    profession: Option<&str>,
    is_emergency_contact: bool,
) -> Result<crate::db::models::Guardian, String> {
    create_guardian(student_id, name, relation, phone, profession, is_emergency_contact)
}

pub fn handle_update_guardian(
    id: &str,
    name: &str,
    relation: &str,
    phone: &str,
    profession: Option<&str>,
    is_emergency_contact: bool,
) -> Result<crate::db::models::Guardian, String> {
    update_guardian(id, name, relation, phone, profession, is_emergency_contact)
}

pub fn handle_delete_guardian(id: &str) -> Result<(), String> {
    delete_guardian(id)
}
