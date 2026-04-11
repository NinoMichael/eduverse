import { isRunningInTauri } from "./mock/storage";
import { authService, type ApiResponse } from "./auth.service";
import { mockAuthService } from "./mock/auth.service";
import type { AuthResponse, LoginCredentials, RegisterPayload } from "@/types";
import { activationService, type LicenseData, type ActivationResponse } from "./activation.service";
import { dashboardService } from "./dashboard.service";
import { mockDashboardService } from "./mock/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

const useMockServices = !isRunningInTauri();

class UnifiedAuthService {
	async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
		if (useMockServices) {
			return mockAuthService.login(credentials);
		}
		return authService.login(credentials);
	}

	async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
		if (useMockServices) {
			return mockAuthService.register(payload);
		}
		return authService.register(payload);
	}

	async logout(): Promise<ApiResponse<void>> {
		if (useMockServices) {
			return mockAuthService.logout();
		}
		return authService.logout();
	}

	async checkSession(): Promise<ApiResponse<AuthResponse>> {
		if (useMockServices) {
			return mockAuthService.checkSession();
		}
		return authService.checkSession();
	}
}

class UnifiedDashboardService {
	async getDashboardData(): Promise<ApiResponse<DashboardData>> {
		if (useMockServices) {
			return mockDashboardService.getDashboardData();
		}
		return dashboardService.getDashboardData();
	}
}

class UnifiedActivationService {
	async activate(privateKey: string): Promise<ActivationResponse> {
		return activationService.activate(privateKey);
	}

	getLicense(): LicenseData | null {
		return activationService.getLicense();
	}

	isActivated(): boolean {
		return activationService.isActivated();
	}

	deactivate(): void {
		return activationService.deactivate();
	}
}

export const unifiedAuthService = new UnifiedAuthService();
export const unifiedDashboardService = new UnifiedDashboardService();
export const unifiedActivationService = new UnifiedActivationService();

export const isDebugMode = useMockServices;
