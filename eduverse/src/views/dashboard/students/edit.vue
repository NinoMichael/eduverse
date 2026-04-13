<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStudentStore } from "@/stores/student.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useToast } from "@/composables/useToast";
import type { StudentFormData, Gender, Student } from "@/types/student";

defineOptions({
	layout: false,
});

const router = useRouter();
const route = useRoute();
const studentStore = useStudentStore();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const isLoading = ref(false);
const studentId = computed(() => route.params.id as string);
const isEditMode = computed(() => !!studentId.value);

const form = ref<StudentFormData>({
	firstName: "",
	lastName: "",
	gender: "male" as Gender,
	dateOfBirth: "",
	placeOfBirth: "",
	address: "",
	phone: "",
	email: "",
	guardianName: "",
	guardianPhone: "",
	guardianRelation: "",
	classId: null,
});

const errors = ref<Record<string, string>>({});

const currentStudent = ref<Student | null>(null);

const validateForm = (): boolean => {
	errors.value = {};
	
	if (!form.value.firstName.trim()) {
		errors.value.firstName = "Le prénom est requis";
	}
	if (!form.value.lastName.trim()) {
		errors.value.lastName = "Le nom est requis";
	}
	if (!form.value.dateOfBirth) {
		errors.value.dateOfBirth = "La date de naissance est requise";
	}
	if (!form.value.placeOfBirth.trim()) {
		errors.value.placeOfBirth = "Le lieu de naissance est requis";
	}
	if (!form.value.guardianName.trim()) {
		errors.value.guardianName = "Le nom du parent/tuteur est requis";
	}
	if (!form.value.guardianPhone.trim()) {
		errors.value.guardianPhone = "Le contact du parent est requis";
	}
	if (!form.value.guardianRelation.trim()) {
		errors.value.guardianRelation = "La relation est requise";
	}
	
	return Object.keys(errors.value).length === 0;
};

const handleCancel = () => {
	router.push("/dashboard/students/list");
};

const handleSubmit = async () => {
	if (!validateForm()) {
		toast.error("Veuillez corriger les erreurs dans le formulaire");
		return;
	}

	isLoading.value = true;
	
	const success = await studentStore.updateStudent(studentId.value, form.value);
	
	isLoading.value = false;

	if (success) {
		toast.success("Étudiant modifié avec succès");
		router.push("/dashboard/students/list");
	} else {
		toast.error(studentStore.error || "Erreur lors de la modification");
	}
};

onMounted(async () => {
	await schoolYearStore.fetchSchoolYears();
	
	if (isEditMode.value && studentId.value) {
		const student = studentStore.getStudentById(studentId.value);
		if (student) {
			currentStudent.value = student;
			form.value = {
				firstName: student.firstName,
				lastName: student.lastName,
				gender: student.gender,
				dateOfBirth: student.dateOfBirth,
				placeOfBirth: student.placeOfBirth,
				address: student.address,
				phone: student.phone,
				email: student.email,
				guardianName: student.guardianName,
				guardianPhone: student.guardianPhone,
				guardianRelation: student.guardianRelation,
				classId: student.classId,
			};
		} else {
			toast.error("Étudiant non trouvé");
			router.push("/dashboard/students/list");
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
				Modifier les informations de l'étudiant
			</h2>
			<p class="text-sm w-[70%]">
				Modifiez les informations de l'étudiant sélectionné.
			</p>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-2 right-8"
			/>
		</div>

		<div v-if="currentStudent" class="bg-white rounded-lg p-4 shadow mb-4">
			<div class="flex items-center gap-4">
				<img
					:src="currentStudent.photoUrl || 'https://randomuser.me/api/portraits/men/1.jpg'"
					:alt="`${currentStudent.firstName} ${currentStudent.lastName}`"
					class="w-16 h-16 rounded-full object-cover"
				/>
				<div>
					<p class="font-semibold text-lg">{{ currentStudent.firstName }} {{ currentStudent.lastName }}</p>
					<p class="text-sm text-gray-500">Matricule: {{ currentStudent.matricule }}</p>
				</div>
			</div>
		</div>

		<form
			class="mt-8 bg-white rounded-lg p-6 shadow"
			@submit.prevent="handleSubmit"
		>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="user" />
						<span>Prénom</span>
					</label>
					<input
						type="text"
						v-model="form.firstName"
						placeholder="Prénom de l'étudiant"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
							errors.firstName ? 'border-red-500' : 'border-gray-300',
						]"
					/>
					<p v-if="errors.firstName" class="text-xs text-red-500">
						{{ errors.firstName }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="user" />
						<span>Nom</span>
					</label>
					<input
						type="text"
						v-model="form.lastName"
						placeholder="Nom de l'étudiant"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
							errors.lastName ? 'border-red-500' : 'border-gray-300',
						]"
					/>
					<p v-if="errors.lastName" class="text-xs text-red-500">
						{{ errors.lastName }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="venus-mars" />
						<span>Sexe</span>
					</label>
					<select
						v-model="form.gender"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					>
						<option value="male">Masculin</option>
						<option value="female">Féminin</option>
					</select>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="birthday-cake" />
						<span>Date de naissance</span>
					</label>
					<input
						type="date"
						v-model="form.dateOfBirth"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
							errors.dateOfBirth ? 'border-red-500' : 'border-gray-300',
						]"
					/>
					<p v-if="errors.dateOfBirth" class="text-xs text-red-500">
						{{ errors.dateOfBirth }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="map-marker-alt" />
						<span>Lieu de naissance</span>
					</label>
					<input
						type="text"
						v-model="form.placeOfBirth"
						placeholder="Lieu de naissance"
						:class="[
							'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
							errors.placeOfBirth ? 'border-red-500' : 'border-gray-300',
						]"
					/>
					<p v-if="errors.placeOfBirth" class="text-xs text-red-500">
						{{ errors.placeOfBirth }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="home" />
						<span>Adresse</span>
					</label>
					<input
						type="text"
						v-model="form.address"
						placeholder="Adresse de l'étudiant"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="phone" />
						<span>Téléphone</span>
					</label>
					<input
						type="tel"
						v-model="form.phone"
						placeholder="Numéro de téléphone"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
						<font-awesome-icon icon="envelope" />
						<span>Email</span>
					</label>
					<input
						type="email"
						v-model="form.email"
						placeholder="Email de l'étudiant"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
			</div>

			<div class="mt-8 border-t pt-6">
				<h3 class="text-lg font-semibold mb-4 text-primary">
					Informations du parent/tuteur
				</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-3">
						<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
							<font-awesome-icon icon="user-tie" />
							<span>Nom du parent/tuteur</span>
						</label>
						<input
							type="text"
							v-model="form.guardianName"
							placeholder="Nom complet du parent"
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
								errors.guardianName ? 'border-red-500' : 'border-gray-300',
							]"
						/>
						<p v-if="errors.guardianName" class="text-xs text-red-500">
							{{ errors.guardianName }}
						</p>
					</div>

					<div class="space-y-3">
						<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
							<font-awesome-icon icon="user-friends" />
							<span>Relation</span>
						</label>
						<select
							v-model="form.guardianRelation"
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
								errors.guardianRelation ? 'border-red-500' : 'border-gray-300',
							]"
						>
							<option value="">Sélectionner...</option>
							<option value="Père">Père</option>
							<option value="Mère">Mère</option>
							<option value="Tuteur">Tuteur</option>
							<option value="Grand-parent">Grand-parent</option>
							<option value="Autre">Autre</option>
						</select>
						<p v-if="errors.guardianRelation" class="text-xs text-red-500">
							{{ errors.guardianRelation }}
						</p>
					</div>

					<div class="space-y-3">
						<label class="flex items-center gap-2 font-medium opacity-90 text-primary">
							<font-awesome-icon icon="phone-alt" />
							<span>Téléphone du parent</span>
						</label>
						<input
							type="tel"
							v-model="form.guardianPhone"
							placeholder="Numéro de téléphone"
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
								errors.guardianPhone ? 'border-red-500' : 'border-gray-300',
							]"
						/>
						<p v-if="errors.guardianPhone" class="text-xs text-red-500">
							{{ errors.guardianPhone }}
						</p>
					</div>
				</div>
			</div>

			<div class="mt-8 flex justify-end gap-4">
				<button
					type="button"
					@click="handleCancel"
					class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Annuler
				</button>
				<button
					type="submit"
					:disabled="isLoading"
					class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
				>
					<span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
					<span v-else>Enregistrer</span>
				</button>
			</div>
		</form>
	</div>
</template>
