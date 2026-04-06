import { invoke } from "@tauri-apps/api/core";
import type {
	LoginCredentials,
	RegisterPayload,
	School,
	User,
} from "@/types";

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface AuthResponse {
	user: User;
	school: School;
	token: string;
}

class AuthService {
	async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
		try {
			const response = await invoke<AuthResponse>("login", { credentials });
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
		try {
			const response = await invoke<AuthResponse>("register", { payload });
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async logout(): Promise<ApiResponse<void>> {
		try {
			await invoke("logout");
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async checkSession(): Promise<ApiResponse<AuthResponse>> {
		try {
			const response = await invoke<AuthResponse>("check_session");
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const authService = new AuthService();
