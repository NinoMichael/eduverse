export type ClassLevel = "primary" | "secondary" | "terminale";

export interface SchoolClass {
	id: string;
	schoolId: string;
	schoolYearId: string;
	name: string;
	level: ClassLevel;
	capacity: number;
	currentStudents: number;
	createdAt: string;
	updatedAt: string;
}

export interface ClassFormData {
	name: string;
	level: ClassLevel;
	capacity: number;
}