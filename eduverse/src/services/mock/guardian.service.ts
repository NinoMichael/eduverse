import type { ApiResponse } from "../auth.service";
import type { Guardian } from "@/types/student";
import { db } from "./storage";

const GUARDIANS_COLLECTION = "guardians";

const generateId = (): string => {
	return "id_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const getGuardians = (): Guardian[] => {
	return db.get<Guardian[]>(GUARDIANS_COLLECTION, []) ?? [];
};

const saveGuardians = (guardians: Guardian[]): void => {
	db.set(GUARDIANS_COLLECTION, guardians);
};

export class MockGuardianService {
	async getGuardiansByStudentId(studentId: string): Promise<ApiResponse<Guardian[]>> {
		try {
			const guardians = getGuardians();
			const filtered = guardians.filter((g) => g.studentId === studentId);
			return { success: true, data: filtered };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createGuardian(
		studentId: string,
		data: Omit<Guardian, "id" | "studentId" | "createdAt">
	): Promise<ApiResponse<Guardian>> {
		try {
			const newGuardian: Guardian = {
				id: generateId(),
				studentId,
				...data,
				createdAt: new Date().toISOString(),
			};
			
			const guardians = getGuardians();
			guardians.push(newGuardian);
			saveGuardians(guardians);
			
			return { success: true, data: newGuardian };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateGuardian(
		id: string,
		data: Omit<Guardian, "id" | "studentId" | "createdAt">
	): Promise<ApiResponse<Guardian>> {
		try {
			const guardians = getGuardians();
			const index = guardians.findIndex((g) => g.id === id);
			
			if (index === -1) {
				return { success: false, error: "Responsable non trouvé" };
			}
			
			guardians[index] = {
				...guardians[index],
				...data,
			};
			
			saveGuardians(guardians);
			return { success: true, data: guardians[index] };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteGuardian(id: string): Promise<ApiResponse<void>> {
		try {
			let guardians = getGuardians();
			guardians = guardians.filter((g) => g.id !== id);
			saveGuardians(guardians);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const mockGuardianService = new MockGuardianService();
