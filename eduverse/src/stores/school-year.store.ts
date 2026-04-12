import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { unifiedSchoolYearService } from "@/services/unified.service";
import { useAuthStore } from "./auth.store";
import type { SchoolYear, SchoolYearFormData, SchoolYearStatus, SchoolYearEvent, SchoolYearEventFormData, SchoolYearConfiguration } from "@/types/school-year";

export const useSchoolYearStore = defineStore("schoolYear", () => {
	const schoolYears = ref<SchoolYear[]>([]);
	const schoolYearEvents = ref<SchoolYearEvent[]>([]);
	const isLoading = ref(false);
	const isSubmitting = ref(false);
	const error = ref<string | null>(null);
	const activeTab = ref<SchoolYearStatus | "all">("all");

	const filteredSchoolYears = computed(() => {
		if (activeTab.value === "all") {
			return schoolYears.value;
		}
		return schoolYears.value.filter((year) => {
			const status = getSchoolYearStatus(year);
			return status === activeTab.value;
		});
	});

	const getSchoolYearStatus = (year: SchoolYear): SchoolYearStatus => {
		const today = new Date();
		const startDate = new Date(year.startDate);
		const endDate = new Date(year.endDate);

		if (today < startDate) {
			return "planned";
		} else if (today >= startDate && today <= endDate) {
			return "in_progress";
		} else {
			return "closed";
		}
	};

	const getStatusLabel = (status: SchoolYearStatus): string => {
		const labels: Record<SchoolYearStatus, string> = {
			planned: "Planifié",
			in_progress: "En cours",
			closed: "Cloturé",
		};
		return labels[status];
	};

	const getStatusClass = (status: SchoolYearStatus): string => {
		const classes: Record<SchoolYearStatus, string> = {
			planned: "bg-blue-600/20 text-blue-600",
			in_progress: "bg-green-600/20 text-green-600",
			closed: "bg-gray-300/50 text-gray-600",
		};
		return classes[status];
	};

	async function fetchSchoolYears(): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolId = authStore.school?.id;

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.getSchoolYears(schoolId);

		if (response.success && response.data) {
			schoolYears.value = response.data;
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors du chargement des années scolaires";
		isLoading.value = false;
		return false;
	}

	async function createSchoolYear(data: SchoolYearFormData): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolId = authStore.school?.id;

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.createSchoolYear(schoolId, data);

		if (response.success && response.data) {
			schoolYears.value.unshift(response.data);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la création";
		isLoading.value = false;
		return false;
	}

	async function updateSchoolYear(id: string, data: SchoolYearFormData): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.updateSchoolYear(id, data);

		if (response.success && response.data) {
			const index = schoolYears.value.findIndex((y) => y.id === id);
			if (index >= 0) {
				schoolYears.value[index] = response.data;
			}
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la modification";
		isLoading.value = false;
		return false;
	}

	async function setActiveSchoolYear(id: string): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolId = authStore.school?.id;

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.setActiveSchoolYear(id, schoolId);

		if (response.success && response.data) {
			schoolYears.value = schoolYears.value.map((y) => ({
				...y,
				isActive: y.id === id,
			}));
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de l'activation";
		isLoading.value = false;
		return false;
	}

	async function closeSchoolYear(id: string): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.closeSchoolYear(id);

		if (response.success && response.data) {
			const index = schoolYears.value.findIndex((y) => y.id === id);
			if (index >= 0) {
				schoolYears.value[index] = response.data;
			}
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la clôture";
		isLoading.value = false;
		return false;
	}

	async function deleteSchoolYear(id: string): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.deleteSchoolYear(id);

		if (response.success) {
			schoolYears.value = schoolYears.value.filter((y) => y.id !== id);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la suppression";
		isLoading.value = false;
		return false;
	}

	function setActiveTab(tab: SchoolYearStatus | "all") {
		activeTab.value = tab;
	}

	function clearError() {
		error.value = null;
	}

	async function fetchSchoolYearEvents(schoolYearId: string): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.getSchoolYearEvents(schoolYearId);

		if (response.success && response.data) {
			schoolYearEvents.value = response.data;
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors du chargement des événements";
		isLoading.value = false;
		return false;
	}

	async function fetchSchoolYearConfiguration(schoolYearId: string): Promise<SchoolYearConfiguration | null> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.getSchoolYearConfiguration(schoolYearId);

		if (response.success && response.data) {
			schoolYearEvents.value = [
				...response.data.periods,
				...response.data.events,
				...response.data.vacations,
			];
			isLoading.value = false;
			return response.data;
		}

		error.value = response.error || "Erreur lors du chargement de la configuration";
		isLoading.value = false;
		return null;
	}

	async function saveSchoolYearConfiguration(
		schoolYearId: string,
		events: SchoolYearEventFormData[]
	): Promise<boolean> {
		isSubmitting.value = true;
		error.value = null;

		const response = await unifiedSchoolYearService.saveSchoolYearConfiguration(schoolYearId, events);

		if (response.success && response.data) {
			schoolYearEvents.value = [
				...response.data.periods,
				...response.data.events,
				...response.data.vacations,
			];
			isSubmitting.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de l'enregistrement de la configuration";
		isSubmitting.value = false;
		return false;
	}

	function getSchoolYearById(id: string): SchoolYear | undefined {
		return schoolYears.value.find((y) => y.id === id);
	}

	function clearSchoolYearEvents() {
		schoolYearEvents.value = [];
	}

	return {
		schoolYears,
		schoolYearEvents,
		filteredSchoolYears,
		activeTab,
		isLoading,
		isSubmitting,
		error,
		fetchSchoolYears,
		createSchoolYear,
		updateSchoolYear,
		setActiveSchoolYear,
		closeSchoolYear,
		deleteSchoolYear,
		setActiveTab,
		clearError,
		getSchoolYearStatus,
		getStatusLabel,
		getStatusClass,
		fetchSchoolYearEvents,
		fetchSchoolYearConfiguration,
		saveSchoolYearConfiguration,
		getSchoolYearById,
		clearSchoolYearEvents,
	};
});
