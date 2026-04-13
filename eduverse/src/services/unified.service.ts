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
import { studentService } from "./student.service";
import { mockStudentService } from "./mock/student.service";
import { classService } from "./class.service";
import { mockClassService } from "./mock/class.service";
import type { SchoolYear, SchoolYearFormData, SchoolYearEvent, SchoolYearEventFormData, SchoolYearConfiguration } from "@/types/school-year";
import type { Student, StudentFormData, StudentFilters, StudentStats } from "@/types/student";
import type { SchoolClass, ClassFormData } from "@/types/class";

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

	async getSchoolYearEvents(schoolYearId: string): Promise<ApiResponse<SchoolYearEvent[]>> {
		if (useMockServices) {
			return mockSchoolYearService.getSchoolYearEvents(schoolYearId);
		}
		return schoolYearService.getSchoolYearEvents(schoolYearId);
	}

	async getSchoolYearConfiguration(schoolYearId: string): Promise<ApiResponse<SchoolYearConfiguration>> {
		if (useMockServices) {
			return mockSchoolYearService.getSchoolYearConfiguration(schoolYearId);
		}
		return schoolYearService.getSchoolYearConfiguration(schoolYearId);
	}

	async createSchoolYearEvent(
		schoolYearId: string,
		data: SchoolYearEventFormData
	): Promise<ApiResponse<SchoolYearEvent>> {
		if (useMockServices) {
			return mockSchoolYearService.createSchoolYearEvent(schoolYearId, data);
		}
		return schoolYearService.createSchoolYearEvent(schoolYearId, data);
	}

	async updateSchoolYearEvent(
		id: string,
		data: SchoolYearEventFormData
	): Promise<ApiResponse<SchoolYearEvent>> {
		if (useMockServices) {
			return mockSchoolYearService.updateSchoolYearEvent(id, data);
		}
		return schoolYearService.updateSchoolYearEvent(id, data);
	}

	async deleteSchoolYearEvent(id: string): Promise<ApiResponse<void>> {
		if (useMockServices) {
			return mockSchoolYearService.deleteSchoolYearEvent(id);
		}
		return schoolYearService.deleteSchoolYearEvent(id);
	}

	async saveSchoolYearConfiguration(
		schoolYearId: string,
		events: SchoolYearEventFormData[]
	): Promise<ApiResponse<SchoolYearConfiguration>> {
		if (useMockServices) {
			return mockSchoolYearService.saveSchoolYearConfiguration(schoolYearId, events);
		}
		return schoolYearService.saveSchoolYearConfiguration(schoolYearId, events);
	}
}

class UnifiedStudentService {
	async getStudents(schoolId: string, schoolYearId: string): Promise<ApiResponse<Student[]>> {
		if (useMockServices) {
			return mockStudentService.getStudents(schoolId, schoolYearId);
		}
		return studentService.getStudents(schoolId, schoolYearId);
	}

	async getStudentById(id: string): Promise<ApiResponse<Student>> {
		if (useMockServices) {
			return mockStudentService.getStudentById(id);
		}
		return studentService.getStudentById(id);
	}

	async createStudent(
		schoolId: string,
		schoolYearId: string,
		data: StudentFormData
	): Promise<ApiResponse<Student>> {
		if (useMockServices) {
			return mockStudentService.createStudent(schoolId, schoolYearId, data);
		}
		return studentService.createStudent(schoolId, schoolYearId, data);
	}

	async updateStudent(id: string, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
		if (useMockServices) {
			return mockStudentService.updateStudent(id, data);
		}
		return studentService.updateStudent(id, data);
	}

	async deleteStudent(id: string): Promise<ApiResponse<void>> {
		if (useMockServices) {
			return mockStudentService.deleteStudent(id);
		}
		return studentService.deleteStudent(id);
	}

	async getStudentStats(schoolId: string, schoolYearId: string): Promise<ApiResponse<StudentStats>> {
		if (useMockServices) {
			return mockStudentService.getStudentStats(schoolId, schoolYearId);
		}
		return studentService.getStudentStats(schoolId, schoolYearId);
	}

	filterStudents(students: Student[], filters: StudentFilters): Student[] {
		if (useMockServices) {
			return mockStudentService.filterStudents(students, filters);
		}
		return studentService.filterStudents(students, filters);
	}
}

class UnifiedClassService {
	async getClasses(schoolId: string, schoolYearId: string): Promise<ApiResponse<SchoolClass[]>> {
		if (useMockServices) {
			return mockClassService.getClasses(schoolId, schoolYearId);
		}
		return classService.getClasses(schoolId, schoolYearId);
	}

	async getClassById(id: string): Promise<ApiResponse<SchoolClass>> {
		if (useMockServices) {
			return mockClassService.getClassById(id);
		}
		return classService.getClassById(id);
	}

	async createClass(
		schoolId: string,
		schoolYearId: string,
		data: ClassFormData
	): Promise<ApiResponse<SchoolClass>> {
		if (useMockServices) {
			return mockClassService.createClass(schoolId, schoolYearId, data);
		}
		return classService.createClass(schoolId, schoolYearId, data);
	}

	async updateClass(id: string, data: Partial<ClassFormData>): Promise<ApiResponse<SchoolClass>> {
		if (useMockServices) {
			return mockClassService.updateClass(id, data);
		}
		return classService.updateClass(id, data);
	}

	async deleteClass(id: string): Promise<ApiResponse<void>> {
		if (useMockServices) {
			return mockClassService.deleteClass(id);
		}
		return classService.deleteClass(id);
	}
}

export const unifiedAuthService = new UnifiedAuthService();
export const unifiedDashboardService = new UnifiedDashboardService();
export const unifiedActivationService = new UnifiedActivationService();
export const unifiedSchoolYearService = new UnifiedSchoolYearService();
export const unifiedStudentService = new UnifiedStudentService();
export const unifiedClassService = new UnifiedClassService();

export const isDebugMode = useMockServices;
