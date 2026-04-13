import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { unifiedClassService } from "@/services/unified.service";
import { useAuthStore } from "./auth.store";
import { useSchoolYearStore } from "./school-year.store";
import type { SchoolClass, ClassFormData } from "@/types/class";

export const useClassStore = defineStore("class", () => {
	const classes = ref<SchoolClass[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const getClassesByLevel = computed(() => {
		const grouped: Record<string, SchoolClass[]> = {
			primary: [],
			secondary: [],
			terminale: [],
		};
		classes.value.forEach((c) => {
			if (grouped[c.level]) {
				grouped[c.level].push(c);
			}
		});
		return grouped;
	});

	async function fetchClasses(): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolYearStore = useSchoolYearStore();
		const schoolId = authStore.school?.id;
		const activeYear = schoolYearStore.schoolYears.find((y) => y.isActive);

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		if (!activeYear) {
			error.value = "Aucune année scolaire active";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedClassService.getClasses(schoolId, activeYear.id);

		if (response.success && response.data) {
			classes.value = response.data;
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors du chargement des classes";
		isLoading.value = false;
		return false;
	}

	async function createClass(data: ClassFormData): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolYearStore = useSchoolYearStore();
		const schoolId = authStore.school?.id;
		const activeYear = schoolYearStore.schoolYears.find((y) => y.isActive);

		if (!schoolId) {
			error.value = "Identifiant d'école non disponible";
			return false;
		}

		if (!activeYear) {
			error.value = "Aucune année scolaire active";
			return false;
		}

		isLoading.value = true;
		error.value = null;

		const response = await unifiedClassService.createClass(schoolId, activeYear.id, data);

		if (response.success && response.data) {
			classes.value.push(response.data);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la création de la classe";
		isLoading.value = false;
		return false;
	}

	async function updateClass(id: string, data: Partial<ClassFormData>): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedClassService.updateClass(id, data);

		if (response.success && response.data) {
			const index = classes.value.findIndex((c) => c.id === id);
			if (index >= 0) {
				classes.value[index] = response.data;
			}
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la modification de la classe";
		isLoading.value = false;
		return false;
	}

	async function deleteClass(id: string): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedClassService.deleteClass(id);

		if (response.success) {
			classes.value = classes.value.filter((c) => c.id !== id);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la suppression de la classe";
		isLoading.value = false;
		return false;
	}

	function getClassById(id: string): SchoolClass | undefined {
		return classes.value.find((c) => c.id === id);
	}

	function getClassName(id: string): string | null {
		const schoolClass = getClassById(id);
		return schoolClass?.name ?? null;
	}

	return {
		classes,
		getClassesByLevel,
		isLoading,
		error,
		fetchClasses,
		createClass,
		updateClass,
		deleteClass,
		getClassById,
		getClassName,
	};
});