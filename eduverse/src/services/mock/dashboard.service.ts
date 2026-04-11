import type { ApiResponse } from "../auth.service";
import type { DashboardData } from "@/types/dashboard";

const generateDashboardData = (): DashboardData => {
	const now = new Date().toISOString();

	return {
		stats: {
			totalStudents: 320,
			presentStudents: 289,
			absentStudents: 31,
			lateStudents: 12,
		},
		recentStudents: [
			{
				id: "1",
				firstName: "Marie",
				lastName: "Dupont",
				className: "6ème A",
				level: "Collège",
				attendanceStatus: "present",
				createdAt: now,
			},
			{
				id: "2",
				firstName: "Jean",
				lastName: "Martin",
				className: "CM2",
				level: "Primaire",
				attendanceStatus: "present",
				createdAt: now,
			},
			{
				id: "3",
				firstName: "Sophie",
				lastName: "Bernard",
				className: "Terminale S",
				level: "Lycée",
				attendanceStatus: "late",
				createdAt: now,
			},
			{
				id: "4",
				firstName: "Lucas",
				lastName: "Petit",
				className: "CP",
				level: "Primaire",
				attendanceStatus: "absent",
				createdAt: now,
			},
			{
				id: "5",
				firstName: "Emma",
				lastName: "Moreau",
				className: "Maternelle",
				level: "Préscolaire",
				attendanceStatus: "present",
				createdAt: now,
			},
		],
		levelDistribution: [
			{ name: "Préscolaire", studentCount: 45, color: "#3B82F6" },
			{ name: "Primaire", studentCount: 120, color: "#10B981" },
			{ name: "Collège", studentCount: 95, color: "#F59E0B" },
			{ name: "Lycée", studentCount: 60, color: "#8B5CF6" },
		],
	};
};

export class MockDashboardService {
	private cachedData: DashboardData | null = null;

	async getDashboardData(): Promise<ApiResponse<DashboardData>> {
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
