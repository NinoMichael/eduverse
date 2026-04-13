import type { ApiResponse } from "../auth.service";
import type { SchoolClass, ClassFormData } from "@/types/class";
import { db } from "./storage";

const CLASSES_COLLECTION = "classes";

const generateId = (): string => {
	return "class_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const getClasses = (): SchoolClass[] => {
	return db.get<SchoolClass[]>(CLASSES_COLLECTION, []) ?? [];
};

const saveClass = (schoolClass: SchoolClass): void => {
	const classes = getClasses();
	const index = classes.findIndex((c) => c.id === schoolClass.id);
	if (index >= 0) {
		classes[index] = schoolClass;
	} else {
		classes.push(schoolClass);
	}
	db.set(CLASSES_COLLECTION, classes);
};

const mockClasses: Omit<SchoolClass, "id" | "createdAt" | "updatedAt">[] = [
	{ schoolId: "", schoolYearId: "", name: "6ème Primaire", level: "primary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "5ème Primaire", level: "primary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "CM1", level: "primary", capacity: 35, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "CM2", level: "primary", capacity: 35, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "6ème Secondaire", level: "secondary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "5ème Secondaire", level: "secondary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "4ème Secondaire", level: "secondary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "3ème Secondaire", level: "secondary", capacity: 40, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Seconde", level: "secondary", capacity: 35, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Première L", level: "secondary", capacity: 30, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Première S", level: "secondary", capacity: 30, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Terminale L", level: "terminale", capacity: 30, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Terminale S", level: "terminale", capacity: 30, currentStudents: 0 },
	{ schoolId: "", schoolYearId: "", name: "Terminale ES", level: "terminale", capacity: 30, currentStudents: 0 },
];

export class MockClassService {
	async getClasses(schoolId: string, schoolYearId: string): Promise<ApiResponse<SchoolClass[]>> {
		try {
			let classes = getClasses();

			if (classes.length === 0) {
				classes = mockClasses.map((c) => ({
					...c,
					schoolId,
					schoolYearId,
					id: generateId(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}));
				db.set(CLASSES_COLLECTION, classes);
			}

			const filtered = classes.filter(
				(c) => c.schoolId === schoolId && c.schoolYearId === schoolYearId
			);

			return { success: true, data: filtered };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getClassById(id: string): Promise<ApiResponse<SchoolClass>> {
		try {
			const classes = getClasses();
			const schoolClass = classes.find((c) => c.id === id);

			if (!schoolClass) {
				return { success: false, error: "Classe non trouvée" };
			}

			return { success: true, data: schoolClass };
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
			const newClass: SchoolClass = {
				id: generateId(),
				schoolId,
				schoolYearId,
				name: data.name,
				level: data.level,
				capacity: data.capacity,
				currentStudents: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			saveClass(newClass);
			return { success: true, data: newClass };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateClass(id: string, data: Partial<ClassFormData>): Promise<ApiResponse<SchoolClass>> {
		try {
			const classes = getClasses();
			const schoolClass = classes.find((c) => c.id === id);

			if (!schoolClass) {
				return { success: false, error: "Classe non trouvée" };
			}

			const updated: SchoolClass = {
				...schoolClass,
				...data,
				updatedAt: new Date().toISOString(),
			};

			saveClass(updated);
			return { success: true, data: updated };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteClass(id: string): Promise<ApiResponse<void>> {
		try {
			const classes = getClasses();
			const filtered = classes.filter((c) => c.id !== id);
			db.set(CLASSES_COLLECTION, filtered);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const mockClassService = new MockClassService();