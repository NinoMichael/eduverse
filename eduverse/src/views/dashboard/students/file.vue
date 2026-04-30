<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStudentStore } from "@/stores/student.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import { useToast } from "@/composables/useToast";
import StudentProfileTab from "@/components/students/StudentProfileTab.vue";
import StudentSchoolPathTab from "@/components/students/StudentSchoolPathTab.vue";
import StudentGuardiansTab from "@/components/students/StudentGuardiansTab.vue";
import StudentGradesTab from "@/components/students/StudentGradesTab.vue";
import StudentAttendanceTab from "@/components/students/StudentAttendanceTab.vue";
import StudentFinanceTab from "@/components/students/StudentFinanceTab.vue";
import StudentDocumentsTab from "@/components/students/StudentDocumentsTab.vue";
import StudentServicesTab from "@/components/students/StudentServicesTab.vue";
import StudentAnalyticsTab from "@/components/students/StudentAnalyticsTab.vue";

const router = useRouter();
const route = useRoute();
const studentStore = useStudentStore();
const schoolYearStore = useSchoolYearStore();
const toast = useToast();

type TabKey =
	| "profile"
	| "schoolPath"
	| "guardians"
	| "grades"
	| "attendance"
	| "finance"
	| "documents"
	| "services"
	| "analytics";

const tabs: { key: TabKey; label: string }[] = [
	{ key: "profile", label: "Profil" },
	{ key: "schoolPath", label: "Parcours scolaire" },
	{ key: "guardians", label: "Responsables" },
	{ key: "grades", label: "Notes et bulletins" },
	{ key: "attendance", label: "Assiduité" },
	{ key: "finance", label: "Finance" },
	{ key: "documents", label: "Documents" },
	{ key: "services", label: "Services" },
	{ key: "analytics", label: "Analytique" },
];

const activeTab = ref<TabKey>("profile");
const isLoading = ref(false);

const studentId = computed(() => route.params.id as string);

const student = computed(() => {
	if (!studentId.value) return null;
	return studentStore.getStudentById(studentId.value) || null;
});

const activeYear = computed(() => {
	return schoolYearStore.schoolYears.find((y) => y.isActive);
});

const studentPhoto = computed(() => {
	if (!student.value) return "https://randomuser.me/api/portraits/men/1.jpg";
	return (
		student.value.photoUrl || "https://randomuser.me/api/portraits/men/1.jpg"
	);
});

const setActiveTab = (tab: TabKey) => {
	activeTab.value = tab;
};

const handleEdit = () => {
	if (student.value) {
		router.push(`/dashboard/students/edit/${student.value.id}`);
	}
};

onMounted(async () => {
	await schoolYearStore.fetchSchoolYears();

	if (studentId.value) {
		isLoading.value = true;
		const success = await studentStore.fetchStudentById(studentId.value);
		if (!success) {
			toast.error("Erreur lors du chargement de l'élève");
			router.push("/dashboard/students/list");
		}
		isLoading.value = false;
	}
});
</script>

<template>
	<div v-if="isLoading" class="flex justify-center items-center py-20">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>

	<div v-else-if="!student" class="text-center py-12">
		<p class="text-gray-500">Élève non trouvé</p>
	</div>

	<div v-else class="space-y-4 lg:space-y-6">
		<button
			@click="router.push('/dashboard/students/list')"
			class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
		>
			<font-awesome-icon icon="arrow-left" />
			<span>Retour à la liste</span>
		</button>

		<div
			class="mt-2 relative space-y-1 bg-primary text-white p-8 rounded-lg w-full grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16"
		>
			<div class="md:col-span-3 flex flex-col xs:flex-row gap-6">
				<div>
					<img
						:src="studentPhoto"
						:alt="`${student.firstName} ${student.lastName}`"
						class="rounded-lg"
					/>
				</div>
				<div class="space-y- w-full">
					<h6
						class="text-white bg-background/20 rounded-full w-fit px-6 py-2 text-[0.7em] uppercase tracking-widest font-bold"
					>
						Fiche élève
					</h6>
					<div>
						<h2 class="text-xl font-extrabold">
							{{ student.firstName }} {{ student.lastName }}
						</h2>
						<h3>Matricule : {{ student.matricule }}</h3>
					</div>

					<div
						class="mt-4 pt-6 border-t border-gray-200/50 grid grid-cols-2 gap-4 w-full"
					>
						<div class="space-y-2">
							<h5
								class="font-light text-[0.7em] uppercase tracking-widest text-gray-200"
							>
								classe actuelle
							</h5>
							<p class="font-bold">{{ student.className || "Non classé" }}</p>
						</div>
						<div class="space-y-2">
							<h5
								class="font-light text-[0.7em] uppercase tracking-widest text-gray-200"
							>
								Année scolaire
							</h5>
							<p class="font-bold">{{ activeYear?.name || "-" }}</p>
						</div>
					</div>
				</div>
			</div>

			<div class="md:col-span-1 flex max-md:justify-end md:flex-col gap-4">
				<button
					@click="handleEdit"
					class="bg-background text-gray-700 hover:bg-background/90"
				>
					<font-awesome-icon icon="edit" class="mr-2" />
					<span class="max-xs:hidden">Modifier</span>
				</button>
				<button class="bg-background/20 hover:bg-background/10">
					<font-awesome-icon icon="download" class="mr-2" />
					<span class="max-xs:hidden">Télécharger</span>
				</button>
				<button class="bg-background/20 hover:bg-background/10">
					<font-awesome-icon icon="history" class="mr-2" />
					<span class="max-xs:hidden">Historique</span>
				</button>
			</div>
		</div>

		<div class="mt-8 tabs tabs-boxed bg-white border-b pb-4 border-gray-300">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				:class="['tab', { 'tab-active': activeTab === tab.key }]"
				@click="setActiveTab(tab.key)"
			>
				{{ tab.label }}
			</button>
		</div>

		<div class="my-8">
			<StudentProfileTab v-if="activeTab === 'profile'" :student="student" />
			<StudentSchoolPathTab
				v-else-if="activeTab === 'schoolPath'"
				:studentId="studentId"
			/>
			<StudentGuardiansTab v-else-if="activeTab === 'guardians'" :studentId="studentId" />
			<StudentGradesTab v-else-if="activeTab === 'grades'" />
			<StudentAttendanceTab v-else-if="activeTab === 'attendance'" />
			<StudentFinanceTab v-else-if="activeTab === 'finance'" />
			<StudentDocumentsTab v-else-if="activeTab === 'documents'" />
			<StudentServicesTab v-else-if="activeTab === 'services'" />
			<StudentAnalyticsTab v-else-if="activeTab === 'analytics'" />
		</div>
	</div>
</template>
