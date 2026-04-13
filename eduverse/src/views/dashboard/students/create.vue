<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStudentStore } from "@/stores/student.store";
import { useClassStore } from "@/stores/class.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/composables/useToast";
import type {
	Gender,
	EnrollmentType,
	Guardian,
	StudentSchoolHistory,
	StudentServices,
	StudentDocuments,
	StudentFormData,
	Student,
} from "@/types/student";

defineOptions({
	layout: false,
});

const router = useRouter();
const studentStore = useStudentStore();
const classStore = useClassStore();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

const enrollmentType = ref<EnrollmentType>("new");
const firstName = ref("");
const lastName = ref("");
const gender = ref<Gender>("male");
const dateOfBirth = ref("");
const placeOfBirth = ref("");
const address = ref("");

const selectedClassId = ref("");

const previousSchool = ref("");
const lastClass = ref("");
const isRepeating = ref(false);

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

const isSubmitting = ref(false);
const generatedMatricule = ref("");
const photoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);
const photoError = ref("");

const reEnrollmentSearch = ref("");
const selectedArchivedStudent = ref<Student | null>(null);

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const enrollmentTypeOptions = [
	{ value: "new", label: "Nouvelle inscription", icon: "user-plus" },
	{ value: "re_enrollment", label: "Réinscription", icon: "redo" },
	{ value: "transfer", label: "Transfert entrant", icon: "exchange-alt" },
];

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

const showIdentityForm = computed(() => {
	return enrollmentType.value === "new" || enrollmentType.value === "transfer";
});

const showSchoolHistory = computed(() => {
	return enrollmentType.value === "new" || enrollmentType.value === "transfer";
});

const showReEnrollmentFields = computed(() => {
	return enrollmentType.value === "re_enrollment";
});

const showStep3 = computed(() => {
	return enrollmentType.value !== "re_enrollment";
});

const archivedStudents = computed(() => {
	if (!reEnrollmentSearch.value) return [];
	const search = reEnrollmentSearch.value.toLowerCase();
	return studentStore.students
		.filter(
			(s) =>
				s.status !== "active" &&
				(s.firstName.toLowerCase().includes(search) ||
					s.lastName.toLowerCase().includes(search) ||
					s.matricule.toLowerCase().includes(search))
		)
		.slice(0, 10);
});

const selectArchivedStudent = (student: Student) => {
	selectedArchivedStudent.value = student;
	reEnrollmentSearch.value = "";
	generatedMatricule.value = `REN-${new Date().getFullYear()}${Math.floor(
		Math.random() * 100000
	)
		.toString()
		.padStart(5, "0")}`;
};

const clearSelectedStudent = () => {
	selectedArchivedStudent.value = null;
};

const generateMatriculePreview = () => {
	const year = new Date().getFullYear();
	const prefix =
		enrollmentType.value === "transfer"
			? "TRF"
			: enrollmentType.value === "re_enrollment"
			? "REN"
			: "COL";
	const random = Math.floor(Math.random() * 100000)
		.toString()
		.padStart(5, "0");
	generatedMatricule.value = `${prefix}-${year}${random}`;
};

watch(enrollmentType, () => {
	generateMatriculePreview();
});

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
	if (enrollmentType.value === "re_enrollment") {
		if (!selectedArchivedStudent.value || !selectedClassId.value) {
			toast.error("Veuillez sélectionner un élève et une classe");
			return;
		}
	} else {
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

		if (
			showStep3.value &&
			(guardians.value.length === 0 || !guardians.value[0].name)
		) {
			toast.error("Veuillez ajouter au moins un responsable légal");
			return;
		}
	}

	const authStore = useAuthStore();
	const schoolYearStore = useSchoolYearStore();
	const schoolId = authStore.school?.id;
	const activeYear = schoolYearStore.schoolYears.find((y) => y.isActive);

	if (!schoolId || !activeYear) {
		toast.error("Configuration invalide");
		return;
	}

	isSubmitting.value = true;

	let formData: StudentFormData;

	if (
		enrollmentType.value === "re_enrollment" &&
		selectedArchivedStudent.value
	) {
		formData = {
			firstName: selectedArchivedStudent.value.firstName,
			lastName: selectedArchivedStudent.value.lastName,
			gender: selectedArchivedStudent.value.gender,
			dateOfBirth: selectedArchivedStudent.value.dateOfBirth,
			placeOfBirth: selectedArchivedStudent.value.placeOfBirth,
			address: selectedArchivedStudent.value.address,
			phone: "",
			email: "",
			guardianName: selectedArchivedStudent.value.guardianName,
			guardianPhone: selectedArchivedStudent.value.guardianPhone,
			guardianRelation: selectedArchivedStudent.value.guardianRelation,
			classId: selectedClassId.value,
			enrollmentType: "re_enrollment",
			guardians: [],
			schoolHistory: null,
			services: {
				hasTransport: hasTransport.value,
				hasCanteen: hasCanteen.value,
			},
			documents: documents.value,
			photoUrl: selectedArchivedStudent.value.photoUrl,
		};
	} else {
		const schoolHistory: StudentSchoolHistory | null = showSchoolHistory.value
			? {
					previousSchool: previousSchool.value,
					lastClass: lastClass.value,
					isRepeating: isRepeating.value,
			  }
			: null;

		const services: StudentServices = {
			hasTransport: hasTransport.value,
			hasCanteen: hasCanteen.value,
		};

		formData = {
			firstName: firstName.value,
			lastName: lastName.value,
			gender: gender.value,
			dateOfBirth: dateOfBirth.value,
			placeOfBirth: placeOfBirth.value,
			address: address.value,
			phone: "",
			email: "",
			guardianName: guardians.value[0]?.name || "",
			guardianPhone: guardians.value[0]?.phone || "",
			guardianRelation: guardians.value[0]?.relation || "",
			classId: selectedClassId.value,
			enrollmentType: enrollmentType.value,
			guardians: showStep3.value ? guardians.value : [],
			schoolHistory,
			services,
			documents: documents.value,
			photoUrl: photoPreview.value,
		};
	}

	const success = await studentStore.createStudentFromForm(
		schoolId,
		activeYear.id,
		formData
	);

	isSubmitting.value = false;

	if (success) {
		toast.success("Étudiant inscrit avec succès");
		router.push("/dashboard/students/list");
	} else {
		toast.error(studentStore.error || "Erreur lors de l'inscription");
	}
};

onMounted(async () => {
	await schoolYearStore.fetchSchoolYears();
	await classStore.fetchClasses();
	generateMatriculePreview();
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
			<h2 class="text-lg lg:text-xl font-semibold">Inscrire un nouvel élève</h2>
			<p class="text-sm w-[70%]">
				Remplissez les informations ci-dessous pour enregistrer un nouvel élève.
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
						<font-awesome-icon
							icon="clipboard-list"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Type d'inscription</span>
					</h3>
				</div>

				<div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
					<label
						v-for="option in enrollmentTypeOptions"
						:key="option.value"
						class="cursor-pointer relative"
					>
						<input
							type="radio"
							:value="option.value"
							v-model="enrollmentType"
							class="peer sr-only"
						/>
						<div
							class="p-4 rounded-lg border-2 transition-all duration-300 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-300"
							:class="
								enrollmentType === option.value
									? 'border-primary bg-primary/5'
									: 'border-gray-200'
							"
						>
							<font-awesome-icon
								:icon="option.icon"
								class="text-xl mb-2 block"
								:class="
									enrollmentType === option.value
										? 'text-primary'
										: 'text-gray-400'
								"
							/>
							<span
								class="font-medium text-sm"
								:class="
									enrollmentType === option.value
										? 'text-primary'
										: 'text-gray-600'
								"
							>
								{{ option.label }}
							</span>
						</div>
					</label>
				</div>
			</div>

			<div class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon icon="user" class="p-2 rounded-lg bg-gray-200" />
						<span
							>Étape 1:
							{{
								showIdentityForm ? "Données d'identité" : "Sélection de l'élève"
							}}</span
						>
					</h3>

					<span
						v-if="generatedMatricule"
						class="w-fit text-green-600 tracking-widest uppercase text-[0.7em] font-bold bg-green-600/40 px-4 py-2 rounded-lg"
					>
						Matricule: {{ generatedMatricule }}
					</span>
				</div>

				<div
					v-if="showIdentityForm"
					class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
				>
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

				<div v-else class="mt-8 space-y-6">
					<div class="relative">
						<font-awesome-icon
							icon="search"
							class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							v-model="reEnrollmentSearch"
							placeholder="Rechercher par nom, prénom ou matricule..."
							class="w-full indent-8 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
					</div>

					<div
						v-if="reEnrollmentSearch && archivedStudents.length > 0"
						class="border border-gray-200 rounded-lg overflow-hidden"
					>
						<div
							v-for="student in archivedStudents"
							:key="student.id"
							@click="selectArchivedStudent(student)"
							class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
						>
							<img
								:src="
									student.photoUrl ||
									'https://randomuser.me/api/portraits/men/1.jpg'
								"
								:alt="`${student.firstName} ${student.lastName}`"
								class="w-12 h-12 rounded-full object-cover"
							/>
							<div class="flex-1">
								<p class="font-medium text-primary">
									{{ student.firstName }} {{ student.lastName }}
								</p>
								<p class="text-sm text-gray-500">
									Matricule: {{ student.matricule }} | Classe:
									{{ student.className || "-" }}
								</p>
							</div>
							<font-awesome-icon icon="chevron-right" class="text-gray-400" />
						</div>
					</div>

					<div
						v-if="selectedArchivedStudent"
						class="bg-green-50 border border-green-200 rounded-lg p-4"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<img
									:src="
										selectedArchivedStudent.photoUrl ||
										'https://randomuser.me/api/portraits/men/1.jpg'
									"
									:alt="`${selectedArchivedStudent.firstName} ${selectedArchivedStudent.lastName}`"
									class="w-16 h-16 rounded-full object-cover border-2 border-green-500"
								/>
								<div>
									<p class="font-bold text-lg text-primary">
										{{ selectedArchivedStudent.firstName }}
										{{ selectedArchivedStudent.lastName }}
									</p>
									<p class="text-sm text-gray-600">
										Matricule: {{ selectedArchivedStudent.matricule }}
									</p>
									<p class="text-sm text-gray-600">
										Date de naissance:
										{{
											new Date(
												selectedArchivedStudent.dateOfBirth
											).toLocaleDateString("fr-FR")
										}}
									</p>
									<p class="text-sm text-gray-600">
										Dernière classe:
										{{ selectedArchivedStudent.className || "Non affecté" }}
									</p>
								</div>
							</div>
							<button
								type="button"
								@click="clearSelectedStudent"
								class="text-red-600 hover:text-red-700"
							>
								<font-awesome-icon icon="times" class="text-xl" />
							</button>
						</div>
					</div>

					<p
						v-if="reEnrollmentSearch && archivedStudents.length === 0"
						class="text-center text-gray-500 py-4"
					>
						Aucun élève trouvé dans les archives
					</p>
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
						<span>Étape 2: Parcours académique</span>
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
					<div v-if="showSchoolHistory" class="space-y-4">
						<h4 class="text-xs uppercase tracking-widest font-bold">
							historique scolaire
						</h4>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<span>Établissement précédent</span>
							</label>
							<input
								type="text"
								v-model="previousSchool"
								placeholder="Nom de l'école"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div class="space-y-3">
							<label
								class="flex items-center gap-2 font-medium opacity-90 text-primary"
							>
								<span>Dernière classe</span>
							</label>
							<input
								type="text"
								v-model="lastClass"
								placeholder="Ex: 1ère S"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div class="mt-6 flex items-center gap-2">
							<input
								type="checkbox"
								v-model="isRepeating"
								class="w-3 h-3 text-primary border-gray-300 rounded focus:ring-primary"
							/>
							<label class="text-xs font-medium opacity-90 cursor-pointer">
								Élève redoublant de cette classe
							</label>
						</div>
					</div>
					<div v-if="showReEnrollmentFields" class="space-y-4">
						<h4 class="text-xs uppercase tracking-widest font-bold">
							informations réinscription
						</h4>
						<p class="text-sm text-gray-500">
							L'élève est déjà inscrit dans l'établissement. Les informations de
							réinscription seront automatiquement enregistrées.
						</p>
					</div>
				</div>
			</div>

			<div v-if="showStep3" class="mt-8 bg-white rounded-lg p-6 shadow">
				<div
					class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center"
				>
					<h3 class="flex gap-3 items-center font-bold text-base text-primary">
						<font-awesome-icon
							icon="users"
							class="p-2 rounded-lg bg-gray-200"
						/>
						<span>Étape 3: Responsables légaux</span>
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
						<span>Étape 4: Service & finance</span>
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
						<span>Étape 5: Documents joints</span>
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
					:disabled="isSubmitting"
					class="md:w-44 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
				>
					<span
						v-if="isSubmitting"
						class="loading loading-spinner loading-sm"
					></span>
					<span>{{ isSubmitting ? "Enregistrement..." : "Enregistrer" }}</span>
				</button>
			</div>
		</form>
	</div>
</template>
