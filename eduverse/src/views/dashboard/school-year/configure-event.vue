<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useToast } from "@/composables/useToast";
import type { SchoolYearEventFormData, EventType } from "@/types/school-year";

defineOptions({
	layout: false,
});

const route = useRoute();
const router = useRouter();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const schoolYearId = ref<string>("");
const schoolYearName = ref<string>("");

interface EventItem {
	uid: string;
	id?: string;
	type: EventType;
	name: string;
	startDate: string;
	endDate: string;
}

const periods = ref<EventItem[]>([]);
const events = ref<EventItem[]>([]);
const vacations = ref<EventItem[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(false);

const generateUid = (): string => {
	return "uid_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const createEmptyEvent = (type: EventType): EventItem => ({
	uid: generateUid(),
	type,
	name: "",
	startDate: "",
	endDate: "",
});

const addPeriod = () => {
	periods.value.push(createEmptyEvent("period"));
};

const addEvent = () => {
	events.value.push(createEmptyEvent("event"));
};

const addVacation = () => {
	vacations.value.push(createEmptyEvent("vacation"));
};

const removePeriod = (uid: string) => {
	periods.value = periods.value.filter((p) => p.uid !== uid);
};

const removeEvent = (uid: string) => {
	events.value = events.value.filter((e) => e.uid !== uid);
};

const removeVacation = (uid: string) => {
	vacations.value = vacations.value.filter((v) => v.uid !== uid);
};

const hasEvents = computed(() => {
	return periods.value.length > 0 || events.value.length > 0 || vacations.value.length > 0;
});

const validateEvents = (items: EventItem[]): boolean => {
	for (const item of items) {
		if (!item.name.trim()) {
			return false;
		}
		if (!item.startDate) {
			return false;
		}
		if (item.endDate && new Date(item.endDate) < new Date(item.startDate)) {
			return false;
		}
	}
	return true;
};

const handleSubmit = async () => {
	if (!hasEvents.value) {
		toast.warning("Veuillez ajouter au moins un élément");
		return;
	}

	if (!validateEvents(periods.value) || !validateEvents(events.value) || !validateEvents(vacations.value)) {
		toast.error("Veuillez remplir tous les champs obligatoires");
		return;
	}

	const allEvents: EventItem[] = [...periods.value, ...events.value, ...vacations.value];

	for (const item of allEvents) {
		if (item.endDate === "") {
			item.endDate = "";
		}
	}

	isSubmitting.value = true;

	const eventsData: SchoolYearEventFormData[] = allEvents.map((item) => ({
		type: item.type,
		name: item.name,
		startDate: item.startDate,
		endDate: item.endDate || null,
	}));

	const success = await schoolYearStore.saveSchoolYearConfiguration(schoolYearId.value, eventsData);

	isSubmitting.value = false;

	if (success) {
		toast.success("Configuration enregistrée avec succès");
		router.push("/dashboard/school-year/list");
	} else {
		toast.error(schoolYearStore.error || "Erreur lors de l'enregistrement");
	}
};

const handleCancel = () => {
	router.push("/dashboard/school-year/list");
};

onMounted(async () => {
	const id = route.query.id as string;

	if (!id) {
		toast.error("Année scolaire non spécifiée");
		router.push("/dashboard/school-year/list");
		return;
	}

	schoolYearId.value = id;

	const year = schoolYearStore.getSchoolYearById(id);
	if (year) {
		schoolYearName.value = year.name;
	}

	isLoading.value = true;
	const config = await schoolYearStore.fetchSchoolYearConfiguration(id);
	isLoading.value = false;

	if (config) {
		periods.value = config.periods.map((p) => ({
			uid: generateUid(),
			id: p.id,
			type: p.type,
			name: p.name,
			startDate: p.startDate,
			endDate: p.endDate || "",
		}));

		events.value = config.events.map((e) => ({
			uid: generateUid(),
			id: e.id,
			type: e.type,
			name: e.name,
			startDate: e.startDate,
			endDate: e.endDate || "",
		}));

		vacations.value = config.vacations.map((v) => ({
			uid: generateUid(),
			id: v.id,
			type: v.type,
			name: v.name,
			startDate: v.startDate,
			endDate: v.endDate || "",
		}));
	}
});
</script>

<template>
	<div class="w-full space-y-4 lg:space-y-6">
		<button
			@click="handleCancel"
			class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
		>
			<font-awesome-icon icon="arrow-left" />
			<span>Retour à la liste</span>
		</button>

		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h5
				class="text-xs uppercase tracking-widest font-bold opacity-90 bg-white/20 w-fit py-2 px-6 rounded-full"
			>
				{{ schoolYearName || "Chargement..." }}
			</h5>

			<h2 class="mt-4 text-lg lg:text-xl font-semibold">
				Configuration temporelle de l'année
			</h2>
			<p class="text-sm w-[70%]">
				Définissez les jalons académiques et les rythmes d'évaluation pour
				structurer l'année scolaire de manière efficace.
			</p>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-8 right-8"
			/>
		</div>

		<div v-if="isLoading" class="text-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>

		<form v-else @submit.prevent="handleSubmit" class="space-y-6">
			<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
				<div class="flex justify-between items-center gap-4">
					<div class="space-y-2">
						<h3 class="">
							<font-awesome-icon
								icon="calendar-alt"
								class="text-blue-500/60 text-2xl mr-2"
							/>
							<span class="text-primary font-extrabold text-lg"
								>Période d'évaluation trimestrielle</span
							>
						</h3>
						<p class="opacity-60">
							Configurez les bornes temporelles de chaque période pédagogique
						</p>
					</div>
					<button
						type="button"
						@click="addPeriod"
						class="bg-primary text-white hover:bg-primary/90"
					>
						<font-awesome-icon icon="plus-circle" class="mr-2" />
						<span class="hidden md:inline">Ajouter un trimestre</span>
					</button>
				</div>

				<div class="mt-8 grid grid-cols-1 gap-4">
					<div
						v-for="period in periods"
						:key="period.uid"
						class="bg-gray-100 border border-gray-300 p-4 rounded-lg grid grid-cols-5 gap-6 items-center"
					>
						<div class="col-span-5 md:col-span-2">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Libellé de période</span>
							</label>
							<input
								type="text"
								v-model="period.name"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="Nom du trimestre"
							/>
						</div>
						<div class="col-span-5 md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Date de début</span>
							</label>
							<input
								type="date"
								v-model="period.startDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div class="col-span-5 md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Date de fin (opt.)</span>
							</label>
							<input
								type="date"
								v-model="period.endDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<button
							type="button"
							@click="removePeriod(period.uid)"
							class="max-md:ml-auto col-span-5 md:col-span-1 mt-4 bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg transition-colors"
							title="Supprimer cette période"
						>
							<font-awesome-icon icon="trash" class="text-red-600/70" />
						</button>
					</div>

					<div
						v-if="periods.length === 0"
						class="text-center py-8 text-gray-400"
					>
						Aucune période ajoutée. Cliquez sur "Ajouter un trimestre" pour commencer.
					</div>
				</div>
			</div>

			<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
				<div class="flex justify-between items-center gap-4">
					<div class="space-y-2">
						<h3 class="">
							<font-awesome-icon
								icon="flag"
								class="text-green-600/50 text-2xl mr-2"
							/>
							<span class="text-primary font-extrabold text-lg"
								>Événements clés</span
							>
						</h3>
						<p class="opacity-60">
							Examens, journées pédagogiques, conseils de classe...
						</p>
					</div>
					<button
						type="button"
						@click="addEvent"
						class="bg-gray-200 hover:bg-gray-200/90"
					>
						<font-awesome-icon icon="plus-circle" class="mr-2" />
						<span class="hidden md:inline">Ajouter un événement</span>
					</button>
				</div>

				<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div
						v-for="event in events"
						:key="event.uid"
						class="bg-gray-100 border border-gray-200 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						<div class="md:col-span-2">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Libellé de l'événement</span>
							</label>
							<input
								type="text"
								v-model="event.name"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="Nom de l'événement"
							/>
						</div>
						<div class="md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Date de début</span>
							</label>
							<input
								type="date"
								v-model="event.startDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div class="md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Date de fin (opt.)</span>
							</label>
							<input
								type="date"
								v-model="event.endDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<button
							type="button"
							@click="removeEvent(event.uid)"
							class="ml-auto md:col-span-2 mt-4 bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg transition-colors"
							title="Supprimer cet événement"
						>
							<font-awesome-icon icon="trash" class="text-red-600/70" />
						</button>
					</div>

					<div
						v-if="events.length === 0"
						class="md:col-span-2 text-center py-8 text-gray-400"
					>
						Aucun événement ajouté. Cliquez sur "Ajouter un événement" pour commencer.
					</div>
				</div>
			</div>

			<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
				<div class="flex justify-between items-center gap-4">
					<div class="space-y-2">
						<h3 class="">
							<font-awesome-icon
								icon="umbrella-beach"
								class="text-amber-600/50 text-2xl mr-2"
							/>
							<span class="text-primary font-extrabold text-lg">Vacances</span>
						</h3>
						<p class="opacity-60">
							Interruptions des cours pour les congés saisonniers
						</p>
					</div>
					<button
						type="button"
						@click="addVacation"
						class="bg-primary text-white hover:bg-primary/90"
					>
						<font-awesome-icon icon="plus-circle" class="mr-2" />
						<span class="hidden md:inline">Ajouter une période</span>
					</button>
				</div>

				<div class="mt-8 grid grid-cols-1 gap-4">
					<div
						v-for="vacation in vacations"
						:key="vacation.uid"
						class="bg-gray-100 border border-gray-300 p-4 rounded-lg grid grid-cols-5 gap-6 items-center"
					>
						<div class="col-span-5 md:col-span-2">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>Libellé de vacances</span>
							</label>
							<input
								type="text"
								v-model="vacation.name"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="Ex: Vacances de Noël"
							/>
						</div>
						<div class="col-span-5 md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>du</span>
							</label>
							<input
								type="date"
								v-model="vacation.startDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div class="col-span-5 md:col-span-1">
							<label
								class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
							>
								<span>au (opt.)</span>
							</label>
							<input
								type="date"
								v-model="vacation.endDate"
								class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<button
							type="button"
							@click="removeVacation(vacation.uid)"
							class="max-md:ml-auto col-span-5 md:col-span-1 mt-4 bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg transition-colors"
							title="Supprimer cette période"
						>
							<font-awesome-icon icon="trash" class="text-red-600/70" />
						</button>
					</div>

					<div
						v-if="vacations.length === 0"
						class="text-center py-8 text-gray-400"
					>
						Aucune période de vacances ajoutée. Cliquez sur "Ajouter une période" pour commencer.
					</div>
				</div>
			</div>

			<div
				class="mt-12 mb-8 flex flex-col md:flex-row md:justify-between gap-8 md:gap-4 md:items-center"
			>
				<div class="-mt-4 col-span-2">
					<font-awesome-icon icon="info-circle" class="mr-2 text-primary" />
					<span class="text-gray-400"
						>Modification possible de ces jalons à tout moment</span
					>
				</div>

				<div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
					<button
						type="button"
						@click="handleCancel"
						class="bg-gray-200 w-full md:w-32 hover:bg-gray-300 transition-colors"
					>
						Annuler
					</button>
					<button
						type="submit"
						:disabled="isSubmitting"
						class="bg-primary text-white w-full md:w-64 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					>
						<font-awesome-icon
							v-if="isSubmitting"
							icon="circle-notch"
							class="animate-spin mr-2"
						/>
						<font-awesome-icon v-else icon="save" class="mr-2" />
						<span>{{ isSubmitting ? "Enregistrement..." : "Valider la configuration" }}</span>
					</button>
				</div>
			</div>
		</form>
	</div>
</template>
