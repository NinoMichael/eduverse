export interface School {
	id: string;
	name: string;
	address: string;
	type: SchoolType;
	createdAt: string;
}

export type SchoolType = "preschool" | "primary" | "secondary" | "high_school";

export const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
	{ value: "preschool", label: "Préscolaire" },
	{ value: "primary", label: "École Primaire" },
	{ value: "secondary", label: "Collège" },
	{ value: "high_school", label: "Lycée" },
];

export interface User {
	id: string;
	username: string;
	schoolId: string;
	role: UserRole;
	createdAt: string;
}

export type UserRole =
	| "admin"
	| "director"
	| "secretary"
	| "teacher"
	| "accountant";

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	school: School | null;
	token: string | null;
}

export interface LoginCredentials {
	identifier: string;
	password: string;
}

export interface RegisterSchoolData {
	name: string;
	address: string;
	type: SchoolType;
}

export interface RegisterUserData {
	username: string;
	password: string;
	confirmPassword: string;
}

export interface RegisterPayload {
	school: RegisterSchoolData;
	user: Omit<RegisterUserData, "confirmPassword">;
}

export interface AuthResponse {
	user: User;
	school: School;
	token: string;
}
