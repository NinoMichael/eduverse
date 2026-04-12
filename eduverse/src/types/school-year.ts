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

export type EventType = "period" | "event" | "vacation";

export interface SchoolYearEvent {
	id: string;
	schoolYearId: string;
	type: EventType;
	name: string;
	startDate: string;
	endDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SchoolYearEventFormData {
	type: EventType;
	name: string;
	startDate: string;
	endDate: string | null;
}

export interface SchoolYearConfiguration {
	schoolYearId: string;
	periods: SchoolYearEvent[];
	events: SchoolYearEvent[];
	vacations: SchoolYearEvent[];
}
