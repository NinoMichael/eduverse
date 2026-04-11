import type { ApiResponse } from "../auth.service";
import type { SchoolYear, SchoolYearFormData } from "@/types/school-year";
import { db } from "./storage";

const SCHOOL_YEAR_COLLECTION = "school_years";

const generateId = (): string => {
	return "id_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

function getSchoolYears(): SchoolYear[] {
	return db.get<SchoolYear[]>(SCHOOL_YEAR_COLLECTION, []) ?? [];
}

function saveSchoolYear(year: SchoolYear): void {
	const years = getSchoolYears();
	const index = years.findIndex((y) => y.id === year.id);
	if (index >= 0) {
		years[index] = year;
	} else {
		years.push(year);
	}
	db.set(SCHOOL_YEAR_COLLECTION, years);
}

function saveAllSchoolYears(years: SchoolYear[]): void {
	db.set(SCHOOL_YEAR_COLLECTION, years);
}

export class MockSchoolYearService {
	async getSchoolYears(_schoolId: string): Promise<ApiResponse<SchoolYear[]>> {
		try {
			const years = getSchoolYears();
			return { success: true, data: years };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createSchoolYear(
		schoolId: string,
		data: SchoolYearFormData
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const years = getSchoolYears();
			const existingActive = years.find((y) => y.schoolId === schoolId && y.isActive);
			if (existingActive) {
				existingActive.isActive = false;
				saveSchoolYear(existingActive);
			}

			const newYear: SchoolYear = {
				id: generateId(),
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
				isActive: true,
				schoolId,
				createdAt: new Date().toISOString(),
			};
			saveSchoolYear(newYear);
			return { success: true, data: newYear };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateSchoolYear(
		id: string,
		data: SchoolYearFormData
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const years = getSchoolYears();
			const year = years.find((y) => y.id === id);
			if (!year) {
				return { success: false, error: "Année scolaire non trouvée" };
			}

			year.name = data.name;
			year.startDate = data.startDate;
			year.endDate = data.endDate;
			saveSchoolYear(year);
			return { success: true, data: year };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async setActiveSchoolYear(
		id: string,
		schoolId: string
	): Promise<ApiResponse<SchoolYear>> {
		try {
			const years = getSchoolYears();
			const year = years.find((y) => y.id === id);
			if (!year) {
				return { success: false, error: "Année scolaire non trouvée" };
			}

			years.forEach((y) => {
				if (y.schoolId === schoolId) {
					y.isActive = y.id === id;
					saveSchoolYear(y);
				}
			});

			return { success: true, data: year };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async closeSchoolYear(id: string): Promise<ApiResponse<SchoolYear>> {
		try {
			const years = getSchoolYears();
			const year = years.find((y) => y.id === id);
			if (!year) {
				return { success: false, error: "Année scolaire non trouvée" };
			}

			year.isActive = false;
			saveSchoolYear(year);
			return { success: true, data: year };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteSchoolYear(id: string): Promise<ApiResponse<void>> {
		try {
			const years = getSchoolYears();
			const filtered = years.filter((y) => y.id !== id);
			saveAllSchoolYears(filtered);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const mockSchoolYearService = new MockSchoolYearService();
