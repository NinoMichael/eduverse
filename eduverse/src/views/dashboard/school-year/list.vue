<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useSchoolYearStore } from "@/stores/school-year.store";
import type { SchoolYearStatus } from "@/types/school-year";

defineOptions({
	layout: false,
});

const router = useRouter();
const schoolYearStore = useSchoolYearStore();

const openMenuId = ref<string | null>(null);

const tabs: { label: string; value: SchoolYearStatus | "all" }[] = [
	{ label: "Tous", value: "all" },
	{ label: "Planifié", value: "planned" },
	{ label: "En cours", value: "in_progress" },
	{ label: "Cloturé", value: "closed" },
];

const toggleMenu = (id: string) => {
	openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => {
	openMenuId.value = null;
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const handleSetActive = async (id: string) => {
	closeMenu();
	await schoolYearStore.setActiveSchoolYear(id);
};

const handleClose = async (id: string) => {
	closeMenu();
	await schoolYearStore.closeSchoolYear(id);
};

const handleDelete = async (id: string) => {
	closeMenu();
	if (confirm("Êtes-vous sûr de vouloir supprimer cette année scolaire ?")) {
		await schoolYearStore.deleteSchoolYear(id);
	}
};

const handleEdit = (id: string) => {
	closeMenu();
	router.push(`/dashboard/school-year/edit/${id}`);
};

const handleConfigureMilestones = (id: string) => {
	closeMenu();
	router.push(`/dashboard/school-year/event/configure?id=${id}`);
};

const isYearConfigurable = (year: { isActive: boolean; id: string }) => {
	return (
		year.isActive ||
		schoolYearStore.getSchoolYearStatus(year as any) !== "closed"
	);
};

onMounted(() => {
	schoolYearStore.fetchSchoolYears();
});
</script>

<template>
	<div class="space-y-4 lg:space-y-6">
		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h2 class="text-lg lg:text-xl font-semibold">Année scolaire</h2>
			<p class="text-sm">
				Gérez les cycles académiques, planifiez les rentrées et archivez les
				années passées
			</p>

			<div class="mt-6 flex justify-start">
				<router-link to="/dashboard/school-year/create">
					<button
						class="text-primary bg-background hover:bg-background/90 rounded-lg px-4 py-2"
					>
						<font-awesome-icon icon="plus-circle" class="mr-2" />
						<span>Nouvelle année scolaire</span>
					</button>
				</router-link>
			</div>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-2 right-8"
			/>
		</div>

		<div class="tabs tabs-boxed bg-white">
			<button
				v-for="tab in tabs"
				:key="tab.value"
				class="tab"
				:class="{ 'tab-active': schoolYearStore.activeTab === tab.value }"
				@click="schoolYearStore.setActiveTab(tab.value)"
			>
				{{ tab.label }}
			</button>
		</div>

		<div v-if="schoolYearStore.isLoading" class="text-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>

		<div
			v-else-if="schoolYearStore.filteredSchoolYears.length === 0"
			class="text-center py-8 text-gray-500"
		>
			Aucune année scolaire trouvée
		</div>

		<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div
				v-for="year in schoolYearStore.filteredSchoolYears"
				:key="year.id"
				class="relative bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
				@click="closeMenu"
			>
				<div class="absolute top-4 right-4">
					<div class="relative">
						<button
							@click.stop="toggleMenu(year.id)"
							class="p-2 rounded-full hover:bg-gray-100 transition-colors"
							title="Options"
						>
							<font-awesome-icon
								icon="ellipsis-v"
								class="text-gray-500 hover:text-primary"
							/>
						</button>

						<div
							v-if="openMenuId === year.id"
							class="absolute right-0 mt-1 w-48 bg-gray-100 rounded-md shadow-lg py-1 z-10 border border-gray-200"
						>
							<button
								v-if="isYearConfigurable(year)"
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
								@click="handleConfigureMilestones(year.id)"
							>
								<font-awesome-icon icon="calendar-alt" />
								Configurer les jalons
							</button>
							<button
								v-if="
									!year.isActive &&
									schoolYearStore.getSchoolYearStatus(year) === 'planned'
								"
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
								@click="handleSetActive(year.id)"
							>
								<font-awesome-icon icon="check" />
								Définir comme active
							</button>
							<button
								v-if="year.isActive"
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
								@click="handleClose(year.id)"
							>
								<font-awesome-icon icon="lock" />
								Cloturer
							</button>
							<button
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
								@click="handleEdit(year.id)"
							>
								<font-awesome-icon icon="edit" />
								Modifier
							</button>
							<button
								v-if="!year.isActive"
								class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
								@click="handleDelete(year.id)"
							>
								<font-awesome-icon icon="trash" />
								Supprimer
							</button>
						</div>
					</div>
				</div>

				<span
					:class="
						schoolYearStore.getStatusClass(
							schoolYearStore.getSchoolYearStatus(year)
						)
					"
					class="py-2 px-4 font-bold text-xs rounded-full"
				>
					{{
						schoolYearStore.getStatusLabel(
							schoolYearStore.getSchoolYearStatus(year)
						)
					}}
				</span>

				<div class="space-y-2 mt-4">
					<h5 class="text-xl font-bold">{{ year.name }}</h5>
					<p v-if="year.isActive" class="text-green-600 font-medium">
						Cycle actuel
					</p>
					<p
						v-else-if="schoolYearStore.getSchoolYearStatus(year) === 'closed'"
						class="text-gray-500"
					>
						Archivé
					</p>
					<p v-else class="text-gray-500">En préparation</p>
				</div>

				<div class="mt-6 space-y-2 opacity-70">
					<p>
						<font-awesome-icon icon="calendar-alt" class="mr-2" />
						<span>{{ formatDate(year.startDate) }}</span>
					</p>
					<p>
						<font-awesome-icon icon="calendar-check" class="mr-2" />
						<span>{{ formatDate(year.endDate) }}</span>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
