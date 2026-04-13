<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStudentStore } from "@/stores/student.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useToast } from "@/composables/useToast";
import type { Gender } from "@/types/student";

defineOptions({
	layout: false,
});

const router = useRouter();
const studentStore = useStudentStore();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const openMenuId = ref<string | null>(null);

const searchQuery = ref("");
const selectedGender = ref<Gender | "">("");
const selectedClass = ref("");

const classes = computed(() => studentStore.getUniqueClasses());

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const formatPhone = (phone: string): string => {
	if (!phone) return "-";
	return phone;
};

const toggleMenu = (id: string) => {
	openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => {
	openMenuId.value = null;
};

const handleApplyFilters = () => {
	studentStore.setFilter("search", searchQuery.value);
	studentStore.setFilter("gender", selectedGender.value);
	studentStore.setFilter("classId", selectedClass.value);
	studentStore.applyFilters();
};

const handleResetFilters = () => {
	searchQuery.value = "";
	selectedGender.value = "";
	selectedClass.value = "";
	studentStore.resetFilters();
};

const handleEdit = (id: string) => {
	closeMenu();
	router.push(`/dashboard/students/edit/${id}`);
};

const handleDelete = async (id: string) => {
	closeMenu();
	if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
		const success = await studentStore.deleteStudent(id);
		if (success) {
			toast.success("Étudiant supprimé avec succès");
		} else {
			toast.error(studentStore.error || "Erreur lors de la suppression");
		}
	}
};

onMounted(async () => {
	await schoolYearStore.fetchSchoolYears();
	await Promise.all([
		studentStore.fetchStudents(),
		studentStore.fetchStudentStats(),
	]);
});
</script>

<template>
	<div class="space-y-4 lg:space-y-6">
		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h2 class="text-lg lg:text-xl font-semibold">Liste des étudiants</h2>
			<p class="text-sm w-[70%]">
				Gérez les informations de vos étudiants ainsi que leurs parcours
			</p>

			<div class="mt-6 flex justify-start">
				<router-link to="/dashboard/students/create">
					<button
						class="text-primary bg-background hover:bg-background/90 rounded-lg px-4 py-2"
					>
						<font-awesome-icon icon="plus-circle" class="mr-2" />
						<span>Inscrire un nouveau étudiant</span>
					</button>
				</router-link>
			</div>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-8 right-8"
			/>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div
				class="bg-white p-6 rounded-lg shadow space-y-2 border-l-4 border-blue-600/50"
			>
				<h5 class="text-xs uppercase tracking-widest font-bold opacity-50">
					total élèves
				</h5>
				<p class="text-2xl font-extrabold">{{ studentStore.stats.total }}</p>
			</div>
			<div
				class="bg-white p-6 rounded-lg shadow space-y-2 border-l-4 border-green-600/50"
			>
				<h5 class="text-xs uppercase tracking-widest font-bold opacity-50">
					réinscriptions
				</h5>
				<p class="text-2xl font-extrabold">
					{{ studentStore.stats.reEnrollments }}
				</p>
			</div>
			<div
				class="bg-white p-6 rounded-lg shadow space-y-2 border-l-4 border-amber-600/50"
			>
				<h5 class="text-xs uppercase tracking-widest font-bold opacity-50">
					nouveaux inscrits
				</h5>
				<p class="text-2xl font-extrabold">
					{{ studentStore.stats.newEnrollments }}
				</p>
			</div>
			<div
				class="bg-white p-6 rounded-lg shadow space-y-2 border-l-4 border-indigo-600/50"
			>
				<h5 class="text-xs uppercase tracking-widest font-bold opacity-50">
					abandons/désistements
				</h5>
				<p class="text-2xl font-extrabold">
					{{ studentStore.stats.withdrawn }}
				</p>
			</div>
		</div>

		<div
			class="w-full mt-8 bg-white rounded-lg p-4 md:p-8 shadow border border-gray-100"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<div class="lg:col-span-2 space-y-3 relative">
					<font-awesome-icon
						icon="search"
						class="absolute top-3 left-4 opacity-70"
					/>
					<input
						type="text"
						v-model="searchQuery"
						placeholder="Rechercher par nom, matricule"
						class="bg-gray-100 border-none indent-8 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
				<div class="space-y-3">
					<select
						v-model="selectedGender"
						class="bg-gray-100 border-none w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					>
						<option value="">Sexe</option>
						<option value="male">Masculin</option>
						<option value="female">Féminin</option>
					</select>
				</div>
				<div class="space-y-3">
					<select
						v-model="selectedClass"
						class="bg-gray-100 border-none w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					>
						<option value="">Classe</option>
						<option v-for="cls in classes" :key="cls.id" :value="cls.id">
							{{ cls.name }}
						</option>
					</select>
				</div>
				<div class="flex gap-2 items-center">
					<button
						@click="handleResetFilters"
						class="bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 transition-colors"
						title="Réinitialiser les filtres"
					>
						<font-awesome-icon icon="times" />
					</button>
					<button
						@click="handleApplyFilters"
						class="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 transition-colors"
					>
						Appliquer
					</button>
				</div>
			</div>
		</div>

		<div v-if="studentStore.isLoading" class="text-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>

		<div
			v-else-if="studentStore.filteredStudents.length === 0"
			class="text-center py-12 bg-white rounded-lg shadow"
		>
			<font-awesome-icon icon="users" class="text-gray-300 text-5xl mb-4" />
			<p class="text-gray-500">Aucun étudiant trouvé</p>
		</div>

		<div v-else class="overflow-x-auto">
			<table class="my-8 bg-white w-full shadow">
				<thead class="bg-gray-100">
					<tr>
						<th class="font-bold p-4 text-left">Élève</th>
						<th class="font-bold p-4 text-left hidden lg:table-cell">
							Matricule
						</th>
						<th class="font-bold p-4 text-left hidden md:table-cell">
							Date de naissance
						</th>
						<th class="font-bold p-4 text-left hidden sm:table-cell">
							Contact du parent
						</th>
						<th class="font-bold p-4 text-left hidden xl:table-cell">Classe</th>
						<th class="font-bold p-4 text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="student in studentStore.paginatedStudents"
						:key="student.id"
						class="cursor-pointer hover:bg-gray-200 hover:transition-all hover:duration-500"
					>
						<td class="p-4">
							<div class="flex items-center gap-3">
								<img
									:src="
										student.photoUrl ||
										'https://randomuser.me/api/portraits/men/1.jpg'
									"
									:alt="`${student.firstName} ${student.lastName}`"
									class="w-10 h-10 rounded-full object-cover"
								/>
								<div class="flex flex-col">
									<span class="font-medium"
										>{{ student.firstName }} {{ student.lastName }}</span
									>
									<span class="text-xs text-gray-500 md:hidden">{{
										student.matricule
									}}</span>
								</div>
							</div>
						</td>
						<td class="p-4 hidden lg:table-cell">{{ student.matricule }}</td>
						<td class="p-4 hidden md:table-cell">
							{{ formatDate(student.dateOfBirth) }}
						</td>
						<td class="p-4 hidden sm:table-cell">
							<div class="flex flex-col">
								<span>{{ student.guardianName }}</span>
								<span class="text-xs text-gray-500">{{
									formatPhone(student.guardianPhone)
								}}</span>
							</div>
						</td>
						<td class="p-4 hidden xl:table-cell">
							{{ student.className || "-" }}
						</td>
						<td class="p-4 text-center">
							<div class="relative">
								<button
									@click.stop="toggleMenu(student.id)"
									title="Options"
									class="p-2 hover:bg-gray-100 rounded-full transition-colors"
								>
									<font-awesome-icon
										icon="ellipsis-h"
										class="hover:text-primary"
									/>
								</button>

								<div
									v-if="openMenuId === student.id"
									class="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
								>
									<button
										class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
										@click="handleEdit(student.id)"
									>
										<font-awesome-icon icon="eye" />
										Voir détails
									</button>
									<button
										class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
										@click="handleEdit(student.id)"
									>
										<font-awesome-icon icon="edit" />
										Modifier
									</button>
									<button
										class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
										@click="handleDelete(student.id)"
									>
										<font-awesome-icon icon="trash" />
										Supprimer
									</button>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div
			v-if="studentStore.filteredStudents.length > 0"
			class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-lg shadow"
		>
			<div class="text-sm text-gray-600">
				Affichage de
				<span class="font-semibold text-primary">
					{{ (studentStore.currentPage - 1) * studentStore.itemsPerPage + 1 }}
				</span>
				à
				<span class="font-semibold text-primary">
					{{
						Math.min(
							studentStore.currentPage * studentStore.itemsPerPage,
							studentStore.totalItems
						)
					}}
				</span>
				sur
				<span class="font-semibold text-primary">{{
					studentStore.totalItems
				}}</span>
				étudiants
			</div>

			<div class="flex items-center gap-2">
				<select
					:value="studentStore.itemsPerPage"
					@change="
						studentStore.setItemsPerPage(
							Number(($event.target as HTMLSelectElement).value)
						)
					"
					class="bg-gray-100 border-none px-2 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
				>
					<option :value="10">10</option>
					<option :value="25">25</option>
					<option :value="50">50</option>
				</select>
				<span class="text-sm text-gray-500 text-nowrap">par page</span>
			</div>

			<div class="flex items-center gap-1">
				<button
					:disabled="studentStore.currentPage === 1"
					@click="studentStore.setPage(studentStore.currentPage - 1)"
					class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
					:class="
						studentStore.currentPage === 1
							? 'text-gray-300 cursor-not-allowed'
							: 'text-gray-600 hover:bg-gray-100 hover:text-primary'
					"
				>
					<font-awesome-icon icon="chevron-left" />
				</button>

				<template v-for="page in studentStore.totalPages" :key="page">
					<button
						v-if="
							page === 1 ||
							page === studentStore.totalPages ||
							Math.abs(page - studentStore.currentPage) <= 1
						"
						@click="studentStore.setPage(page)"
						class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
						:class="
							page === studentStore.currentPage
								? 'bg-primary text-white'
								: 'text-gray-600 hover:bg-gray-100 hover:text-primary'
						"
					>
						{{ page }}
					</button>
					<span
						v-else-if="
							page === studentStore.currentPage - 2 ||
							page === studentStore.currentPage + 2
						"
						class="px-1 text-gray-400"
					>
						...
					</span>
				</template>

				<button
					:disabled="studentStore.currentPage === studentStore.totalPages"
					@click="studentStore.setPage(studentStore.currentPage + 1)"
					class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
					:class="
						studentStore.currentPage === studentStore.totalPages
							? 'text-gray-300 cursor-not-allowed'
							: 'text-gray-600 hover:bg-gray-100 hover:text-primary'
					"
				>
					<font-awesome-icon icon="chevron-right" />
				</button>
			</div>
		</div>
	</div>
</template>
