import type { ApiResponse } from "../auth.service";
import type { AuthResponse, LoginCredentials, RegisterPayload, User, School } from "@/types";
import { db, STORAGE_KEYS } from "./storage";

const hashPassword = (password: string): string => {
	let hash = 0;
	for (let i = 0; i < password.length; i++) {
		const char = password.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16).padStart(64, "0");
};

const generateToken = (): string => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2);
	return hashPassword(`${timestamp}_${random}`);
};

const generateId = (): string => {
	return "id_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface StoredSchool extends School {
	passwordHash?: never;
}

interface StoredUser extends User {
	passwordHash: string;
}

const SCHOOL_COLLECTION = "schools";
const USERS_COLLECTION = "users";

function getSchools(): StoredSchool[] {
	return db.get<StoredSchool[]>(SCHOOL_COLLECTION, []) ?? [];
}

function saveSchool(school: StoredSchool): void {
	const schools = getSchools();
	const index = schools.findIndex((s) => s.id === school.id);
	if (index >= 0) {
		schools[index] = school;
	} else {
		schools.push(school);
	}
	db.set(SCHOOL_COLLECTION, schools);
}

function getUsers(): StoredUser[] {
	return db.get<StoredUser[]>(USERS_COLLECTION, []) ?? [];
}

function saveUser(user: StoredUser): void {
	const users = getUsers();
	const index = users.findIndex((u) => u.id === user.id);
	if (index >= 0) {
		users[index] = user;
	} else {
		users.push(user);
	}
	db.set(USERS_COLLECTION, users);
}

function findUserByUsername(username: string): StoredUser | undefined {
	const users = getUsers();
	return users.find((u) => u.username === username);
}

function findSchoolById(id: string): StoredSchool | undefined {
	const schools = getSchools();
	return schools.find((s) => s.id === id);
}

function getOrCreateDefaultSchool(): StoredSchool {
	const schools = getSchools();
	if (schools.length > 0) {
		return schools[0];
	}
	const school: StoredSchool = {
		id: "school_1",
		name: " Lycée Moderne Antananarivo",
		address: "Analakely, Antananarivo 101",
		type: "high_school",
		createdAt: new Date().toISOString(),
	};
	saveSchool(school);
	
	const currentYear = new Date().getFullYear();
	const defaultYears = [
		{
			id: "year_1",
			name: `${currentYear}-${currentYear + 1}`,
			startDate: `${currentYear}-01-10`,
			endDate: `${currentYear + 1}-11-30`,
			isActive: true,
			schoolId: school.id,
			createdAt: new Date().toISOString(),
		},
		{
			id: "year_2",
			name: `${currentYear - 1}-${currentYear}`,
			startDate: `${currentYear - 1}-01-10`,
			endDate: `${currentYear}-11-30`,
			isActive: false,
			schoolId: school.id,
			createdAt: new Date().toISOString(),
		},
	];
	db.set("school_years", defaultYears);
	
	return school;
}

function createSchool(name: string, address: string, type: string): StoredSchool {
	const school: StoredSchool = {
		id: generateId(),
		name,
		address,
		type: type as School["type"],
		createdAt: new Date().toISOString(),
	};
	saveSchool(school);
	return school;
}

function createUser(
	username: string,
	password: string,
	schoolId: string,
	role: string
): StoredUser {
	const user: StoredUser = {
		id: generateId(),
		username,
		passwordHash: hashPassword(password),
		schoolId,
		role: role as User["role"],
		createdAt: new Date().toISOString(),
	};
	saveUser(user);
	return user;
}

export class MockAuthService {
	async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
		try {
			const user = findUserByUsername(credentials.identifier);
			if (!user) {
				return { success: false, error: "Identifiant ou mot de passe incorrect" };
			}

			if (user.passwordHash !== hashPassword(credentials.password)) {
				return { success: false, error: "Identifiant ou mot de passe incorrect" };
			}

			const school = findSchoolById(user.schoolId);
			if (!school) {
				return { success: false, error: "École associée introuvable" };
			}

			const { passwordHash: _, ...safeUser } = user;
			const token = generateToken();
			localStorage.setItem(STORAGE_KEYS.TOKEN, token);

			return {
				success: true,
				data: {
					user: safeUser,
					school,
					token,
				},
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
		try {
			if (findUserByUsername(payload.user.username)) {
				return { success: false, error: "Ce nom d'utilisateur existe déjà" };
			}

			const school = createSchool(
				payload.school.name,
				payload.school.address,
				payload.school.type
			);

			const user = createUser(
				payload.user.username,
				payload.user.password,
				school.id,
				"admin"
			);

			const { passwordHash: _, ...safeUser } = user;
			const token = generateToken();
			localStorage.setItem(STORAGE_KEYS.TOKEN, token);
			localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, "true");

			return {
				success: true,
				data: {
					user: safeUser,
					school,
					token,
				},
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async logout(): Promise<ApiResponse<void>> {
		try {
			localStorage.removeItem(STORAGE_KEYS.TOKEN);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async checkSession(): Promise<ApiResponse<AuthResponse>> {
		const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
		console.log('[MockAuthService] checkSession - token:', token ? 'exists' : 'none');
		
		if (!token) {
			return { success: false, error: "No active session" };
		}

		const users = getUsers();
		console.log('[MockAuthService] checkSession - users:', users.length);

		if (users.length === 0) {
			const school = getOrCreateDefaultSchool();
			console.log('[MockAuthService] checkSession - created default school:', school.id, school.name);
			const defaultUser = createUser("admin", "password", school.id, "admin");
			console.log('[MockAuthService] checkSession - created default user');
			const { passwordHash: _, ...safeUser } = defaultUser;
			return {
				success: true,
				data: {
					user: safeUser,
					school,
					token,
				},
			};
		}

		const user = users[0];
		const school = findSchoolById(user.schoolId) || getOrCreateDefaultSchool();
		const { passwordHash: _, ...safeUser } = user;
		return {
			success: true,
			data: {
				user: safeUser,
				school,
				token,
			},
		};
	}
}

export const mockAuthService = new MockAuthService();
