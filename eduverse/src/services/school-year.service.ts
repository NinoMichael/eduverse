import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse } from "./auth.service";
import type { SchoolYear, SchoolYearFormData } from "@/types/school-year";

class SchoolYearService {
	async getSchoolYears(schoolId: string): Promise<ApiResponse<SchoolYear[]>> {
		try {
			const response = await invoke<SchoolYear[]>("get_school_years", {
				schoolId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createSchoolYear(
		schoolId: string,
		data: SchoolYearFormData
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const response = await invoke<SchoolYear>("create_school_year", {
				schoolId,
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateSchoolYear(
		id: string,
		data: SchoolYearFormData
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const response = await invoke<SchoolYear>("update_school_year", {
				id,
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async setActiveSchoolYear(
		id: string,
		schoolId: string
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const response = await invoke<SchoolYear>("set_active_school_year", {
				id,
				schoolId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async closeSchoolYear(id: string): Promise<ApiResponse<SchoolYear>> {
		try {
			const response = await invoke<SchoolYear>("close_school_year", { id });
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteSchoolYear(id: string): Promise<ApiResponse<void>> {
		try {
			await invoke<void>("delete_school_year", { id });
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const schoolYearService = new SchoolYearService();
