import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse } from "./auth.service";
import type { DashboardData } from "@/types/dashboard";

class DashboardService {
	async getDashboardData(): Promise<ApiResponse<DashboardData>> {
		try {
			const response = await invoke<DashboardData>("get_dashboard_data");
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}

export const dashboardService = new DashboardService();
