import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse } from "./auth.service";
import type { Guardian } from "@/types/student";

class GuardianService {
	async getGuardiansByStudentId(studentId: string): Promise<ApiResponse<Guardian[]>> {
		try {
			const response = await invoke<Guardian[]>("get_guardians_by_student_id", {
				studentId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createGuardian(
		studentId: string,
		data: Omit<Guardian, "id" | "studentId" | "createdAt">
	): Promise<ApiResponse<Guardian>> {
		try {
			const response = await invoke<Guardian>("create_guardian", {
				studentId,
				name: data.name,
				relation: data.relation,
				phone: data.phone,
				profession: data.profession || null,
				isEmergencyContact: data.isEmergencyContact,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateGuardian(
		id: string,
		data: Omit<Guardian, "id" | "studentId" | "createdAt">
	): Promise<ApiResponse<Guardian>> {
		try {
			const response = await invoke<Guardian>("update_guardian", {
				id,
				name: data.name,
				relation: data.relation,
				phone: data.phone,
				profession: data.profession || null,
				isEmergencyContact: data.isEmergencyContact,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteGuardian(id: string): Promise<ApiResponse<void>> {
		try {
			await invoke<void>("delete_guardian", { id });
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const guardianService = new GuardianService();
