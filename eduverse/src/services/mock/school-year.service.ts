import type { ApiResponse } from "../auth.service";
import type { SchoolYear, SchoolYearFormData, SchoolYearEvent, SchoolYearEventFormData, SchoolYearConfiguration } from "@/types/school-year";
import { db } from "./storage";

const SCHOOL_YEAR_COLLECTION = "school_years";
const SCHOOL_YEAR_EVENTS_COLLECTION = "school_year_events";

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

function getSchoolYearEvents(): SchoolYearEvent[] {
	return db.get<SchoolYearEvent[]>(SCHOOL_YEAR_EVENTS_COLLECTION, []) ?? [];
}

function saveSchoolYearEvent(event: SchoolYearEvent): void {
	const events = getSchoolYearEvents();
	const index = events.findIndex((e) => e.id === event.id);
	if (index >= 0) {
		events[index] = event;
	} else {
		events.push(event);
	}
	db.set(SCHOOL_YEAR_EVENTS_COLLECTION, events);
}

function saveAllSchoolYearEvents(events: SchoolYearEvent[]): void {
	db.set(SCHOOL_YEAR_EVENTS_COLLECTION, events);
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

	async getSchoolYearEvents(schoolYearId: string): Promise<ApiResponse<SchoolYearEvent[]>> {
		try {
			const events = getSchoolYearEvents().filter((e) => e.schoolYearId === schoolYearId);
			return { success: true, data: events };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getSchoolYearConfiguration(schoolYearId: string): Promise<ApiResponse<SchoolYearConfiguration>> {
		try {
			const events = getSchoolYearEvents().filter((e) => e.schoolYearId === schoolYearId);
			return {
				success: true,
				data: {
					schoolYearId,
					periods: events.filter((e) => e.type === "period"),
					events: events.filter((e) => e.type === "event"),
					vacations: events.filter((e) => e.type === "vacation"),
				},
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createSchoolYearEvent(
		schoolYearId: string,
		data: SchoolYearEventFormData
	): Promise<ApiResponse<SchoolYearEvent>> {
		try {
			const newEvent: SchoolYearEvent = {
				id: generateId(),
				schoolYearId,
				type: data.type,
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			saveSchoolYearEvent(newEvent);
			return { success: true, data: newEvent };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateSchoolYearEvent(
		id: string,
		data: SchoolYearEventFormData
	): Promise<ApiResponse<SchoolYearEvent>> {
		try {
			const events = getSchoolYearEvents();
			const event = events.find((e) => e.id === id);
			if (!event) {
				return { success: false, error: "Événement non trouvé" };
			}

			event.type = data.type;
			event.name = data.name;
			event.startDate = data.startDate;
			event.endDate = data.endDate;
			event.updatedAt = new Date().toISOString();
			saveSchoolYearEvent(event);
			return { success: true, data: event };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteSchoolYearEvent(id: string): Promise<ApiResponse<void>> {
		try {
			const events = getSchoolYearEvents();
			const filtered = events.filter((e) => e.id !== id);
			saveAllSchoolYearEvents(filtered);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async saveSchoolYearConfiguration(
		schoolYearId: string,
		eventsData: SchoolYearEventFormData[]
	): Promise<ApiResponse<SchoolYearConfiguration>> {
		try {
			const existingEvents = getSchoolYearEvents().filter(
				(e) => e.schoolYearId !== schoolYearId
			);

			const newEvents: SchoolYearEvent[] = eventsData.map((data) => ({
				id: generateId(),
				schoolYearId,
				type: data.type,
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}));

			saveAllSchoolYearEvents([...existingEvents, ...newEvents]);

			return {
				success: true,
				data: {
					schoolYearId,
					periods: newEvents.filter((e) => e.type === "period"),
					events: newEvents.filter((e) => e.type === "event"),
					vacations: newEvents.filter((e) => e.type === "vacation"),
				},
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const mockSchoolYearService = new MockSchoolYearService();
