import type { ApiResponse } from "../auth.service";
import type { DashboardData } from "@/types/dashboard";

const generateDashboardData = (): DashboardData => {
	return {
		stats: {
			currentYear: "2025-2026",
			totalStudents: 320,
			totalClasses: 18,
			totalTeachers: 25,
		},
		schoolYear: {
			id: "1",
			name: "2025-2026",
			startDate: "2025-09-01",
			endDate: "2026-06-30",
			isActive: true,
		},
		schedules: [
			{
				id: "1",
				className: "6ème A",
				teacherName: "Marie Dupont",
				subject: "Mathématiques",
				startTime: "08:00",
				endTime: "09:00",
				dayOfWeek: 5,
			},
			{
				id: "2",
				className: "CM2",
				teacherName: "Jean Martin",
				subject: "Français",
				startTime: "09:15",
				endTime: "10:15",
				dayOfWeek: 5,
			},
			{
				id: "3",
				className: "Terminale S",
				teacherName: "Sophie Bernard",
				subject: "Physique-Chimie",
				startTime: "10:30",
				endTime: "11:30",
				dayOfWeek: 5,
			},
		],
	};
};

export class MockDashboardService {
	private cachedData: DashboardData | null = null;

	async getDashboardData(_schoolId: string): Promise<ApiResponse<DashboardData>> {
		try {
			if (!this.cachedData) {
				this.cachedData = generateDashboardData();
			}
			return { success: true, data: this.cachedData };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	refreshData(): void {
		this.cachedData = null;
	}
}

export const mockDashboardService = new MockDashboardService();
