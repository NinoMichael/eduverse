import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse } from "./auth.service";
import type { SchoolClass, ClassFormData } from "@/types/class";

class ClassService {
	async getClasses(schoolId: string, schoolYearId: string): Promise<ApiResponse<SchoolClass[]>> {
		try {
			const response = await invoke<SchoolClass[]>("get_classes", {
				schoolId,
				schoolYearId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getClassById(id: string): Promise<ApiResponse<SchoolClass>> {
		try {
			const response = await invoke<SchoolClass>("get_class_by_id", { id });
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createClass(
		schoolId: string,
		schoolYearId: string,
		data: ClassFormData
	): Promise<ApiResponse<SchoolClass>> {
		try {
			const response = await invoke<SchoolClass>("create_class", {
				schoolId,
				schoolYearId,
				name: data.name,
				level: data.level,
				capacity: data.capacity,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateClass(id: string, data: Partial<ClassFormData>): Promise<ApiResponse<SchoolClass>> {
		try {
			const response = await invoke<SchoolClass>("update_class", {
				id,
				...data,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteClass(id: string): Promise<ApiResponse<void>> {
		try {
			await invoke<void>("delete_class", { id });
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const classService = new ClassService();