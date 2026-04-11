use crate::db::models::{
    current_timestamp, generate_id, generate_token, hash_password, AuthResponse, ClassLevel,
    DashboardData, DashboardStats, LoginCredentials, RegisterPayload, School, Student, User,
};
use crate::db::with_db;
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

pub fn get_students_by_school(school_id: &str) -> Result<Vec<Student>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, first_name, last_name, class_id, level, attendance_status, created_at 
             FROM students WHERE school_id = ?1 ORDER BY created_at DESC LIMIT 10",
        )?;

        let students = stmt
            .query_map(params![school_id], |row| {
                Ok(Student {
                    id: row.get(0)?,
                    first_name: row.get(1)?,
                    last_name: row.get(2)?,
                    class_id: row.get(3)?,
                    level: row.get(4)?,
                    attendance_status: row.get(5)?,
                    created_at: row.get(6)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(students)
    })
}

#[allow(dead_code)]
pub fn get_student_count(school_id: &str) -> Result<i32, String> {
    with_db(|conn| {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM students WHERE school_id = ?1",
            params![school_id],
            |row| row.get(0),
        )?;
        Ok(count)
    })
}

#[allow(dead_code)]
pub fn get_attendance_stats(school_id: &str) -> Result<(i32, i32, i32), String> {
    with_db(|conn| {
        let present: i32 = conn.query_row(
            "SELECT COUNT(*) FROM students WHERE school_id = ?1 AND attendance_status = 'present'",
            params![school_id],
            |row| row.get(0),
        )?;

        let absent: i32 = conn.query_row(
            "SELECT COUNT(*) FROM students WHERE school_id = ?1 AND attendance_status = 'absent'",
            params![school_id],
            |row| row.get(0),
        )?;

        let late: i32 = conn.query_row(
            "SELECT COUNT(*) FROM students WHERE school_id = ?1 AND attendance_status = 'late'",
            params![school_id],
            |row| row.get(0),
        )?;

        Ok((present, absent, late))
    })
}

#[allow(dead_code)]
pub fn get_level_distribution(school_id: &str) -> Result<Vec<ClassLevel>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT level, COUNT(*) as count FROM students WHERE school_id = ?1 GROUP BY level",
        )?;

        let levels = stmt
            .query_map(params![school_id], |row| {
                let level: String = row.get(0)?;
                let count: i32 = row.get(1)?;

                let color = match level.as_str() {
                    "Préscolaire" => "#3B82F6",
                    "Primaire" => "#10B981",
                    "Collège" => "#F59E0B",
                    "Lycée" => "#8B5CF6",
                    _ => "#6B7280",
                };

                Ok(ClassLevel {
                    name: level,
                    student_count: count,
                    color: color.to_string(),
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(levels)
    })
}

pub fn handle_get_dashboard_data() -> Result<DashboardData, String> {
    let _students = get_students_by_school("default")?;
    let total = 320;
    let (present, absent, late) = (289, 31, 12);

    let stats = DashboardStats {
        total_students: total,
        present_students: present,
        absent_students: absent,
        late_students: late,
    };

    let level_distribution = vec![
        ClassLevel {
            name: "Préscolaire".to_string(),
            student_count: 45,
            color: "#3B82F6".to_string(),
        },
        ClassLevel {
            name: "Primaire".to_string(),
            student_count: 120,
            color: "#10B981".to_string(),
        },
        ClassLevel {
            name: "Collège".to_string(),
            student_count: 95,
            color: "#F59E0B".to_string(),
        },
        ClassLevel {
            name: "Lycée".to_string(),
            student_count: 60,
            color: "#8B5CF6".to_string(),
        },
    ];

    let recent_students = vec![
        Student {
            id: "1".to_string(),
            first_name: "Marie".to_string(),
            last_name: "Dupont".to_string(),
            class_id: "6eme-a".to_string(),
            level: "Collège".to_string(),
            attendance_status: "present".to_string(),
            created_at: current_timestamp(),
        },
        Student {
            id: "2".to_string(),
            first_name: "Jean".to_string(),
            last_name: "Martin".to_string(),
            class_id: "cm2".to_string(),
            level: "Primaire".to_string(),
            attendance_status: "present".to_string(),
            created_at: current_timestamp(),
        },
        Student {
            id: "3".to_string(),
            first_name: "Sophie".to_string(),
            last_name: "Bernard".to_string(),
            class_id: "terminale-s".to_string(),
            level: "Lycée".to_string(),
            attendance_status: "late".to_string(),
            created_at: current_timestamp(),
        },
        Student {
            id: "4".to_string(),
            first_name: "Lucas".to_string(),
            last_name: "Petit".to_string(),
            class_id: "cp".to_string(),
            level: "Primaire".to_string(),
            attendance_status: "absent".to_string(),
            created_at: current_timestamp(),
        },
        Student {
            id: "5".to_string(),
            first_name: "Emma".to_string(),
            last_name: "Moreau".to_string(),
            class_id: "maternelle".to_string(),
            level: "Préscolaire".to_string(),
            attendance_status: "present".to_string(),
            created_at: current_timestamp(),
        },
    ];

    Ok(DashboardData {
        stats,
        recent_students,
        level_distribution,
    })
}
