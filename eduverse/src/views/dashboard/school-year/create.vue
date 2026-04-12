<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useForm } from "@/composables/useForm";
import { useToast } from "@/composables/useToast";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { required } from "@/utils/validation";
import type { SchoolYearFormData } from "@/types/school-year";

defineOptions({
	layout: false,
});

const route = useRoute();
const router = useRouter();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const isEditMode = computed(() => !!route.params.id);
const editingYearId = computed(() => route.params.id as string | undefined);

const initialConfig = ref<"import" | "new">("new");
const configureImmediately = ref(false);

const form = useForm({
	name: "",
	startDate: "",
	endDate: "",
});

const validationRules = {
	name: [required("Le libellé de l'année est requis")],
	startDate: [required("La date de rentrée est requise")],
	endDate: [required("La date de clôture est requise")],
};

const endDateError = computed(() => {
	const { startDate, endDate } = form.values.value;
	if (!startDate || !endDate) return null;
	if (new Date(endDate) <= new Date(startDate)) {
		return "La date de clôture doit être après la date de rentrée";
	}
	return null;
});

const handleCancel = () => {
	router.push("/dashboard/school-year/list");
};

const handleSubmit = async () => {
	if (!form.validateAll(validationRules)) {
		toast.error("Veuillez corriger les erreurs dans le formulaire");
		return;
	}

	if (endDateError.value) {
		toast.error(endDateError.value);
		return;
	}

	form.isSubmitting.value = true;

	const data: SchoolYearFormData = {
		name: form.values.value.name,
		startDate: form.values.value.startDate,
		endDate: form.values.value.endDate,
	};

	let success = false;

	if (isEditMode.value && editingYearId.value) {
		success = await schoolYearStore.updateSchoolYear(editingYearId.value, data);
	} else {
		success = await schoolYearStore.createSchoolYear(data);
	}

	form.isSubmitting.value = false;

	if (success) {
		if (isEditMode.value) {
			toast.success("Année scolaire modifiée avec succès");
		} else {
			toast.success("Année scolaire créée avec succès");
		}
		if (configureImmediately.value) {
			const yearId = isEditMode.value && editingYearId.value 
				? editingYearId.value 
				: schoolYearStore.schoolYears[0]?.id;
			if (yearId) {
				router.push(`/dashboard/school-year/event/configure?id=${yearId}`);
			} else {
				router.push("/dashboard/school-year/list");
			}
		} else {
			router.push("/dashboard/school-year/list");
		}
	} else {
		toast.error(
			schoolYearStore.error || "Erreur lors de l'opération"
		);
	}
};

onMounted(async () => {
	if (isEditMode.value && editingYearId.value) {
		const year = schoolYearStore.getSchoolYearById(editingYearId.value);
		if (year) {
			form.values.value.name = year.name;
			form.values.value.startDate = year.startDate;
			form.values.value.endDate = year.endDate;
		} else {
			toast.error("Année scolaire non trouvée");
			router.push("/dashboard/school-year/list");
		}
	}
});
</script>

<template>
	<div class="space-y-4 lg:space-y-6">
		<button
			@click="handleCancel"
			class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
		>
			<font-awesome-icon icon="arrow-left" />
			<span>Retour à la liste</span>
		</button>

		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h2 class="text-lg lg:text-xl font-semibold">
				{{ isEditMode ? 'Modifier l\'année scolaire' : 'Créer une année scolaire' }}
			</h2>
			<p class="text-sm w-[70%]">
				<template v-if="isEditMode">
					Modifiez les informations de l'année scolaire sélectionnée.
				</template>
				<template v-else>
					Remplissez les informations ci-dessous pour créer une nouvelle année
					scolaire. Vous pourrez ensuite ajouter des périodes et des événements à
					cette année scolaire.
				</template>
			</p>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-2 right-8"
			/>
		</div>

		<form
			class="mt-8 bg-white rounded-lg p-6 shadow"
			@submit.prevent="handleSubmit"
		>
			<div class="grid grid-cols-2 gap-6 md:gap-8">
				<div class="col-span-2 space-y-3">
					<label
						class="flex items-center gap-2 font-medium opacity-90 text-primary"
					>
						<font-awesome-icon icon="tag" />
						<span>Libellé de l'année</span>
					</label>
					<input
						type="text"
						v-model="form.values.value.name"
						placeholder="Ex: 2025-2026"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
							form.touched.value.name && form.errors.value.name
								? 'border-red-500'
								: 'border-gray-300',
						]"
						@blur="
							form.setFieldTouched('name');
							form.validateField('name', validationRules.name);
						"
					/>
					<p
						v-if="form.touched.value.name && form.errors.value.name"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.name }}
					</p>
				</div>
				<div class="col-span-2 md:col-span-1 space-y-3">
					<label
						class="flex items-center gap-2 font-medium opacity-90 text-primary"
					>
						<font-awesome-icon icon="calendar-week" />
						<span>Date de rentrée</span>
					</label>
					<input
						type="date"
						v-model="form.values.value.startDate"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
							form.touched.value.startDate && form.errors.value.startDate
								? 'border-red-500'
								: 'border-gray-300',
						]"
						@blur="
							form.setFieldTouched('startDate');
							form.validateField('startDate', validationRules.startDate);
						"
					/>
					<p
						v-if="form.touched.value.startDate && form.errors.value.startDate"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.startDate }}
					</p>
				</div>
				<div class="col-span-2 md:col-span-1 space-y-3">
					<label
						class="flex items-center gap-2 font-medium opacity-90 text-primary"
					>
						<font-awesome-icon icon="calendar-check" />
						<span>Date de cloture</span>
					</label>
					<input
						type="date"
						v-model="form.values.value.endDate"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
							endDateError
								? 'border-red-500'
								: form.touched.value.endDate && form.errors.value.endDate
								? 'border-red-500'
								: 'border-gray-300',
						]"
						@blur="
							form.setFieldTouched('endDate');
							form.validateField('endDate', validationRules.endDate);
						"
					/>
					<p
						v-if="form.touched.value.endDate && form.errors.value.endDate"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.endDate }}
					</p>
					<p v-else-if="endDateError" class="text-xs text-red-500">
						{{ endDateError }}
					</p>
				</div>
				<template v-if="!isEditMode">
					<div class="col-span-2 space-y-3">
						<label
							class="flex items-center gap-2 font-medium opacity-90 text-primary"
						>
							<font-awesome-icon icon="sliders" />
							<span>Configuration initiale</span>
						</label>
						<div class="grid md:grid-cols-2 items-center gap-4">
							<label
								:class="[
									'bg-background rounded-lg p-4 border-2 cursor-pointer transition-all',
									initialConfig === 'import'
										? 'border-primary'
										: 'border-transparent hover:border-gray-300',
								]"
							>
								<input
									type="radio"
									name="initialConfig"
									value="import"
									v-model="initialConfig"
									class="sr-only"
								/>
								<div class="flex items-start gap-3">
									<div
										:class="[
											'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
											initialConfig === 'import'
												? 'border-primary'
												: 'border-gray-400',
										]"
									>
										<div
											v-if="initialConfig === 'import'"
											class="w-2.5 h-2.5 rounded-full bg-primary"
										></div>
									</div>
									<div>
										<h6 class="text-base font-bold">
											Importer de l'année précédente
										</h6>
										<p class="text-gray-500">
											Copier les classes, matières et enseignants
										</p>
									</div>
								</div>
							</label>
							<label
								:class="[
									'bg-background rounded-lg p-4 border-2 cursor-pointer transition-all',
									initialConfig === 'new'
										? 'border-primary'
										: 'border-transparent hover:border-gray-300',
								]"
							>
								<input
									type="radio"
									name="initialConfig"
									value="new"
									v-model="initialConfig"
									class="sr-only"
								/>
								<div class="flex items-start gap-3">
									<div
										:class="[
											'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
											initialConfig === 'new'
												? 'border-primary'
												: 'border-gray-400',
										]"
									>
										<div
											v-if="initialConfig === 'new'"
											class="w-2.5 h-2.5 rounded-full bg-primary"
										></div>
									</div>
									<div>
										<h6 class="text-base font-bold">Nouvelle structure</h6>
										<p class="text-gray-500">
											Répartir de zéro avec une configuration manuelle
										</p>
									</div>
								</div>
							</label>
						</div>
					</div>
					<div class="col-span-2 md:col-span-1 space-y-3 flex items-center gap-2">
						<input
							type="checkbox"
							id="configureImmediately"
							v-model="configureImmediately"
							class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
						/>
						<label
							for="configureImmediately"
							class="-mt-3 font-medium opacity-90 text-primary cursor-pointer"
						>
							Configurer immédiatement les dates clés du cycle
						</label>
					</div>
				</template>
			</div>

			<div
				class="mt-12 md:mt-8 flex flex-col md:flex-row md:justify-between gap-8 md:gap-4 md:items-center"
			>
				<div v-if="!isEditMode" class="-mt-4 col-span-2">
					<font-awesome-icon icon="info-circle" class="mr-2 text-primary" />
					<span class="text-gray-400"
						>L'année en cours restera active jusqu'au passage officiel</span
					>
				</div>
				<div v-else class="-mt-4 col-span-2"></div>

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
						:disabled="form.isSubmitting.value"
						class="bg-primary text-white w-full md:w-32 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					>
						<font-awesome-icon
							v-if="form.isSubmitting.value"
							icon="circle-notch"
							class="animate-spin mr-2"
						/>
						<font-awesome-icon v-else :icon="isEditMode ? 'save' : 'plus-circle'" class="mr-2" />
						<span>{{ form.isSubmitting.value ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer') }}</span>
					</button>
				</div>
			</div>
		</form>
	</div>
</template>
