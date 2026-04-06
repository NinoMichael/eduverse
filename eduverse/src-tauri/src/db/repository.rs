use crate::db::models::{
    current_timestamp, generate_id, generate_token, hash_password, AuthResponse, LoginCredentials,
    RegisterPayload, School, User,
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
