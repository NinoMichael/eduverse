import type { ApiResponse } from "../auth.service";
import type { DashboardData } from "@/types/dashboard";
import { db } from "./storage";

const DASHBOARD_COLLECTION = "dashboard_data";

const generateDashboardData = (): DashboardData => {
	const storedData = db.get<DashboardData>(DASHBOARD_COLLECTION, null);
	if (storedData) {
		return storedData;
	}
	
	return {
		stats: {
			currentYear: "2025-2026",
			totalStudents: 0,
			totalClasses: 0,
			totalTeachers: 0,
		},
		schoolYear: {
			id: "1",
			name: "2025-2026",
			startDate: "2025-09-01",
			endDate: "2026-06-30",
			isActive: true,
		},
		schedules: [],
	};
};

export class MockDashboardService {

	async getDashboardData(schoolId: string): Promise<ApiResponse<DashboardData>> {
		try {
			console.log('[MockDashboardService] getDashboardData called with schoolId:', schoolId);
			
			let data = generateDashboardData();
			
			const students = db.get<any[]>("students", []) ?? [];
			console.log('[MockDashboardService] Found students in DB:', students.length);
			const totalStudents = students.length;
			
			const uniqueClasses = new Set<string>();
			students.forEach((s) => {
				if (s.className) {
					uniqueClasses.add(s.className);
				}
			});
			
			console.log('[MockDashboardService] Unique classes:', uniqueClasses.size);
			
			const schoolYears = db.get<any[]>("school_years", []) ?? [];
			const activeYear = schoolYears.find((y: any) => y.isActive);
			
			data = {
				...data,
				stats: {
					...data.stats,
					totalStudents,
					totalClasses: uniqueClasses.size || 14,
					totalTeachers: 25,
				},
				schoolYear: activeYear ? {
					id: activeYear.id,
					name: activeYear.name,
					startDate: activeYear.startDate,
					endDate: activeYear.endDate,
					isActive: true,
				} : data.schoolYear,
			};
			
			db.set(DASHBOARD_COLLECTION, data);
			
			return { success: true, data };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	refreshData(): void {
		db.remove(DASHBOARD_COLLECTION);
	}
}

export const mockDashboardService = new MockDashboardService();
