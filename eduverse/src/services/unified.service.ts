import { isRunningInTauri } from "./mock/storage";
import { authService, type ApiResponse } from "./auth.service";
import { mockAuthService } from "./mock/auth.service";
import type { AuthResponse, LoginCredentials, RegisterPayload } from "@/types";
import { activationService, type LicenseData, type ActivationResponse } from "./activation.service";
import { dashboardService } from "./dashboard.service";
import { mockDashboardService } from "./mock/dashboard.service";
import type { DashboardData } from "@/types/dashboard";
import { schoolYearService } from "./school-year.service";
import { mockSchoolYearService } from "./mock/school-year.service";
import type { SchoolYear, SchoolYearFormData } from "@/types/school-year";

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
	async getDashboardData(schoolId: string): Promise<ApiResponse<DashboardData>> {
		if (useMockServices) {
			return mockDashboardService.getDashboardData(schoolId);
		}
		return dashboardService.getDashboardData(schoolId);
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

class UnifiedSchoolYearService {
	async getSchoolYears(schoolId: string): Promise<ApiResponse<SchoolYear[]>> {
		if (useMockServices) {
			return mockSchoolYearService.getSchoolYears(schoolId);
		}
		return schoolYearService.getSchoolYears(schoolId);
	}

	async createSchoolYear(schoolId: string, data: SchoolYearFormData): Promise<ApiResponse<SchoolYear>> {
		if (useMockServices) {
			return mockSchoolYearService.createSchoolYear(schoolId, data);
		}
		return schoolYearService.createSchoolYear(schoolId, data);
	}

	async updateSchoolYear(id: string, data: SchoolYearFormData): Promise<ApiResponse<SchoolYear>> {
		if (useMockServices) {
			return mockSchoolYearService.updateSchoolYear(id, data);
		}
		return schoolYearService.updateSchoolYear(id, data);
	}

	async setActiveSchoolYear(id: string, schoolId: string): Promise<ApiResponse<SchoolYear>> {
		if (useMockServices) {
			return mockSchoolYearService.setActiveSchoolYear(id, schoolId);
		}
		return schoolYearService.setActiveSchoolYear(id, schoolId);
	}

	async closeSchoolYear(id: string): Promise<ApiResponse<SchoolYear>> {
		if (useMockServices) {
			return mockSchoolYearService.closeSchoolYear(id);
		}
		return schoolYearService.closeSchoolYear(id);
	}

	async deleteSchoolYear(id: string): Promise<ApiResponse<void>> {
		if (useMockServices) {
			return mockSchoolYearService.deleteSchoolYear(id);
		}
		return schoolYearService.deleteSchoolYear(id);
	}
}

export const unifiedAuthService = new UnifiedAuthService();
export const unifiedDashboardService = new UnifiedDashboardService();
export const unifiedActivationService = new UnifiedActivationService();
export const unifiedSchoolYearService = new UnifiedSchoolYearService();

export const isDebugMode = useMockServices;
