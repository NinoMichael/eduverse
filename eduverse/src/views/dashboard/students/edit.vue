<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStudentStore } from "@/stores/student.store";
import { useClassStore } from "@/stores/class.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useToast } from "@/composables/useToast";
import { unifiedGuardianService } from "@/services/unified.service";
import type {
	Gender,
	Guardian,
	StudentServices,
	StudentDocuments,
	Student,
} from "@/types/student";

defineOptions({
	layout: false,
});

const router = useRouter();
const route = useRoute();
const studentStore = useStudentStore();
const classStore = useClassStore();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const isLoading = ref(false);
const studentId = computed(() => route.params.id as string);
const currentStudent = ref<Student | null>(null);

const firstName = ref("");
const lastName = ref("");
const gender = ref<Gender>("male");
const dateOfBirth = ref("");
const placeOfBirth = ref("");
const address = ref("");

const selectedClassId = ref("");

const guardians = ref<Guardian[]>([
	{
		name: "",
		relation: "",
		phone: "",
		profession: "",
		isEmergencyContact: true,
	},
]);

const hasTransport = ref(false);
const hasCanteen = ref(false);

const paymentMode = ref("");

const documents = ref<StudentDocuments>({
	birthCertificate: false,
	photoId: false,
	residenceCertificate: false,
});

const photoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);
const photoError = ref("");

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const relationOptions = [
	{ value: "Père", label: "Père" },
	{ value: "Mère", label: "Mère" },
	{ value: "Tuteur", label: "Tuteur" },
	{ value: "Grand-parent", label: "Grand-parent" },
	{ value: "Autre", label: "Autre" },
];

const paymentModes = [
	{ value: "cash", label: "Espèces" },
	{ value: "bank_transfer", label: "Virement bancaire" },
	{ value: "mobile_money", label: "Mobile Money" },
	{ value: "cheque", label: "Chèque" },
	{ value: "installment", label: "Paiement échelonné" },
];

const handlePhotoChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file) return;

	photoError.value = "";

	if (!ALLOWED_TYPES.includes(file.type)) {
		photoError.value = "Format non autorisé. Utilisez JPEG, JPG ou PNG.";
		return;
	}

	if (file.size > MAX_PHOTO_SIZE) {
		photoError.value = "La taille du fichier ne doit pas dépasser 2MB.";
		return;
	}

	photoFile.value = file;

	const reader = new FileReader();
	reader.onload = (e) => {
		photoPreview.value = e.target?.result as string;
	};
	reader.readAsDataURL(file);
};

const removePhoto = () => {
	photoFile.value = null;
	photoPreview.value = null;
	photoError.value = "";
	const fileInput = document.getElementById("photo-input") as HTMLInputElement;
	if (fileInput) fileInput.value = "";
};

const addGuardian = () => {
	guardians.value.push({
		name: "",
		relation: "",
		phone: "",
		profession: "",
		isEmergencyContact: false,
	});
};

const removeGuardian = (index: number) => {
	if (guardians.value.length > 1) {
		guardians.value.splice(index, 1);
		if (guardians.value.length === 1) {
			guardians.value[0].isEmergencyContact = true;
		}
	}
};

const setEmergencyContact = (index: number) => {
	guardians.value.forEach((g, i) => {
		g.isEmergencyContact = i === index;
	});
};

const handleSubmit = async () => {
	if (
		!firstName.value ||
		!lastName.value ||
		!dateOfBirth.value ||
		!placeOfBirth.value ||
		!selectedClassId.value
	) {
		toast.error("Veuillez remplir tous les champs obligatoires");
		return;
	}

	if (guardians.value.length === 0 || !guardians.value[0].name) {
		toast.error("Veuillez ajouter au moins un responsable légal");
		return;
	}

	isLoading.value = true;

	const services: StudentServices = {
		hasTransport: hasTransport.value,
		hasCanteen: hasCanteen.value,
	};

	const formData = {
		firstName: firstName.value,
		lastName: lastName.value,
		gender: gender.value,
		dateOfBirth: dateOfBirth.value,
		placeOfBirth: placeOfBirth.value,
		address: address.value,
		phone: "",
		email: "",
		guardianName: guardians.value[0].name,
		guardianPhone: guardians.value[0].phone,
		guardianRelation: guardians.value[0].relation,
		classId: selectedClassId.value,
		enrollmentType: currentStudent.value?.enrollmentType || "new",
		guardians: guardians.value,
		schoolHistory: null,
		services,
		documents: documents.value,
		photoUrl: photoPreview.value || currentStudent.value?.photoUrl,
	};

	const success = await studentStore.updateStudent(studentId.value, formData);

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
	await classStore.fetchClasses();

	const student = studentStore.getStudentById(studentId.value);
	if (student) {
		currentStudent.value = student;
		firstName.value = student.firstName;
		lastName.value = student.lastName;
		gender.value = student.gender;
		dateOfBirth.value = student.dateOfBirth;
		placeOfBirth.value = student.placeOfBirth;
		address.value = student.address;
		selectedClassId.value = student.classId || "";
		photoPreview.value = student.photoUrl;
		hasTransport.value = student.services?.hasTransport || false;
		hasCanteen.value = student.services?.hasCanteen || false;
		documents.value = student.documents || {
			birthCertificate: false,
			photoId: false,
			residenceCertificate: false,
		};

		// Charger les responsables depuis le service
		const guardiansResponse = await unifiedGuardianService.getGuardiansByStudentId(studentId.value);
		if (guardiansResponse.success && guardiansResponse.data && guardiansResponse.data.length > 0) {
			guardians.value = guardiansResponse.data;
		} else {
			// Fallback sur les anciens champs si pas de responsables en base
			if (
				student.guardianName ||
				student.guardianPhone ||
				student.guardianRelation
			) {
				guardians.value = [
					{
						name: student.guardianName,
						relation: student.guardianRelation,
						phone: student.guardianPhone,
						profession: "",
						isEmergencyContact: true,
					},
				];
			}
		}
	} else {
		toast.error("Étudiant non trouvé");
		router.push("/dashboard/students/list");
	}
});
</script>

<template>
	<div class="space-y-4 lg:space-y-6">
		<button
			@click="router.push('/dashboard/students/list')"
			class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
		>
			<font-awesome-icon icon="arrow-left" />
			<span>Retour à la liste</span>
		</button>

		<div
			class="-mt-2 relative space-y-1 bg-primary text-white p-8 rounded-lg w-full"
		>
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

		<form class="mt-8" @submit.prevent="handleSubmit">
			<div class="bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon icon="user" class="p-2 rounded-lg bg-gray-200" />
						<span>Données d'identité</span>
					</h3>

					<span
						v-if="currentStudent"
						class="w-fit text-green-600 tracking-widest uppercase text-[0.7em] font-bold bg-green-600/40 px-4 py-2 rounded-lg"
					>
						Matricule: {{ currentStudent.matricule }}
					</span>
				</div>

				<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="md:col-span-1">
						<label class="cursor-pointer block">
							<input
								type="file"
								id="photo-input"
								accept="image/jpeg,image/jpg,image/png"
								class="hidden"
								@change="handlePhotoChange"
							/>
							<div
								v-if="!photoPreview"
								class="hover:scale-105 hover:transition-all hover:duration-500 text-gray-400 font-bold flex flex-col gap-4 justify-center items-center px-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-full h-44"
							>
								<font-awesome-icon icon="camera" class="text-2xl" />
								<p class="text-[0.7em] uppercase tracking-widest">
									télécharger photo
								</p>
							</div>
							<div v-else class="relative w-full h-44">
								<img
									:src="photoPreview"
									alt="Aperçu photo"
									class="w-full h-full object-cover rounded-lg"
								/>
								<button
									type="button"
									@click.stop="removePhoto"
									class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
								>
									<font-awesome-icon icon="times" />
								</button>
							</div>
						</label>
						<p v-if="photoError" class="text-xs text-red-500 mt-2 text-center">
							{{ photoError }}
						</p>
						<p v-else class="text-xs text-center mt-6 opacity-50 font-medium">
							Formats: JPEG, JPG, PNG | Max: 2MB
						</p>
					</div>
					<div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="user" />
								<span>Nom <span class="text-red-500">*</span></span>
							</label>
							<input
								type="text"
								v-model="lastName"
								placeholder="Nom de l'élève"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>

						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="user" />
								<span>Prénoms <span class="text-red-500">*</span></span>
							</label>
							<input
								type="text"
								v-model="firstName"
								placeholder="Prénom de l'élève"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>

						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="venus-mars" />
								<span>Sexe <span class="text-red-500">*</span></span>
							</label>
							<select
								v-model="gender"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							>
								<option value="male">Masculin</option>
								<option value="female">Féminin</option>
							</select>
						</div>

						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="birthday-cake" />
								<span
									>Date de naissance <span class="text-red-500">*</span></span
								>
							</label>
							<input
								type="date"
								v-model="dateOfBirth"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>

						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="map-marker-alt" />
								<span
									>Lieu de naissance <span class="text-red-500">*</span></span
								>
							</label>
							<input
								type="text"
								v-model="placeOfBirth"
								placeholder="Lieu de naissance"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>

						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="home" />
								<span>Domicile</span>
							</label>
							<input
								type="text"
								v-model="address"
								placeholder="Adresse de l'élève"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon
							icon="graduation-cap"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Parcours académique</span>
					</h3>
				</div>

				<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<h4 class="text-xs uppercase tracking-widest font-bold">
							affectation actuelle <span class="text-red-500">*</span>
						</h4>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<span>Classe</span>
							</label>
							<select
								v-model="selectedClassId"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							>
								<option value="">Sélectionner</option>
								<option
									v-for="cls in classStore.classes"
									:key="cls.id"
									:value="cls.id"
								>
									{{ cls.name }}
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon
							icon="users"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Responsables légaux</span>
					</h3>
					<button
						type="button"
						@click="addGuardian"
						class="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2"
					>
						<font-awesome-icon icon="plus-circle" />
						<span>Ajouter un parent/tuteur</span>
					</button>
				</div>

				<div class="mt-6 space-y-4">
					<div
						v-for="(guardian, index) in guardians"
						:key="index"
						class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-6 rounded-lg"
					>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="user-tie" />
								<span>Nom complet <span class="text-red-500">*</span></span>
							</label>
							<input
								type="text"
								v-model="guardian.name"
								placeholder="Nom et prénom"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="user-friends" />
								<span>Relation <span class="text-red-500">*</span></span>
							</label>
							<select
								v-model="guardian.relation"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							>
								<option value="">Sélectionner</option>
								<option
									v-for="rel in relationOptions"
									:key="rel.value"
									:value="rel.value"
								>
									{{ rel.label }}
								</option>
							</select>
						</div>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="phone" />
								<span>Téléphone <span class="text-red-500">*</span></span>
							</label>
							<input
								type="text"
								v-model="guardian.phone"
								placeholder="Numéro de téléphone"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
								required
							/>
						</div>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<font-awesome-icon icon="briefcase" />
								<span>Profession</span>
							</label>
							<input
								type="text"
								v-model="guardian.profession"
								placeholder="Profession"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div
							class="mt-6 md:col-span-2 flex justify-between gap-4 items-center"
						>
							<div class="flex items-center gap-2">
								<input
									type="radio"
									:name="`emergency-${index}`"
									:checked="guardian.isEmergencyContact"
									@change="setEmergencyContact(index)"
									class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
								/>
								<label class="text-xs font-medium opacity-90 cursor-pointer">
									Contact d'urgence
								</label>
							</div>
							<button
								v-if="guardians.length > 1"
								type="button"
								@click="removeGuardian(index)"
								class="bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg transition-colors"
								title="Supprimer ce responsable"
							>
								<font-awesome-icon icon="trash" class="text-red-600/70" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon
							icon="clipboard-check"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Service & finance</span>
					</h3>
				</div>

				<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<h4 class="uppercase text-xs tracking-widest font-bold">
							services additionnels
						</h4>
						<div class="space-y-4">
							<div
								class="bg-gray-100 rounded-lg p-4 flex justify-between gap-4 items-center"
							>
								<div class="flex gap-4 items-center">
									<font-awesome-icon
										icon="bus"
										class="p-2 text-xl text-blue-600/70 rounded-lg bg-gray-200"
									/>
									<div>
										<h6 class="font-bold">Transport scolaire</h6>
										<p class="opacity-60">Service de ramassage</p>
									</div>
								</div>
								<label class="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										v-model="hasTransport"
										class="sr-only peer"
									/>
									<div
										class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
									></div>
								</label>
							</div>
							<div
								class="bg-gray-100 rounded-lg p-4 flex justify-between gap-4 items-center"
							>
								<div class="flex gap-4 items-center">
									<font-awesome-icon
										icon="spoon"
										class="p-2 text-xl text-green-600/70 rounded-lg bg-gray-200"
									/>
									<div>
										<h6 class="font-bold">Cantine</h6>
										<p class="opacity-60">Repas du midi</p>
									</div>
								</div>
								<label class="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										v-model="hasCanteen"
										class="sr-only peer"
									/>
									<div
										class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
									></div>
								</label>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<h4 class="uppercase text-xs tracking-widest font-bold">finance</h4>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<span>Mode de paiement</span>
							</label>
							<select
								v-model="paymentMode"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							>
								<option value="">Sélectionner</option>
								<option
									v-for="mode in paymentModes"
									:key="mode.value"
									:value="mode.value"
								>
									{{ mode.label }}
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon
							icon="folder"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Documents joints</span>
					</h3>
				</div>
				<p class="mt-3">
					Veuillez cocher les documents déjà joints par l'élève
				</p>

				<div class="mt-8 space-y-4">
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							v-model="documents.birthCertificate"
							class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
						/>
						<label class="font-medium text-primary cursor-pointer">
							Bulletin de naissance / Copie d'acte de naissance / CIN
						</label>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							v-model="documents.photoId"
							class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
						/>
						<label class="font-medium text-primary cursor-pointer">
							Photo d'identité
						</label>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							v-model="documents.residenceCertificate"
							class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
						/>
						<label class="font-medium text-primary cursor-pointer">
							Certificat de résidence
						</label>
					</div>
				</div>
			</div>

			<div class="mt-12 mb-8 flex flex-col md:flex-row md:justify-end gap-4">
				<button
					type="button"
					@click="router.push('/dashboard/students/list')"
					class="md:w-44 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Annuler
				</button>
				<button
					type="submit"
					:disabled="isLoading"
					class="md:w-44 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
				>
					<span
						v-if="isLoading"
						class="loading loading-spinner loading-sm"
					></span>
					<span>{{ isLoading ? "Enregistrement..." : "Enregistrer" }}</span>
				</button>
			</div>
		</form>
	</div>
</template>
