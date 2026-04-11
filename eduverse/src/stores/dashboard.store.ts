import { defineStore } from "pinia";
import { ref } from "vue";
import { unifiedDashboardService } from "@/services/unified.service";
import { useAuthStore } from "./auth.store";
import type { DashboardStats, ScheduleItem, SchoolYear } from "@/types/dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
	const stats = ref<DashboardStats | null>(null);
	const schoolYear = ref<SchoolYear | null>(null);
	const schedules = ref<ScheduleItem[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	async function fetchDashboardData(): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolId = authStore.school?.id;

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedDashboardService.getDashboardData(schoolId);

		if (response.success && response.data) {
			stats.value = response.data.stats;
			schoolYear.value = response.data.schoolYear;
			schedules.value = response.data.schedules;
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
		schoolYear,
		schedules,
		isLoading,
		error,
		fetchDashboardData,
		clearError,
	};
});
