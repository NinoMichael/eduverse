export type SchoolYearStatus = "planned" | "in_progress" | "closed";

export interface SchoolYear {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	isActive: boolean;
	schoolId: string;
	createdAt: string;
}

export interface SchoolYearFormData {
	name: string;
	startDate: string;
	endDate: string;
}
