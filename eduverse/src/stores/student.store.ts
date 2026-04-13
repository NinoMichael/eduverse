import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { unifiedStudentService } from "@/services/unified.service";
import { useAuthStore } from "./auth.store";
import { useSchoolYearStore } from "./school-year.store";
import type { Student, StudentFilters, StudentStats, StudentFormData } from "@/types/student";

export const useStudentStore = defineStore("student", () => {
	const students = ref<Student[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const stats = ref<StudentStats>({
		total: 0,
		reEnrollments: 0,
		newEnrollments: 0,
		withdrawn: 0,
	});

	const filters = ref<StudentFilters>({
		search: "",
		gender: "",
		classId: "",
	});

	const currentPage = ref(1);
	const itemsPerPage = ref(10);

	const filteredStudents = computed(() => {
		return unifiedStudentService.filterStudents(students.value, filters.value);
	});

	const paginatedStudents = computed(() => {
		const start = (currentPage.value - 1) * itemsPerPage.value;
		const end = start + itemsPerPage.value;
		return filteredStudents.value.slice(start, end);
	});

	const totalPages = computed(() => {
		return Math.ceil(filteredStudents.value.length / itemsPerPage.value);
	});

	const totalItems = computed(() => filteredStudents.value.length);

	async function fetchStudents(): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolYearStore = useSchoolYearStore();
		const schoolId = authStore.school?.id;
		const activeYear = schoolYearStore.schoolYears.find((y) => y.isActive);

		console.log('[StudentStore] fetchStudents - schoolId:', schoolId, 'activeYear:', activeYear);

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

		const response = await unifiedStudentService.getStudents(schoolId, activeYear.id);

		console.log('[StudentStore] getStudents response:', response);

		if (response.success && response.data) {
			console.log('[StudentStore] students loaded:', response.data.length);
			students.value = response.data;
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors du chargement des étudiants";
		isLoading.value = false;
		return false;
	}

	async function fetchStudentStats(): Promise<boolean> {
		const authStore = useAuthStore();
		const schoolYearStore = useSchoolYearStore();
		const schoolId = authStore.school?.id;
		const activeYear = schoolYearStore.schoolYears.find((y) => y.isActive);

		if (!schoolId) {
			return false;
		}

		if (!activeYear) {
			return false;
		}

		const response = await unifiedStudentService.getStudentStats(schoolId, activeYear.id);

		if (response.success && response.data) {
			stats.value = response.data;
			return true;
		}

		return false;
	}

	async function createStudent(data: StudentFormData): Promise<boolean> {
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

		const response = await unifiedStudentService.createStudent(schoolId, activeYear.id, data);

		if (response.success && response.data) {
			students.value.unshift(response.data);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la création de l'étudiant";
		isLoading.value = false;
		return false;
	}

	async function updateStudent(id: string, data: Partial<StudentFormData>): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedStudentService.updateStudent(id, data);

		if (response.success && response.data) {
			const index = students.value.findIndex((s) => s.id === id);
			if (index >= 0) {
				students.value[index] = response.data;
			}
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la modification de l'étudiant";
		isLoading.value = false;
		return false;
	}

	async function deleteStudent(id: string): Promise<boolean> {
		isLoading.value = true;
		error.value = null;

		const response = await unifiedStudentService.deleteStudent(id);

		if (response.success) {
			students.value = students.value.filter((s) => s.id !== id);
			isLoading.value = false;
			return true;
		}

		error.value = response.error || "Erreur lors de la suppression de l'étudiant";
		isLoading.value = false;
		return false;
	}

	function setFilter(key: keyof StudentFilters, value: string) {
		filters.value[key] = value as never;
	}

	function applyFilters() {
		currentPage.value = 1;
	}

	function resetFilters() {
		filters.value = {
			search: "",
			gender: "",
			classId: "",
		};
		currentPage.value = 1;
	}

	function setPage(page: number) {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page;
		}
	}

	function setItemsPerPage(count: number) {
		itemsPerPage.value = count;
		currentPage.value = 1;
	}

	function clearError() {
		error.value = null;
	}

	function getStudentById(id: string): Student | undefined {
		return students.value.find((s) => s.id === id);
	}

	function getUniqueClasses(): { id: string; name: string }[] {
		const classes = new Map<string, string>();
		students.value.forEach((s) => {
			if (s.classId && s.className) {
				classes.set(s.classId, s.className);
			}
		});
		return Array.from(classes.entries()).map(([id, name]) => ({ id, name }));
	}

	return {
		students,
		filteredStudents,
		paginatedStudents,
		filters,
		stats,
		isLoading,
		error,
		currentPage,
		itemsPerPage,
		totalPages,
		totalItems,
		fetchStudents,
		fetchStudentStats,
		createStudent,
		updateStudent,
		deleteStudent,
		setFilter,
		applyFilters,
		resetFilters,
		clearError,
		getStudentById,
		getUniqueClasses,
		setPage,
		setItemsPerPage,
	};
});
