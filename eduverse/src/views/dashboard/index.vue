<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store";

defineOptions({
	layout: false,
});

const dashboardStore = useDashboardStore();

const isFirstTimeSetup = computed(() => {
	return (
		!dashboardStore.isLoading &&
		!dashboardStore.error &&
		dashboardStore.stats?.currentYear === null &&
		dashboardStore.stats?.totalStudents === 0
	);
});

onMounted(() => {
	dashboardStore.fetchDashboardData();
});
</script>

<template>
	<div class="space-y-4 lg:space-y-6">
		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h2 class="text-lg lg:text-xl font-semibold">Vue d'ensemble</h2>
			<p class="text-sm">
				Visualisez les activités globales de votre établissement
			</p>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-2 right-8"
			/>
		</div>

		<div
			v-if="isFirstTimeSetup"
			class="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center"
		>
			<font-awesome-icon icon="rocket" class="text-4xl text-amber-500 mb-3" />
			<h3 class="text-lg font-semibold text-amber-800 mb-2">
				Bienvenue sur Eduverse !
			</h3>
			<p class="text-amber-700 mb-4">
				Pour commencer, vous devez créer une année scolaire. Cela vous permettra
				d'ajouter des classes, des enseignants et des élèves.
			</p>
			<router-link
				to="/school-year"
				class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
			>
				<font-awesome-icon icon="plus" />
				Créer une année scolaire
			</router-link>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
			<div class="bg-white p-6 rounded-lg shadow flex items-center gap-4">
				<font-awesome-icon
					icon="calendar-week"
					class="bg-gray-200 text-blue-600/50 p-2 text-3xl rounded-lg"
				/>
				<div>
					<h3 class="text-gray-500 text-xs uppercase tracking-widest">
						Année scolaire
					</h3>
					<p class="text-xl font-bold">
						{{ dashboardStore.stats?.currentYear || "N/A" }}
					</p>
				</div>
			</div>
			<div class="bg-white p-6 rounded-lg shadow flex items-center gap-4">
				<font-awesome-icon
					icon="users"
					class="bg-gray-200 text-green-600/50 p-2 text-3xl rounded-lg"
				/>
				<div>
					<h3 class="text-gray-500 text-xs uppercase tracking-widest">
						nombre d'élèves
					</h3>
					<p class="text-xl font-bold">
						{{ dashboardStore.stats?.totalStudents || 0 }}
					</p>
				</div>
			</div>
			<div class="bg-white p-6 rounded-lg shadow flex items-center gap-4">
				<font-awesome-icon
					icon="door-open"
					class="bg-gray-200 text-amber-600/50 p-2 text-3xl rounded-lg"
				/>
				<div>
					<h3 class="text-gray-500 text-xs uppercase tracking-widest">
						nombre de classes
					</h3>
					<p class="text-xl font-bold">
						{{ dashboardStore.stats?.totalClasses || 0 }}
					</p>
				</div>
			</div>
			<div class="bg-white p-6 rounded-lg shadow flex items-center gap-4">
				<font-awesome-icon
					icon="chalkboard-teacher"
					class="bg-gray-200 text-indigo-600/50 p-2 text-3xl rounded-lg"
				/>
				<div>
					<h3 class="text-gray-500 text-xs uppercase tracking-widest">
						nombre d'enseignants
					</h3>
					<p class="text-xl font-bold">
						{{ dashboardStore.stats?.totalTeachers || 0 }}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-8 w-full">
			<div
				class="flex flex-col md:flex-row md:justify-between md:items-center md:gap-4"
			>
				<h2 class="text-lg font-semibold flex gap-2 items-center">
					<font-awesome-icon
						icon="clock"
						class="p-2 rounded-full bg-gray-200 text-lg"
					/>
					<span>Emploi du temps de l'heure actuelle</span>
				</h2>

				<router-link
					to="/"
					class="ml-11 md:ml-0 hover:text-primary hover:underline hover:underline-offset-4 transition-colors"
				>
					Voir l'agenda du jour
				</router-link>
			</div>

			<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					v-for="schedule in dashboardStore.schedules"
					:key="schedule.id"
					class="bg-white p-6 rounded-lg shadow border border-gray-100 flex gap-4 items-center"
				>
					<div class="space-y-1 rounded-lg bg-gray-200 p-4 text-center">
						<p class="text-base font-semibold">{{ schedule.startTime }}</p>
						<p class="opacity-70">{{ schedule.endTime }}</p>
					</div>
					<div class="space-y-1">
						<h5 class="text-base font-extrabold text-primary">
							{{ schedule.subject }} - {{ schedule.className }}
						</h5>
						<p class="text-gray-500">
							<font-awesome-icon icon="user" class="mr-2" />
							<span>{{ schedule.teacherName }}</span>
						</p>
					</div>
				</div>

				<div
					v-if="
						dashboardStore.schedules.length === 0 && !dashboardStore.isLoading
					"
					class="col-span-full bg-white p-6 rounded-lg shadow border border-gray-100 text-center text-gray-500"
				>
					Aucun cours prévu pour aujourd'hui
				</div>

				<div
					v-if="dashboardStore.isLoading"
					class="col-span-full bg-white p-6 rounded-lg shadow border border-gray-100 text-center text-gray-500"
				>
					Chargement...
				</div>
			</div>
		</div>
	</div>
</template>
