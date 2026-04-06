import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services";
import type {
	User,
	School,
	LoginCredentials,
	RegisterPayload,
	AuthResponse,
} from "@/types";

export const useAuthStore = defineStore("auth", () => {
	const user = ref<User | null>(null);
	const school = ref<School | null>(null);
	const token = ref<string | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const isAuthenticated = computed(() => !!token.value && !!user.value);

	async function login(credentials: LoginCredentials): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await authService.login(credentials);

		if (response.success && response.data) {
			setSession(response.data);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur de connexion";
		isLoading.value = false;
		return false;
	}

	async function register(payload: RegisterPayload): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await authService.register(payload);

		if (response.success && response.data) {
			setSession(response.data);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur d'inscription";
		isLoading.value = false;
		return false;
	}

	function setSession(data: AuthResponse) {
		user.value = data.user;
		school.value = data.school;
		token.value = data.token;
		localStorage.setItem("eduverse_token", data.token);
	}

	function logout() {
		authService.logout();
		user.value = null;
		school.value = null;
		token.value = null;
		localStorage.removeItem("eduverse_token");
	}

	async function checkSession(): Promise<boolean> {
		const savedToken = localStorage.getItem("eduverse_token");
		if (!savedToken) return false;

		token.value = savedToken;
		const response = await authService.checkSession();

		if (response.success && response.data) {
			setSession(response.data);
			return true;
		}

		logout();
		return false;
	}

	function clearError() {
		error.value = null;
	}

	return {
		user,
		school,
		token,
		isLoading,
		error,
		isAuthenticated,
		login,
		register,
		logout,
		checkSession,
		clearError,
	};
});
