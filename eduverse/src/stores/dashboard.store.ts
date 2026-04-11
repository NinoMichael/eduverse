import { defineStore } from "pinia";
import { ref } from "vue";
import { unifiedDashboardService } from "@/services/unified.service";
import type { DashboardData, DashboardStats } from "@/types/dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
	const stats = ref<DashboardStats | null>(null);
	const recentStudents = ref<DashboardData["recentStudents"]>([]);
	const levelDistribution = ref<DashboardData["levelDistribution"]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	async function fetchDashboardData(): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedDashboardService.getDashboardData();

		if (response.success && response.data) {
			stats.value = response.data.stats;
			recentStudents.value = response.data.recentStudents;
			levelDistribution.value = response.data.levelDistribution;
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors du chargement des données";
		isLoading.value = false;
		return false;
	}

	function clearError() {
		error.value = null;
	}

	return {
		stats,
		recentStudents,
		levelDistribution,
		isLoading,
		error,
		fetchDashboardData,
		clearError,
	};
});
