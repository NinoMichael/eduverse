<script lang="ts" setup>
import { computed } from "vue";
import type { Student } from "@/types/student";

const props = defineProps<{
	student: Student;
}>();

const formatDate = (dateStr: string): string => {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	return date.toLocaleDateString("fr-FR");
};

const calculateEnrollmentYears = (enrollmentDate: string): number => {
	if (!enrollmentDate) return 0;
	const enrollDate = new Date(enrollmentDate);
	const currentDate = new Date();
	const diffTime = Math.abs(currentDate.getTime() - enrollDate.getTime());
	const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
	return diffYears || 1;
};

const genderLabel = computed(() => {
	return props.student.gender === "male" ? "Masculin" : "Féminin";
});
</script>

<template>
	<section class="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="bg-white rounded-lg p-6 border-l-4 border-primary shadow">
			<h3 class="text-base font-extrabold">
				<font-awesome-icon icon="user" class="mr-2" />
				<span>Information d'identité</span>
			</h3>

			<div class="mt-6 grid grid-cols-1 xs:grid-cols-2 gap-4">
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Nom</span>
					</label>
					<p class="uppercase">{{ student.lastName }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Prénoms</span>
					</label>
					<p class="capitalize">{{ student.firstName }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Sexe</span>
					</label>
					<p>{{ genderLabel }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Date de naissance</span>
					</label>
					<p>{{ formatDate(student.dateOfBirth) }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Lieu de naissance</span>
					</label>
					<p>{{ student.placeOfBirth }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Domicile</span>
					</label>
					<p>{{ student.address }}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg p-6 border-l-4 border-primary shadow">
			<h3 class="text-base font-extrabold">
				<font-awesome-icon icon="file-pen" class="mr-2" />
				<span>Détail d'inscription</span>
			</h3>

			<div class="mt-6 grid grid-cols-1 xs:grid-cols-2 gap-4">
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Date d'inscription initiale</span>
					</label>
					<p>{{ formatDate(student.enrollmentDate) }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Période de scolarité</span>
					</label>
					<p>{{ calculateEnrollmentYears(student.enrollmentDate) }} an(s)</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Matricule</span>
					</label>
					<p class="uppercase">{{ student.matricule }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Numéro interne en classe</span>
					</label>
					<p>-</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Dernière classe fréquenté</span>
					</label>
					<p>{{ student.className || "-" }}</p>
				</div>
				<div class="space-y-3">
					<label class="font-medium opacity-90 text-primary">
						<span>Dernier établissement fréquenté</span>
					</label>
					<p>{{ student.schoolHistory?.previousSchool || "Aucun" }}</p>
				</div>
			</div>
		</div>
	</section>
</template>